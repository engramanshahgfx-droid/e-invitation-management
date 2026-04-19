<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';
import { useEventQuerySync } from '../lib/eventFlow';

const route = useRoute();
const router = useRouter();

const events = ref([]);
const selectedEventId = ref('');
const checkIns = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');

const form = ref({
    guest_name: '',
    invitation_code: '',
    method: 'qr_code',
});

useEventQuerySync({ route, router, selectedEventId });

const loadEvents = async () => {
    const { data } = await api.get('/events');
    events.value = data.data?.data ?? [];
    if (!selectedEventId.value && events.value.length > 0) {
        selectedEventId.value = String(events.value[0].id);
    }
};

const loadCheckIns = async () => {
    if (!selectedEventId.value) {
        checkIns.value = [];
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.get(`/events/${selectedEventId.value}/check-ins`);
        checkIns.value = data.data?.data ?? [];
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load check-ins.';
    } finally {
        loading.value = false;
    }
};

const runCheckIn = async () => {
    error.value = '';
    success.value = '';

    try {
        const payload = {
            guest_name: form.value.guest_name,
            method: form.value.method,
        };

        if (form.value.invitation_code) {
            payload.invitation_code = form.value.invitation_code;
        }

        await api.post(`/events/${selectedEventId.value}/check-ins`, payload);
        success.value = 'Guest checked in successfully.';
        form.value.guest_name = '';
        form.value.invitation_code = '';
        await loadCheckIns();
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to check-in guest.';
    }
};

onMounted(async () => {
    await loadEvents();
    await loadCheckIns();
});
</script>

<template>
    <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 class="text-lg font-semibold text-white">QR Check-in System</h2>

            <label class="mt-4 grid gap-2 text-sm text-slate-300">
                <span>Event</span>
                <select v-model="selectedEventId" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2" @change="loadCheckIns">
                    <option v-for="event in events" :key="event.id" :value="String(event.id)">{{ event.title }}</option>
                </select>
            </label>

            <form class="mt-4 grid gap-3" @submit.prevent="runCheckIn">
                <input v-model="form.guest_name" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Guest display name" required>
                <input v-model="form.invitation_code" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Invitation code (optional)">
                <select v-model="form.method" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                    <option value="qr_code">QR Code</option>
                    <option value="manual">Manual</option>
                </select>
                <button class="rounded-md bg-amber-400 px-3 py-2 font-semibold text-slate-950" type="submit">Check In</button>
            </form>

            <p v-if="success" class="mt-3 rounded-md border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">{{ success }}</p>
            <p v-if="error" class="mt-3 rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>
        </article>

        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div class="mb-3 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-white">Live Check-ins</h2>
                <button class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300" @click="loadCheckIns">Refresh</button>
            </div>

            <p v-if="loading" class="text-sm text-slate-400">Loading check-ins...</p>

            <ul class="grid gap-3">
                <li v-for="item in checkIns" :key="item.id" class="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <h3 class="font-semibold text-white">{{ item.guest_name }}</h3>
                    <p class="text-xs text-slate-400">{{ item.method }} | {{ item.checked_in_at }}</p>
                </li>
                <li v-if="!loading && checkIns.length === 0" class="text-sm text-slate-500">No check-ins yet.</li>
            </ul>
        </article>
    </section>
</template>
