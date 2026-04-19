<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';
import { useEventQuerySync } from '../lib/eventFlow';

const route = useRoute();
const router = useRouter();

const events = ref([]);
const selectedEventId = ref('');
const guests = ref([]);
const loading = ref(false);
const error = ref('');
const csv = ref('name,email,phone,party_size\n');
const notice = ref('');
const bulkSending = ref(false);

const form = ref({
    name: '',
    email: '',
    phone: '',
    party_size: 1,
});

useEventQuerySync({ route, router, selectedEventId });

const loadEvents = async () => {
    const { data } = await api.get('/events');
    events.value = data.data?.data ?? [];
    if (!selectedEventId.value && events.value.length > 0) {
        selectedEventId.value = String(events.value[0].id);
    }
};

const loadGuests = async () => {
    if (!selectedEventId.value) {
        guests.value = [];
        return;
    }

    loading.value = true;
    error.value = '';
    notice.value = '';

    try {
        const { data } = await api.get('/guests', { params: { event_id: selectedEventId.value } });
        guests.value = data.data?.data ?? [];
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load guests.';
    } finally {
        loading.value = false;
    }
};

const addGuest = async () => {
    error.value = '';
    notice.value = '';
    try {
        await api.post('/guests', {
            event_id: Number(selectedEventId.value),
            ...form.value,
        });
        form.value = { name: '', email: '', phone: '', party_size: 1 };
        notice.value = 'Guest added successfully.';
        await loadGuests();
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to create guest.';
    }
};

const deleteGuest = async (id) => {
    await api.delete(`/guests/${id}`);
    await loadGuests();
};

const uploadCsv = async () => {
    error.value = '';
    notice.value = '';
    try {
        const { data } = await api.post('/guests/upload', {
            event_id: Number(selectedEventId.value),
            csv: csv.value,
        });
        notice.value = data.message || 'Guest list imported.';
        await loadGuests();
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to upload CSV.';
    }
};

const createInvitationsAndSend = async () => {
    error.value = '';
    notice.value = '';
    bulkSending.value = true;

    try {
        const { data } = await api.post('/invitations/bulk-from-guests', {
            event_id: Number(selectedEventId.value),
        });

        const summary = data.data || {};
        notice.value = `Bulk send complete. Created ${summary.created_count || 0}, sent ${summary.sent_count || 0}, failed ${summary.failed_count || 0}, skipped ${summary.skipped_count || 0}.`;
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to create invitations from guests.';
    } finally {
        bulkSending.value = false;
    }
};

onMounted(async () => {
    await loadEvents();
    await loadGuests();
});
</script>

<template>
    <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 class="text-lg font-semibold text-white">Guest List Management</h2>

            <label class="mt-4 grid gap-2 text-sm text-slate-300">
                <span>Event</span>
                <select v-model="selectedEventId" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2" @change="loadGuests">
                    <option v-for="event in events" :key="event.id" :value="String(event.id)">{{ event.title }}</option>
                </select>
            </label>

            <form class="mt-4 grid gap-3" @submit.prevent="addGuest">
                <input v-model="form.name" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Guest name" required>
                <input v-model="form.email" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Email">
                <input v-model="form.phone" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Phone">
                <input v-model.number="form.party_size" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" min="1" type="number" placeholder="Party size">
                <button class="rounded-md bg-amber-400 px-3 py-2 font-semibold text-slate-950" type="submit">Add Guest</button>
            </form>

            <div class="mt-6 grid gap-2">
                <label class="text-sm text-slate-300">CSV Upload</label>
                <textarea v-model="csv" class="min-h-32 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200" />
                <button class="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" type="button" @click="uploadCsv">Import CSV</button>
                <button class="rounded-md border border-emerald-700 bg-emerald-900/30 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-60" :disabled="!selectedEventId || bulkSending" type="button" @click="createInvitationsAndSend">{{ bulkSending ? 'Sending WhatsApp...' : 'Create Invitations & Send WhatsApp' }}</button>
            </div>
        </article>

        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div class="mb-3 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-white">Guests</h2>
                <button class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300" @click="loadGuests">Refresh</button>
            </div>

            <p v-if="loading" class="text-sm text-slate-400">Loading guests...</p>
            <p v-if="error" class="mb-3 rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>
            <p v-if="notice" class="mb-3 rounded-md border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">{{ notice }}</p>

            <ul class="grid gap-3">
                <li v-for="guest in guests" :key="guest.id" class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <div>
                        <h3 class="font-semibold text-white">{{ guest.name }}</h3>
                        <p class="text-xs text-slate-400">{{ guest.email || 'No email' }} | {{ guest.phone || 'No phone' }} | party {{ guest.party_size }}</p>
                    </div>
                    <button class="rounded-md border border-rose-700 px-3 py-1 text-xs text-rose-300" @click="deleteGuest(guest.id)">Delete</button>
                </li>
                <li v-if="!loading && guests.length === 0" class="text-sm text-slate-500">No guests yet.</li>
            </ul>
        </article>
    </section>
</template>
