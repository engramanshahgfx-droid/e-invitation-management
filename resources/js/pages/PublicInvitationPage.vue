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
const template = computed(() => invitation.value?.template ?? {});

const templateConfigs = [
    { id: 'royal',         fontFamily: '"Cormorant Garamond", Georgia, serif',           palette: { primary: '#231942', secondary: '#d4af37', accent: '#f3e9d2', background: '#f8f3ea' } },
    { id: 'garden',        fontFamily: '"Playfair Display", Georgia, serif',             palette: { primary: '#355c4b', secondary: '#d99f8c', accent: '#f3d8c7', background: '#fbf6f1' } },
    { id: 'modern',        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',          palette: { primary: '#0f172a', secondary: '#2563eb', accent: '#7dd3fc', background: '#e0f2fe' } },
    { id: 'minimal',       fontFamily: '"Helvetica Neue", "Arial Narrow", sans-serif',   palette: { primary: '#111111', secondary: '#5c5c5c', accent: '#d4d4d4', background: '#f7f7f5' } },
    { id: 'gala',          fontFamily: '"Didot", "Times New Roman", serif',              palette: { primary: '#f8fafc', secondary: '#f59e0b', accent: '#7c3aed', background: '#020617' } },
    { id: 'professional',  fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',        palette: { primary: '#0b1f3a', secondary: '#1d4ed8', accent: '#bfdbfe', background: '#eff6ff' } },
];

const normalizeJsonObject = (value) => {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch { return {}; }
    }
    return {};
};

const templateId = computed(() => template.value?.template_id || 'gala');
const templateData = computed(() => normalizeJsonObject(template.value?.template_data));
const templateCustomization = computed(() => normalizeJsonObject(template.value?.template_customization));

const activeTemplateConfig = computed(() => templateConfigs.find(t => t.id === templateId.value) || templateConfigs.find(t => t.id === 'gala'));

const templateColors = computed(() => {
    const saved = templateCustomization.value?.colors;
    const defaults = activeTemplateConfig.value.palette;
    return {
        primary:    saved?.primary    || defaults.primary,
        secondary:  saved?.secondary  || defaults.secondary,
        accent:     saved?.accent     || defaults.accent,
        background: saved?.background || defaults.background,
    };
});

const titleText       = computed(() => templateData.value.event_name  || invitation.value?.event_title    || 'Invitation');
const guestText       = computed(() => templateData.value.guest_name  || invitation.value?.guest_name     || 'Guest');
const descriptionText = computed(() => templateData.value.description || invitation.value?.event_description || 'You are invited to celebrate this special event.');
const hostText        = computed(() => templateData.value.host_name   || invitation.value?.organizer_name || 'Organizer');
const venueText       = computed(() => templateData.value.location    || invitation.value?.event_location || 'Location TBA');
const dateText        = computed(() => templateData.value.date        || invitation.value?.event_date     || 'Date TBA');
const timeText        = computed(() => templateData.value.time        || invitation.value?.event_time     || '');
const dressCodeText   = computed(() => templateData.value.dress_code  || 'Formal Attire');
const rsvpByText      = computed(() => templateData.value.rsvp_by    || '');
const specialNoteText = computed(() => templateData.value.special_note || '');

function formatDate(value) {
    if (!value) return '---';
    try {
        return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
    } catch { return value; }
}

function formatTime(value) {
    if (!value) return '---';
    const [hours, minutes] = value.split(':');
    if (!hours || !minutes) return value;
    try {
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(2026, 0, 1, Number(hours), Number(minutes)));
    } catch { return value; }
}

