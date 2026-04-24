<script setup>
import { computed, onMounted, ref } from 'vue';
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

const parseDraft = (raw) => {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const normalizeJsonObject = (value) => {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }

    return {};
};

const getTemplateDraftForEvent = (eventId) => {
    if (typeof window === 'undefined') return null;

    const eventDraft = parseDraft(
        eventId ? window.localStorage.getItem(`marasim_template_draft_${eventId}`) : null
    );

    if (eventDraft?.template_id) {
        return {
            ...eventDraft,
            source: 'event',
        };
    }

    const globalDraft = parseDraft(window.localStorage.getItem('marasim_template_draft_global'));
    if (!globalDraft?.template_id) return null;

    if (eventId && globalDraft.event_id && String(globalDraft.event_id) !== String(eventId)) {
        return null;
    }

    return {
        ...globalDraft,
        source: 'global',
        // If global draft is not bound to an event, keep style only (avoid stale sample content).
        template_data: globalDraft.event_id ? (globalDraft.template_data ?? {}) : {},
    };
};

useEventQuerySync({ route, router, selectedEventId });

const templateNames = {
    royal: 'Royal Ceremony',
    garden: 'Garden Soiree',
    modern: 'Modern Glow',
    minimal: 'Minimal Monograph',
    gala: 'Midnight Gala',
    professional: 'Executive Brief',
};

const getSavedEventTemplate = (eventId) => {
    if (!eventId) return null;

    const event = events.value.find((item) => Number(item.id) === Number(eventId));
    if (!event?.template_id) return null;

    return {
        event_id: event.id,
        template_id: event.template_id,
        template_data: normalizeJsonObject(event.template_data),
        template_customization: normalizeJsonObject(event.template_customization),
        source: 'event_saved',
    };
};

const activeDraft = computed(() => {
    if (typeof window === 'undefined') return null;
    const eventId = Number(selectedEventId.value) || null;

    return getSavedEventTemplate(eventId) || getTemplateDraftForEvent(eventId);
});

const activeTemplateName = computed(() => {
    const id = activeDraft.value?.template_id;
    return id ? (templateNames[id] || id) : null;
});

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

const describeWhatsAppFailure = (whatsapp) => {
    if (whatsapp?.reason === 'twilio_whatsapp_rejected_63016' || String(whatsapp?.twilio_code || '') === '63016') {
        return 'Twilio rejected the WhatsApp message (63016). If using sandbox, join it first; for production, use an approved sender and template/session-compliant message.';
    }

    if (whatsapp?.reason === 'twilio_sender_not_ready' || String(whatsapp?.twilio_code || '') === '63007') {
        return 'Twilio sender is not ready (63007). Approve/enroll your WhatsApp sender in Twilio before sending invitations.';
    }

    if (!whatsapp?.reason && String(whatsapp?.status || '').toLowerCase() === 'submitted') {
        return 'Twilio accepted the message and queued it. Delivery confirmation is still pending.';
    }

    return `WhatsApp failed (${whatsapp?.reason || 'unknown_error'})`;
};

const describeDeliveryError = (reason) => {
    if (!reason) {
        return '';
    }

    if (reason === 'twilio_sender_not_ready') {
        return 'Twilio sender is not ready. Complete WhatsApp sender approval in Twilio.';
    }

    if (reason === 'twilio_whatsapp_rejected_63016') {
        return 'WhatsApp delivery rejected by Twilio (63016). Verify sandbox enrollment or approved sender/template setup.';
    }

    if (reason === 'twilio_auth_failed') {
        return 'Twilio authentication failed. Check account SID and auth token.';
    }

    if (reason === 'twilio_not_configured') {
        return 'Twilio is not configured. Set WhatsApp sender and credentials.';
    }

    if (reason === 'missing_or_invalid_phone') {
        return 'Guest phone is missing or invalid.';
    }

    if (reason === 'twilio_exception') {
        return 'Network or SSL exception while contacting Twilio.';
    }

    return reason;
};

