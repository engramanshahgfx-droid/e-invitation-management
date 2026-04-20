<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';
import { useEventQuerySync } from '../lib/eventFlow';

const route = useRoute();
const router = useRouter();

const events = ref([]);
const invitations = ref([]);
const selectedEventId = ref('');
const loading = ref(false);
const error = ref('');
const shareMessage = ref('');

const form = ref({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
});

const getTemplateDraftForEvent = (eventId) => {
    if (!eventId || typeof window === 'undefined') {
        return null;
    }

    const raw = window.localStorage.getItem(`marasim_template_draft_${eventId}`);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

useEventQuerySync({ route, router, selectedEventId });

const loadEvents = async () => {
    const { data } = await api.get('/events');
    events.value = data.data?.data ?? [];
    if (!selectedEventId.value && events.value.length > 0) {
        selectedEventId.value = String(events.value[0].id);
    }
};

const loadInvitations = async () => {
    loading.value = true;
    error.value = '';
    shareMessage.value = '';

    try {
        const { data } = await api.get('/invitations', {
            params: selectedEventId.value ? { event_id: selectedEventId.value } : {},
        });
        invitations.value = data.data?.data ?? [];
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load invitations.';
    } finally {
        loading.value = false;
    }
};

const createInvitation = async () => {
    error.value = '';
    shareMessage.value = '';
    try {
        const eventId = Number(selectedEventId.value);
        const templateDraft = getTemplateDraftForEvent(eventId);
        const payload = {
            event_id: eventId,
            ...form.value,
        };

        if (templateDraft?.template_id) {
            payload.template_id = templateDraft.template_id;
            payload.template_data = JSON.stringify(templateDraft.template_data ?? {});
            payload.template_customization = JSON.stringify(templateDraft.template_customization ?? {});
        }

        const { data } = await api.post('/invitations', {
            ...payload,
        });

        const invitationData = data.data || {};
        const shareUrl = invitationData.public_url || '';
        const whatsapp = invitationData.whatsapp || {};

        if (whatsapp.sent) {
            shareMessage.value = `Invitation created and WhatsApp sent to ${whatsapp.to}: ${shareUrl}`;
        } else if (whatsapp.attempted) {
            shareMessage.value = `Invitation created, but WhatsApp failed (${whatsapp.reason || 'unknown_error'}). You can still share manually: ${shareUrl}`;
        } else if (whatsapp.reason === 'missing_or_invalid_phone') {
            shareMessage.value = `Invitation created. WhatsApp was skipped because guest phone is missing or invalid (+countrycode required).`;
        } else if (whatsapp.reason === 'twilio_not_configured') {
            shareMessage.value = `Invitation created. Configure Twilio WhatsApp to send automatically.`;
        } else {
            shareMessage.value = data.message || 'Invitation created successfully.';
        }

        form.value = { guest_name: '', guest_email: '', guest_phone: '' };
        await loadInvitations();
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to create invitation.';
    }
};

const shareInvitation = async (invitationId) => {
    const { data } = await api.post(`/invitations/${invitationId}/share`);
    const shareUrl = data.data?.public_url || '';
    const whatsapp = data.data?.whatsapp || {};

    if (whatsapp.sent) {
        shareMessage.value = `Share URL copied and WhatsApp sent to ${whatsapp.to}: ${shareUrl}`;
    } else if (whatsapp.attempted) {
        shareMessage.value = `Share URL copied, but WhatsApp failed (${whatsapp.reason || 'unknown_error'}): ${shareUrl}`;
    } else if (whatsapp.reason === 'missing_or_invalid_phone') {
        shareMessage.value = `Share URL copied. WhatsApp was skipped because guest phone is missing or invalid (+countrycode required): ${shareUrl}`;
    } else if (whatsapp.reason === 'twilio_not_configured') {
        shareMessage.value = `Share URL copied. Configure Twilio WhatsApp to send directly: ${shareUrl}`;
    } else {
        shareMessage.value = shareUrl;
    }

    if (shareUrl && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
    }
};

onMounted(async () => {
    await loadEvents();
    await loadInvitations();
});
</script>

<template>
    <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h2 class="text-lg font-semibold text-white">Invitation Builder</h2>
                    <p class="mt-1 text-sm text-slate-400">Create invitation records and generate shareable links.</p>
                </div>
                <RouterLink
                    :to="{ name: 'template-studio', params: { locale: route.params.locale || 'en' }, query: selectedEventId ? { event_id: selectedEventId } : {} }"
                    class="rounded-lg border border-amber-400/60 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/20"
                >
                    Open Template Studio
                </RouterLink>
            </div>

            <label class="mt-4 grid gap-2 text-sm text-slate-300">
                <span>Event</span>
                <select v-model="selectedEventId" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2" @change="loadInvitations">
                    <option v-for="event in events" :key="event.id" :value="String(event.id)">{{ event.title }}</option>
                </select>
            </label>

            <div class="mt-4 rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-xs text-blue-200">
                1) Pick event -> 2) Open Template Studio -> 3) Return and create invitation records -> 4) Share links.
            </div>

            <form class="mt-4 grid gap-3" @submit.prevent="createInvitation">
                <input v-model="form.guest_name" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Guest name" required>
                <input v-model="form.guest_email" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Guest email" required>
                <input v-model="form.guest_phone" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Guest phone">
                <button class="rounded-md bg-amber-400 px-3 py-2 font-semibold text-slate-950" type="submit">Create Invitation</button>
            </form>
        </article>

        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div class="mb-3 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-white">Invitations</h2>
                <button class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300" @click="loadInvitations">Refresh</button>
            </div>

            <p v-if="loading" class="text-sm text-slate-400">Loading invitations...</p>
            <p v-if="error" class="mb-3 rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>
            <p v-if="shareMessage" class="mb-3 rounded-md border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">Share URL copied: {{ shareMessage }}</p>

            <ul class="grid gap-3">
                <li v-for="invitation in invitations" :key="invitation.id" class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <div>
                        <h3 class="font-semibold text-white">{{ invitation.guest_name }}</h3>
                        <p class="text-xs text-slate-400">{{ invitation.guest_email }} | {{ invitation.status }} | {{ invitation.invitation_code }}</p>
                        <p class="mt-1 text-xs text-slate-500">{{ invitation.guest_phone || 'No phone' }} | delivery {{ invitation.delivery_status || 'not_sent' }}<span v-if="invitation.delivery_last_attempt_at"> | last attempt {{ new Date(invitation.delivery_last_attempt_at).toLocaleString() }}</span></p>
                        <p v-if="invitation.delivery_error" class="mt-1 text-xs text-rose-300">{{ invitation.delivery_error }}</p>
                    </div>
                    <button class="rounded-md border border-blue-700 px-3 py-1 text-xs text-blue-300" @click="shareInvitation(invitation.id)">Share / WhatsApp</button>
                </li>
                <li v-if="!loading && invitations.length === 0" class="text-sm text-slate-500">No invitations yet.</li>
            </ul>
        </article>
    </section>
</template>
