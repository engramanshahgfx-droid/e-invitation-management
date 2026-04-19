<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../lib/api';

const route = useRoute();
const loading = ref(true);
const error = ref('');
const invitation = ref(null);
const status = ref('accepted');
const done = ref(false);

const code = computed(() => route.params.code);

const loadInvitation = async () => {
    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.get(`/invitations/shared/${code.value}`);
        invitation.value = data.data;
        const s = invitation.value.status;
        status.value = (s === 'accepted' || s === 'declined' || s === 'attending') ? s : 'accepted';
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Invitation not found.';
    } finally {
        loading.value = false;
    }
};

const submitRsvp = async () => {
    error.value = '';
    done.value = false;

    try {
        await api.post(`/invitations/shared/${code.value}/rsvp`, { status: status.value });
        done.value = true;
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to submit RSVP.';
    }
};

onMounted(loadInvitation);
</script>

<template>
    <main class="mx-auto max-w-2xl px-4 py-10">
        <section class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <p v-if="loading" class="text-sm text-slate-400">Loading invitation...</p>
            <p v-if="error" class="rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>

            <div v-if="invitation && !loading" class="grid gap-4">
                <p class="text-xs uppercase tracking-[0.2em] text-amber-300">You're Invited</p>
                <h1 class="text-2xl font-bold text-white">{{ invitation.event_title }}</h1>
                <p class="text-sm text-slate-300">Guest: {{ invitation.guest_name }}</p>
                <p class="text-sm text-slate-400">{{ invitation.event_date || 'Date TBA' }} {{ invitation.event_location ? `| ${invitation.event_location}` : '' }}</p>
                <div class="rounded-xl border border-cyan-900/40 bg-cyan-950/20 px-4 py-3 text-sm text-cyan-100">
                    <p class="font-semibold">Organizer WhatsApp</p>
                    <p class="mt-1">{{ invitation.organizer_name || 'Organizer' }}</p>
                    <p class="mt-1">{{ invitation.organizer_phone || 'Contact will be shared by the organizer.' }}</p>
                </div>

                <label class="grid gap-2 text-sm text-slate-300">
                    <span>RSVP Status</span>
                    <select v-model="status" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                        <option value="accepted">Accepted</option>
                        <option value="attending">Attending</option>
                        <option value="declined">Declined</option>
                    </select>
                </label>

                <button class="rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-950" type="button" @click="submitRsvp">Submit RSVP</button>
                <p v-if="done" class="rounded-md border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">Your RSVP has been saved.</p>
            </div>
        </section>
    </main>
</template>
