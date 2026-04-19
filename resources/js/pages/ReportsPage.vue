<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';
import { useEventQuerySync } from '../lib/eventFlow';

const route = useRoute();
const router = useRouter();
const events = ref([]);
const selectedEventId = ref('');

const loading = ref(false);
const error = ref('');
const overview = ref(null);

useEventQuerySync({ route, router, selectedEventId });

const loadEvents = async () => {
    const { data } = await api.get('/events');
    events.value = data.data?.data ?? [];
    if (!selectedEventId.value && events.value.length > 0) {
        selectedEventId.value = String(events.value[0].id);
    }
};

const loadOverview = async () => {
    loading.value = true;
    error.value = '';
    try {
        const { data } = await api.get('/dashboard/overview', {
            params: selectedEventId.value ? { event_id: selectedEventId.value } : {},
        });
        overview.value = data.data;
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load overview.';
    } finally {
        loading.value = false;
    }
};

const baseUrl = computed(() => api.defaults.baseURL || '/api');

const exports = computed(() => [
    { name: 'Events CSV', href: `${baseUrl.value}/reports/events/export${selectedEventId.value ? `?event_id=${selectedEventId.value}` : ''}` },
    { name: 'Guests CSV', href: `${baseUrl.value}/reports/guests/export${selectedEventId.value ? `?event_id=${selectedEventId.value}` : ''}` },
    { name: 'Check-ins CSV', href: `${baseUrl.value}/reports/checkins/export${selectedEventId.value ? `?event_id=${selectedEventId.value}` : ''}` },
]);

const initialize = async () => {
    await loadEvents();
    await loadOverview();
};

initialize();
</script>

<template>
    <section class="grid gap-6">
        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-white">Analytics & Reports</h2>
                <div class="flex items-center gap-2">
                    <select v-model="selectedEventId" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200" @change="loadOverview">
                        <option value="">All Events</option>
                        <option v-for="event in events" :key="event.id" :value="String(event.id)">{{ event.title }}</option>
                    </select>
                    <button class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300" @click="loadOverview">Refresh</button>
                </div>
            </div>

            <p v-if="loading" class="mt-3 text-sm text-slate-400">Loading analytics...</p>
            <p v-if="error" class="mt-3 rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>

            <div v-if="overview" class="mt-5 grid gap-3 md:grid-cols-3">
                <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p class="text-xs uppercase tracking-wide text-slate-400">Events</p>
                    <p class="mt-2 text-2xl font-bold text-white">{{ overview.totals.events }}</p>
                </div>
                <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p class="text-xs uppercase tracking-wide text-slate-400">Guests</p>
                    <p class="mt-2 text-2xl font-bold text-white">{{ overview.totals.guests }}</p>
                </div>
                <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p class="text-xs uppercase tracking-wide text-slate-400">Check-ins</p>
                    <p class="mt-2 text-2xl font-bold text-white">{{ overview.totals.checkins }}</p>
                </div>
            </div>
        </article>

        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 class="text-base font-semibold text-white">Download Reports</h3>
            <div class="mt-4 flex flex-wrap gap-3">
                <a v-for="item in exports" :key="item.name" class="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" :href="item.href">{{ item.name }}</a>
            </div>
        </article>
    </section>
</template>