const createInvitation = async () => {
    error.value = '';
    shareMessage.value = '';
    try {
        const eventId = Number(selectedEventId.value);
        const templateDraft = getSavedEventTemplate(eventId) || getTemplateDraftForEvent(eventId);
        const payload = {
            event_id: eventId,
            ...form.value,
        };

        if (templateDraft?.template_id) {
            payload.template_id = templateDraft.template_id;
            const templateData = {
                ...(templateDraft.template_data ?? {}),
                // Ensure per-invitation guest name always reflects the current form value.
                guest_name: form.value.guest_name || templateDraft.template_data?.guest_name || '',
            };

            payload.template_data = JSON.stringify(templateData);
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
        } else if (whatsapp.submitted || String(whatsapp.status || '').toLowerCase() === 'submitted') {
            const twilioStatus = whatsapp.twilio_status ? ` (Twilio: ${whatsapp.twilio_status})` : '';
            shareMessage.value = `Invitation created and submitted to Twilio${twilioStatus}. Delivery is pending: ${shareUrl}`;
        } else if (whatsapp.attempted) {
            shareMessage.value = `Invitation created, but ${describeWhatsAppFailure(whatsapp)}. You can still share manually: ${shareUrl}`;
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
    } else if (whatsapp.submitted || String(whatsapp.status || '').toLowerCase() === 'submitted') {
        const twilioStatus = whatsapp.twilio_status ? ` (Twilio: ${whatsapp.twilio_status})` : '';
        shareMessage.value = `Share URL copied and submitted to Twilio${twilioStatus}. Delivery is pending: ${shareUrl}`;
    } else if (whatsapp.attempted) {
        shareMessage.value = `Share URL copied, but ${describeWhatsAppFailure(whatsapp)}: ${shareUrl}`;
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
                1) Pick event → 2) Open Template Studio → 3) Return here and create invitation records → 4) Share links.
            </div>

            <div v-if="activeTemplateName" class="mt-3 flex items-center gap-2 rounded-xl border border-emerald-800/50 bg-emerald-950/40 p-3 text-xs text-emerald-200">
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Template ready: <strong>{{ activeTemplateName }}</strong> — saved design will be applied to new invitations</span>
            </div>
            <div v-else class="mt-3 flex items-center gap-2 rounded-xl border border-amber-800/50 bg-amber-950/30 p-3 text-xs text-amber-300">
                <span class="h-2 w-2 rounded-full bg-amber-400"></span>
                <span>No template selected — <RouterLink :to="{ name: 'template-studio', params: { locale: route.params.locale || 'en' }, query: selectedEventId ? { event_id: selectedEventId } : {} }" class="underline">Open Template Studio</RouterLink> to design one</span>
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
            <p v-if="shareMessage" class="mb-3 rounded-md border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">{{ shareMessage }}</p>

            <ul class="grid gap-3">
                <li v-for="invitation in invitations" :key="invitation.id" class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <div>
                        <h3 class="font-semibold text-white">{{ invitation.guest_name }}</h3>
                        <p class="text-xs text-slate-400">{{ invitation.guest_email }} | {{ invitation.status }} | {{ invitation.invitation_code }}</p>
                        <p class="mt-1 text-xs text-slate-500">{{ invitation.guest_phone || 'No phone' }} | delivery {{ invitation.delivery_status || 'not_sent' }}<span v-if="invitation.delivery_last_attempt_at"> | last attempt {{ new Date(invitation.delivery_last_attempt_at).toLocaleString() }}</span></p>
                        <p v-if="invitation.delivery_error" class="mt-1 text-xs text-rose-300">{{ describeDeliveryError(invitation.delivery_error) }}</p>
                    </div>
                    <button class="rounded-md border border-blue-700 px-3 py-1 text-xs text-blue-300" @click="shareInvitation(invitation.id)">Share / WhatsApp</button>
                </li>
                <li v-if="!loading && invitations.length === 0" class="text-sm text-slate-500">No invitations yet.</li>
            </ul>
        </article>
    </section>
</template>
