<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../lib/api';

const route = useRoute();
const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const loading = ref(false);
const error = ref('');
const event = ref(null);
const stats = ref(null);

const eventId = computed(() => route.params.id);

const links = computed(() => [
    { label: 'Guest List', name: 'guest-list' },
    { label: 'Invitations', name: 'invitations' },
    { label: 'QR Check-in', name: 'check-in' },
    { label: 'Reports', name: 'reports' },
]);

const loadWorkspace = async () => {
    loading.value = true;
    error.value = '';

    try {
        const [{ data: eventResponse }, { data: overviewResponse }] = await Promise.all([
            api.get(`/events/${eventId.value}`),
            api.get('/dashboard/overview', { params: { event_id: eventId.value } }),
        ]);

        event.value = eventResponse.data;
        stats.value = overviewResponse.data;
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load event workspace.';
    } finally {
        loading.value = false;
    }
};

onMounted(loadWorkspace);
</script>

<template>
    <section class="space-y-6">
        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p v-if="loading" class="text-sm text-slate-400">Loading event workspace...</p>
            <p v-if="error" class="rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>

            <div v-if="event">
                <p class="text-xs uppercase tracking-[0.2em] text-amber-300">Event Workspace</p>
                <h1 class="mt-2 text-2xl font-bold text-white">{{ event.title }}</h1>
                <p class="mt-1 text-sm text-slate-400">{{ event.event_date }} {{ event.event_time }} | {{ event.location }}</p>
                <p class="mt-4 text-sm text-slate-300">{{ event.description || 'No event description yet.' }}</p>
            </div>
        </article>

        <article v-if="stats" class="grid gap-3 md:grid-cols-4">
            <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p class="text-xs uppercase tracking-wide text-slate-400">Guests</p>
                <p class="mt-2 text-2xl font-bold text-white">{{ stats.totals.guests }}</p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p class="text-xs uppercase tracking-wide text-slate-400">Confirmed</p>
                <p class="mt-2 text-2xl font-bold text-emerald-300">{{ stats.invitationStatus.confirmed }}</p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p class="text-xs uppercase tracking-wide text-slate-400">Pending</p>
                <p class="mt-2 text-2xl font-bold text-amber-300">{{ stats.invitationStatus.pending }}</p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p class="text-xs uppercase tracking-wide text-slate-400">Check-ins</p>
                <p class="mt-2 text-2xl font-bold text-white">{{ stats.totals.checkins }}</p>
            </div>
        </article>

        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 class="text-lg font-semibold text-white">Event Flow</h2>
            <p class="mt-1 text-sm text-slate-400">Run the full journey from this event context.</p>
            <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <RouterLink
                    v-for="link in links"
                    :key="link.name"
                    :to="{ name: link.name, params: { locale }, query: { event_id: String(eventId) } }"
                    class="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-4 text-sm font-semibold text-white hover:border-amber-400"
                >
                    {{ link.label }}
                </RouterLink>
            </div>
        </article>
    </section>
</template>