const detailCards = computed(() => [
    { label: 'Date',     value: formatDate(dateText.value) },
    { label: 'Time',     value: formatTime(timeText.value) },
    { label: 'Location', value: venueText.value },
    { label: 'RSVP by',  value: formatDate(rsvpByText.value) },
]
);


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
        <p v-if="loading" class="text-sm text-slate-400">Loading invitation...</p>
        <p v-if="error" class="rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>

        <div v-if="invitation && !loading" class="grid gap-6">
            <!-- ── Template Card ── -->
            <div class="overflow-hidden rounded-[2rem] border shadow-2xl"
                :style="{ borderColor: `${templateColors.secondary}66`, fontFamily: activeTemplateConfig.fontFamily }">

                <!-- ROYAL -->
                <template v-if="templateId === 'royal'">
                    <div class="relative overflow-hidden px-8 py-10 text-center" :style="{ color: templateColors.primary, background: `linear-gradient(180deg, ${templateColors.background} 0%, #ffffff 100%)` }">
                        <div class="absolute inset-x-8 top-6 h-px" :style="{ backgroundColor: `${templateColors.secondary}66` }" />
                        <div class="absolute inset-x-8 bottom-6 h-px" :style="{ backgroundColor: `${templateColors.secondary}66` }" />
                        <p class="text-[11px] uppercase tracking-[0.45em]" :style="{ color: templateColors.secondary }">You're Invited</p>
                        <p class="mt-1 text-sm" :style="{ color: `${templateColors.primary}99` }">{{ guestText }}</p>
                        <h1 class="mt-6 text-5xl font-semibold leading-none">{{ titleText }}</h1>
                        <p class="mx-auto mt-4 max-w-lg text-base leading-7" :style="{ color: `${templateColors.primary}CC` }">{{ descriptionText }}</p>
                        <div class="mx-auto mt-8 grid max-w-xl gap-4 md:grid-cols-3">
                            <div v-for="card in detailCards.slice(0, 3)" :key="card.label" class="rounded-2xl border px-4 py-4" :style="{ borderColor: `${templateColors.secondary}55`, backgroundColor: `${templateColors.accent}22` }">
                                <p class="text-[11px] uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">{{ card.label }}</p>
                                <p class="mt-2 text-sm font-semibold leading-6">{{ card.value }}</p>
                            </div>
                        </div>
                        <div class="mx-auto mt-8 max-w-xl rounded-[1.75rem] border px-6 py-5" :style="{ borderColor: `${templateColors.primary}26` }">
                            <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Hosted by</p>
                            <p class="mt-2 text-lg">{{ hostText }}</p>
                            <p v-if="rsvpByText" class="mt-3 text-sm text-slate-600">RSVP by {{ formatDate(rsvpByText) }}</p>
                        </div>
                    </div>
                </template>

                <!-- GARDEN -->
                <template v-else-if="templateId === 'garden'">
                    <div class="relative overflow-hidden px-8 py-10" :style="{ background: `linear-gradient(180deg, ${templateColors.background}, #ffffff)` }">
                        <div class="absolute left-0 top-0 h-40 w-40 rounded-br-[7rem]" :style="{ backgroundColor: `${templateColors.accent}55` }" />
                        <div class="absolute bottom-0 right-0 h-48 w-48 rounded-tl-[8rem]" :style="{ backgroundColor: `${templateColors.secondary}22` }" />
                        <div class="relative z-10 mx-auto max-w-xl text-center" :style="{ color: templateColors.primary }">
                            <p class="text-[11px] uppercase tracking-[0.4em]" :style="{ color: templateColors.secondary }">You're Invited</p>
                            <p class="mt-1 text-sm" :style="{ color: `${templateColors.primary}99` }">{{ guestText }}</p>
                            <h1 class="mt-5 text-4xl font-semibold">{{ titleText }}</h1>
                            <p class="mt-3 text-base leading-7">{{ descriptionText }}</p>
                            <div class="mt-8 grid gap-4 text-left md:grid-cols-2">
                                <div class="rounded-[1.5rem] border bg-white/80 p-5 backdrop-blur" :style="{ borderColor: `${templateColors.secondary}40` }">
                                    <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Date</p>
                                    <p class="mt-2 text-xl font-semibold">{{ formatDate(dateText) }}</p>
                                    <p class="mt-4 text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Time</p>
                                    <p class="mt-2 text-sm font-medium">{{ formatTime(timeText) }}</p>
                                </div>
                                <div class="rounded-[1.5rem] border bg-white/80 p-5 backdrop-blur" :style="{ borderColor: `${templateColors.primary}20` }">
                                    <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Location</p>
                                    <p class="mt-2 text-sm leading-7">{{ venueText }}</p>
                                    <p class="mt-4 text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Attire</p>
                                    <p class="mt-2 text-sm font-medium">{{ dressCodeText }}</p>
                                </div>
                            </div>
                            <p class="mt-8 text-sm">Hosted by {{ hostText }}</p>
                        </div>
                    </div>
                </template>

                <!-- MODERN -->
                <template v-else-if="templateId === 'modern'">
                    <div class="relative overflow-hidden px-8 py-9" :style="{ background: `linear-gradient(145deg, ${templateColors.primary} 0%, ${templateColors.secondary} 58%, ${templateColors.accent} 130%)` }">
                        <div class="absolute -left-12 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                        <div class="absolute right-0 top-0 h-52 w-52 rounded-full bg-black/20 blur-2xl" />
                        <div class="relative z-10 rounded-[2rem] border border-white/15 bg-white/10 p-8 text-white backdrop-blur-md">
                            <div class="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p class="text-[11px] uppercase tracking-[0.35em] text-white/70">You're Invited — {{ guestText }}</p>
                                    <h1 class="mt-4 max-w-md text-4xl font-black leading-tight">{{ titleText }}</h1>
                                </div>
                                <div v-if="rsvpByText" class="rounded-2xl border border-white/20 bg-black/10 px-4 py-3 text-sm text-white/80">
                                    <p>RSVP by</p>
                                    <p class="mt-1 font-semibold text-white">{{ formatDate(rsvpByText) }}</p>
                                </div>
                            </div>
                            <p class="mt-6 max-w-xl text-base leading-7 text-white/85">{{ descriptionText }}</p>
                            <div class="mt-8 grid gap-4 md:grid-cols-3">
                                <div class="rounded-2xl bg-black/15 p-4">
                                    <p class="text-[11px] uppercase tracking-[0.25em] text-white/60">Date</p>
                                    <p class="mt-2 text-lg font-semibold">{{ formatDate(dateText) }}</p>
                                </div>
                                <div class="rounded-2xl bg-black/15 p-4">
                                    <p class="text-[11px] uppercase tracking-[0.25em] text-white/60">Time</p>
                                    <p class="mt-2 text-lg font-semibold">{{ formatTime(timeText) }}</p>
                                </div>
                                <div class="rounded-2xl bg-black/15 p-4">
                                    <p class="text-[11px] uppercase tracking-[0.25em] text-white/60">Attire</p>
                                    <p class="mt-2 text-lg font-semibold">{{ dressCodeText }}</p>
                                </div>
                            </div>
                            <div class="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-white/85">
                                <span>{{ venueText }}</span>
                                <span>Hosted by {{ hostText }}</span>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- MINIMAL -->
                <template v-else-if="templateId === 'minimal'">
                    <div class="px-8 py-10" :style="{ backgroundColor: templateColors.background, color: templateColors.primary }">
                        <div class="mx-auto max-w-xl border-t pt-6" :style="{ borderColor: `${templateColors.primary}25` }">
                            <p class="text-[11px] uppercase tracking-[0.45em]" :style="{ color: templateColors.secondary }">You're Invited</p>
                            <p class="mt-1 text-sm" :style="{ color: `${templateColors.primary}99` }">{{ guestText }}</p>
                            <h1 class="mt-8 text-4xl font-semibold tracking-tight">{{ titleText }}</h1>
                            <p class="mt-5 max-w-lg text-base leading-8" :style="{ color: `${templateColors.primary}CC` }">{{ descriptionText }}</p>
                            <div class="mt-10 grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
                                <div>
                                    <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Date</p>
                                    <p class="mt-2 text-sm font-semibold">{{ formatDate(dateText) }}</p>
                                    <p class="mt-6 text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Time</p>
                                    <p class="mt-2 text-sm font-semibold">{{ formatTime(timeText) }}</p>
                                </div>
                                <div>
                                    <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Location</p>
                                    <p class="mt-2 text-sm leading-7">{{ venueText }}</p>
                                    <p v-if="specialNoteText" class="mt-6 text-xs uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Note</p>
                                    <p v-if="specialNoteText" class="mt-2 text-sm leading-7">{{ specialNoteText }}</p>
                                </div>
                            </div>
                            <div class="mt-10 flex flex-wrap items-end justify-between gap-4 border-t pt-5 text-sm" :style="{ borderColor: `${templateColors.primary}20` }">
                                <span>Hosted by {{ hostText }}</span>
                                <span v-if="rsvpByText">RSVP by {{ formatDate(rsvpByText) }}</span>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- GALA -->
                <template v-else-if="templateId === 'gala'">
                    <div class="relative overflow-hidden px-8 py-10 text-white" :style="{ background: `linear-gradient(160deg, ${templateColors.background} 0%, #111827 50%, #000000 100%)` }">
                        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.22),transparent_35%)]" />
                        <div class="relative z-10 mx-auto max-w-xl rounded-[2rem] border p-8" :style="{ borderColor: `${templateColors.secondary}44`, backgroundColor: 'rgba(15,23,42,0.46)' }">
                            <p class="text-center text-[11px] uppercase tracking-[0.45em]" :style="{ color: templateColors.secondary }">You're Invited</p>
                            <p class="mt-1 text-center text-sm text-white/60">{{ guestText }}</p>
                            <h1 class="mt-5 text-center text-5xl font-semibold">{{ titleText }}</h1>
                            <p class="mx-auto mt-4 max-w-md text-center text-base leading-7 text-white/80">{{ descriptionText }}</p>
                            <div class="mt-8 grid gap-3 md:grid-cols-3">
                                <div v-for="card in detailCards.slice(0, 3)" :key="card.label" class="rounded-2xl border px-4 py-4 text-center" :style="{ borderColor: `${templateColors.secondary}33`, backgroundColor: 'rgba(255,255,255,0.04)' }">
                                    <p class="text-[11px] uppercase tracking-[0.25em] text-white/55">{{ card.label }}</p>
                                    <p class="mt-2 text-sm font-semibold text-white">{{ card.value }}</p>
                                </div>
                            </div>
                            <div class="mt-8 rounded-2xl px-5 py-4 text-sm" :style="{ backgroundColor: `${templateColors.secondary}15` }">
                                <div class="flex flex-wrap items-center justify-between gap-3">
                                    <span>Attire: {{ dressCodeText }}</span>
                                    <span>Hosted by {{ hostText }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- PROFESSIONAL (default) -->
                <template v-else>
                    <div class="px-8 py-10" :style="{ background: `linear-gradient(180deg, ${templateColors.background}, #ffffff)` }">
                        <div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                            <div>
                                <p class="text-[11px] uppercase tracking-[0.45em]" :style="{ color: templateColors.secondary }">You're Invited — {{ guestText }}</p>
                                <h1 class="mt-5 text-4xl font-bold leading-tight" :style="{ color: templateColors.primary }">{{ titleText }}</h1>
                                <p class="mt-4 max-w-xl text-base leading-7" :style="{ color: `${templateColors.primary}D9` }">{{ descriptionText }}</p>
                                <div class="mt-8 rounded-[1.5rem] border p-5" :style="{ borderColor: `${templateColors.secondary}35`, backgroundColor: '#ffffff' }">
                                    <p class="text-xs font-semibold uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Event Details</p>
                                    <div class="mt-4 grid gap-4 md:grid-cols-3">
                                        <div>
                                            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Date</p>
                                            <p class="mt-2 text-sm font-semibold" :style="{ color: templateColors.primary }">{{ formatDate(dateText) }}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Time</p>
                                            <p class="mt-2 text-sm font-semibold" :style="{ color: templateColors.primary }">{{ formatTime(timeText) }}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Attire</p>
                                            <p class="mt-2 text-sm font-semibold" :style="{ color: templateColors.primary }">{{ dressCodeText }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="rounded-[1.75rem] border p-6" :style="{ borderColor: `${templateColors.primary}18`, backgroundColor: '#ffffff' }">
                                <p class="text-xs font-semibold uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Location</p>
                                <p class="mt-3 text-sm leading-7" :style="{ color: templateColors.primary }">{{ venueText }}</p>
                                <p class="mt-6 text-xs font-semibold uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">Hosted by</p>
                                <p class="mt-3 text-sm font-semibold" :style="{ color: templateColors.primary }">{{ hostText }}</p>
                                <p v-if="rsvpByText" class="mt-6 text-xs font-semibold uppercase tracking-[0.25em]" :style="{ color: templateColors.secondary }">RSVP by</p>
                                <p v-if="rsvpByText" class="mt-3 text-sm font-semibold" :style="{ color: templateColors.primary }">{{ formatDate(rsvpByText) }}</p>
                                <div v-if="specialNoteText" class="mt-8 rounded-2xl px-4 py-3 text-sm" :style="{ backgroundColor: `${templateColors.accent}4D`, color: templateColors.primary }">{{ specialNoteText }}</div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <!-- ── Organizer Contact ── -->
            <div class="rounded-xl border border-cyan-900/40 bg-cyan-950/20 px-4 py-3 text-sm text-cyan-100">
                <p class="font-semibold">Organizer WhatsApp</p>
                <p class="mt-1">{{ invitation.organizer_name || 'Organizer' }}</p>
                <p class="mt-1">{{ invitation.organizer_phone || 'Contact will be shared by the organizer.' }}</p>
            </div>

            <!-- ── RSVP ── -->
            <div class="rounded-2xl border border-slate-700 bg-slate-950 p-6">
                <label class="grid gap-2 text-sm text-slate-300">
                    <span>RSVP Status</span>
                    <select v-model="status" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                        <option value="accepted">Accepted</option>
                        <option value="attending">Attending</option>
                        <option value="declined">Declined</option>
                    </select>
                </label>
                <button class="mt-4 w-full rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-950" type="button" @click="submitRsvp">Submit RSVP</button>
                <p v-if="done" class="mt-3 rounded-md border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">Your RSVP has been saved.</p>
            </div>
        </div>
    </main>
  
</template>
