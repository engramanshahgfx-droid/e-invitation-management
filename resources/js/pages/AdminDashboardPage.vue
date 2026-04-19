<script setup>
import { onMounted, ref } from 'vue';
import api from '../lib/api';

const loading = ref(false);
const error = ref('');
const overview = ref(null);
const stats = ref(null);

const load = async () => {
    loading.value = true;
    error.value = '';

    try {
        const [overviewRes, statsRes] = await Promise.all([
            api.get('/admin/overview'),
            api.get('/admin/system-stats'),
        ]);
        overview.value = overviewRes.data.data;
        stats.value = statsRes.data.data;
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load admin dashboard.';
    } finally {
        loading.value = false;
    }
};

onMounted(load);
</script>

<template>
    <section class="space-y-6">
        <!-- Header -->
        <article class="relative overflow-hidden rounded-3xl border border-purple-900/40 bg-[linear-gradient(135deg,#1a0a2e_0%,#2d1a4e_50%,#1a1a3e_100%)] p-6">
            <div class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
            <p class="relative text-xs uppercase tracking-[0.2em] text-purple-300">Platform Administration</p>
            <h1 class="relative mt-2 text-3xl font-bold text-white">Admin Dashboard</h1>
            <p class="relative mt-1 text-sm text-slate-300">Full platform overview — users, events, subscriptions, and system health.</p>
        </article>

        <p v-if="loading" class="text-sm text-slate-400">Loading dashboard...</p>
        <p v-if="error" class="rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{{ error }}</p>

        <!-- Platform totals -->
        <div v-if="overview" class="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <article v-for="(value, key) in overview.totals" :key="key" class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                <p class="text-xs uppercase tracking-widest text-slate-400">{{ key }}</p>
                <h2 class="mt-2 text-3xl font-bold text-white">{{ value }}</h2>
            </article>
        </div>

        <div v-if="overview || stats" class="grid gap-6 lg:grid-cols-2">
            <!-- Users by type -->
            <article v-if="overview" class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 class="text-lg font-semibold text-white">Users by Plan</h2>
                <div class="mt-4 grid grid-cols-2 gap-3">
                    <div class="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                        <p class="text-xs text-slate-400">Free</p>
                        <p class="mt-1 text-2xl font-bold text-slate-200">{{ overview.usersByType.free }}</p>
                    </div>
                    <div class="rounded-xl border border-blue-900/40 bg-blue-950/30 p-4">
                        <p class="text-xs text-blue-300">Pro</p>
                        <p class="mt-1 text-2xl font-bold text-white">{{ overview.usersByType.pro }}</p>
                    </div>
                    <div class="rounded-xl border border-amber-900/40 bg-amber-950/30 p-4 col-span-2">
                        <p class="text-xs text-amber-300">Admin / Super Admin</p>
                        <p class="mt-1 text-2xl font-bold text-white">{{ overview.usersByType.admin }}</p>
                    </div>
                </div>
            </article>

            <!-- Today's stats -->
            <article v-if="stats" class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 class="text-lg font-semibold text-white">Today's Activity</h2>
                <div class="mt-4 grid gap-3">
                    <div v-for="(value, key) in stats" :key="key" class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                        <span class="text-sm capitalize text-slate-300">{{ key.replace(/_/g, ' ') }}</span>
                        <span class="text-lg font-bold text-white">{{ value }}</span>
                    </div>
                </div>
            </article>
        </div>

        <!-- Recent users -->
        <article v-if="overview?.recentUsers?.length" class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-white">Recent Users</h2>
                <RouterLink :to="{ name: 'admin-users' }" class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
                    Manage All Users →
                </RouterLink>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-slate-800 text-left text-xs uppercase tracking-widest text-slate-500">
                            <th class="pb-3 pr-4">Name</th>
                            <th class="pb-3 pr-4">Email</th>
                            <th class="pb-3 pr-4">Plan</th>
                            <th class="pb-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in overview.recentUsers" :key="u.id" class="border-b border-slate-800/50">
                            <td class="py-3 pr-4 font-medium text-white">{{ u.name }}</td>
                            <td class="py-3 pr-4 text-slate-400">{{ u.email }}</td>
                            <td class="py-3 pr-4">
                                <span
                                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                                    :class="{
                                        'bg-purple-900/50 text-purple-300': u.account_type === 'superadmin',
                                        'bg-amber-900/50 text-amber-300': u.account_type === 'admin',
                                        'bg-blue-900/50 text-blue-300': u.account_type === 'pro',
                                        'bg-slate-800 text-slate-300': u.account_type === 'free',
                                    }"
                                >{{ u.account_type }}</span>
                            </td>
                            <td class="py-3">
                                <span
                                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                                    :class="{
                                        'bg-emerald-900/50 text-emerald-300': u.subscription_status === 'active',
                                        'bg-yellow-900/50 text-yellow-300': u.subscription_status === 'trial',
                                        'bg-blue-900/50 text-blue-300': u.subscription_status === 'pending_review',
                                        'bg-rose-900/50 text-rose-300': ['expired', 'cancelled', 'rejected'].includes(u.subscription_status),
                                    }"
                                >{{ u.subscription_status }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </article>
    </section>
</template>
