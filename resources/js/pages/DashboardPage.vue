<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../lib/api';
import { fetchCurrentUser, getStoredUser, setStoredUser } from '../lib/auth';

const route = useRoute();
const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const isArabic = computed(() => locale.value === 'ar');
const user = ref(getStoredUser());

const loading = ref(false);
const error = ref('');
const overview = ref(null);
const profileSaving = ref(false);
const profileNotice = ref('');
const profileForm = ref({
    name: user.value?.name || '',
    phone: user.value?.phone || '',
});

const roleLabel = computed(() => {
    const accountType = user.value?.account_type || 'free';

    if (accountType === 'superadmin') {
        return isArabic.value ? 'مستخدم إدارة عليا' : 'Super Admin User';
    }

    if (accountType === 'admin') {
        return isArabic.value ? 'مستخدم إدارة' : 'Admin User';
    }

    if (accountType === 'pro') {
        return isArabic.value ? 'مشترك فعاليات احترافي' : 'Professional Event Subscriber';
    }

    return isArabic.value ? 'مشترك فعاليات' : 'Event Subscriber';
});

const cards = computed(() => {
    if (!overview.value) {
        return [];
    }

    return [
        { label: 'Events', value: overview.value.totals.events },
        { label: 'Guests', value: overview.value.totals.guests },
        { label: 'Confirmed', value: overview.value.invitationStatus.confirmed },
        { label: 'Check-ins', value: overview.value.totals.checkins },
    ];
});

const loadOverview = async () => {
    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.get('/dashboard/overview');
        overview.value = data.data;
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load dashboard overview.';
    } finally {
        loading.value = false;
    }
};

const syncCurrentUser = async () => {
    try {
        user.value = await fetchCurrentUser();
        profileForm.value = {
            name: user.value?.name || '',
            phone: user.value?.phone || '',
        };
    } catch {
        // Keep stored profile if refresh fails.
    }
};

const saveProfile = async () => {
    profileSaving.value = true;
    error.value = '';
    profileNotice.value = '';

    try {
        const { data } = await api.patch('/auth/profile', profileForm.value);
        user.value = data.user;
        setStoredUser(data.user);
        profileNotice.value = 'Organizer WhatsApp contact saved successfully.';
    } catch (err) {
        error.value = err?.response?.data?.message || Object.values(err?.response?.data?.errors || {}).flat()[0] || 'Failed to update profile.';
    } finally {
        profileSaving.value = false;
    }
};

onMounted(async () => {
    await syncCurrentUser();
    await loadOverview();
});
</script>

<template>
    <section class="space-y-6">
        <article class="relative overflow-hidden rounded-3xl border border-slate-700 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#334155_100%)] p-6">
            <div class="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
            <div class="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-amber-300/20 blur-3xl" />
            <p class="relative text-sm uppercase tracking-[0.2em] text-amber-300">Welcome</p>
            <h1 class="relative mt-3 text-3xl font-bold text-white">{{ user?.name || 'Marasim User' }}</h1>
            <p class="relative mt-2 inline-flex rounded-full border border-white/20 bg-slate-950/40 px-3 py-1 text-xs font-semibold text-cyan-200">{{ roleLabel }}</p>
            <p class="relative mt-2 max-w-2xl text-slate-200">Your complete invitation operating system: event setup, template design, guest workflow, delivery, check-in, and analytics.</p>
            <div class="relative mt-5 grid gap-2 text-xs text-slate-200 md:grid-cols-5">
                <div class="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">1. Event</div>
                <div class="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">2. Template</div>
                <div class="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">3. Guest List</div>
                <div class="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">4. Invitations</div>
                <div class="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">5. Check-In & Reports</div>
            </div>
        </article>

        <p v-if="loading" class="text-sm text-slate-400">Loading dashboard...</p>
        <p v-if="error" class="rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>

        <div class="grid gap-4 md:grid-cols-4">
            <article v-for="card in cards" :key="card.label" class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                <p class="text-sm uppercase tracking-[0.18em] text-slate-400">{{ card.label }}</p>
                <h2 class="mt-2 text-3xl font-semibold text-white">{{ card.value }}</h2>
            </article>
        </div>

        <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <article class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-semibold text-white">Recent Events</h2>
                    <RouterLink :to="{ name: 'events', params: { locale } }" class="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300">
                        Open Events
                    </RouterLink>
                </div>

                <ul class="mt-5 grid gap-3">
                    <li
                        v-for="event in overview?.recentEvents || []"
                        :key="event.id"
                        class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                    >
                        <div>
                            <h3 class="font-semibold text-white">{{ event.title }}</h3>
                            <p class="mt-1 text-xs text-slate-400">{{ event.event_date }} | {{ event.location }}</p>
                        </div>
                        <RouterLink
                            :to="{ name: 'event-workspace', params: { locale, id: event.id } }"
                            class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                        >
                            Workspace
                        </RouterLink>
                    </li>
                    <li v-if="(overview?.recentEvents || []).length === 0" class="text-sm text-slate-500">No events yet. Create one to start the flow.</li>
                </ul>
            </article>

            <div class="grid gap-6">
                <article class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                    <h2 class="text-xl font-semibold text-white">Organizer WhatsApp Contact</h2>
                    <p class="mt-2 text-sm text-slate-400">Guests receive this contact inside invitation messages. Save a valid WhatsApp number before sending invitations.</p>

                    <form class="mt-4 grid gap-3" @submit.prevent="saveProfile">
                        <input v-model="profileForm.name" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" type="text" placeholder="Organizer name">
                        <input v-model="profileForm.phone" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" type="text" placeholder="WhatsApp number, e.g. +966551234567">
                        <p class="text-xs text-slate-500">Current saved contact: {{ user?.phone || 'No WhatsApp number saved yet.' }}</p>
                        <p v-if="profileNotice" class="rounded-xl border border-emerald-900/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">{{ profileNotice }}</p>
                        <button class="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60" type="submit" :disabled="profileSaving">{{ profileSaving ? 'Saving...' : 'Save WhatsApp Contact' }}</button>
                    </form>
                </article>

                <article class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                    <h2 class="text-xl font-semibold text-white">Quick Actions</h2>
                    <div class="mt-4 grid gap-3">
                        <RouterLink :to="{ name: 'pricing', params: { locale } }" class="rounded-2xl border border-emerald-700/40 bg-emerald-900/30 px-4 py-4 text-emerald-100 hover:border-emerald-600">Choose Plan & Upload Payment</RouterLink>
                        <RouterLink :to="{ name: 'events', params: { locale } }" class="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-white hover:border-slate-700">Create or Edit Event</RouterLink>
                        <RouterLink :to="{ name: 'template-studio', params: { locale } }" class="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-white hover:border-slate-700">Design Invitation Template</RouterLink>
                        <RouterLink :to="{ name: 'guest-list', params: { locale } }" class="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-white hover:border-slate-700">Manage Guest List</RouterLink>
                        <RouterLink :to="{ name: 'invitations', params: { locale } }" class="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-white hover:border-slate-700">Send Invitations</RouterLink>
                        <RouterLink :to="{ name: 'check-in', params: { locale } }" class="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-white hover:border-slate-700">Run Check-ins</RouterLink>
                        <RouterLink :to="{ name: 'reports', params: { locale } }" class="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-white hover:border-slate-700">Download Reports</RouterLink>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
