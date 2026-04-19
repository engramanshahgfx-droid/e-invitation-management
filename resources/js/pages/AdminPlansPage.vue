<script setup>
import { onMounted, ref } from 'vue';
import api from '../lib/api';

const loading = ref(false);
const error = ref('');
const plans = ref([]);

const load = async () => {
    loading.value = true;
    error.value = '';
    try {
        const { data } = await api.get('/admin/plans');
        plans.value = data.data;
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load plans.';
    } finally {
        loading.value = false;
    }
};

const planColors = {
    free: 'border-slate-700 bg-slate-800/40',
    pro: 'border-blue-800/50 bg-blue-950/30',
    admin: 'border-amber-800/50 bg-amber-950/20',
    superadmin: 'border-purple-800/50 bg-purple-950/30',
};

const badgeColors = {
    free: 'bg-slate-800 text-slate-300',
    pro: 'bg-blue-900/50 text-blue-300',
    admin: 'bg-amber-900/50 text-amber-300',
    superadmin: 'bg-purple-900/50 text-purple-300',
};

onMounted(load);
</script>

<template>
    <section class="space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-3xl font-bold text-white">Plans</h1>
            <p class="mt-1 text-sm text-slate-400">
                Platform plans are role-based. Upgrade users directly from the
                <RouterLink :to="{ name: 'admin-users' }" class="text-purple-400 hover:underline">Users page</RouterLink>.
            </p>
        </div>

        <p v-if="loading" class="text-sm text-slate-400">Loading plans…</p>
        <p v-if="error" class="rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{{ error }}</p>

        <div v-if="!loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article
                v-for="plan in plans"
                :key="plan.id"
                class="flex flex-col rounded-3xl border p-6 transition"
                :class="planColors[plan.id]"
            >
                <div class="flex items-start justify-between">
                    <h2 class="text-xl font-bold text-white">{{ plan.name }}</h2>
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="badgeColors[plan.id]">
                        {{ plan.user_count }} users
                    </span>
                </div>
                <p class="mt-2 text-sm text-slate-400">{{ plan.description }}</p>

                <ul class="mt-4 flex-1 space-y-2">
                    <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-2 text-sm text-slate-300">
                        <svg class="h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ feature }}
                    </li>
                </ul>

                <RouterLink
                    :to="{ name: 'admin-users', query: { account_type: plan.id } }"
                    class="mt-6 rounded-xl border border-slate-600 px-4 py-2.5 text-center text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                    View {{ plan.name }} Users →
                </RouterLink>
            </article>
        </div>

        <!-- How upgrades work -->
        <article class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 class="text-lg font-semibold text-white">How Plan Management Works</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-3">
                <div class="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div class="mb-2 text-2xl">1.</div>
                    <h3 class="font-semibold text-white">Go to Users</h3>
                    <p class="mt-1 text-sm text-slate-400">Find the user you want to upgrade or downgrade.</p>
                </div>
                <div class="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div class="mb-2 text-2xl">2.</div>
                    <h3 class="font-semibold text-white">Click Edit Plan</h3>
                    <p class="mt-1 text-sm text-slate-400">Select the new account type and subscription status.</p>
                </div>
                <div class="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div class="mb-2 text-2xl">3.</div>
                    <h3 class="font-semibold text-white">Save Changes</h3>
                    <p class="mt-1 text-sm text-slate-400">Changes take effect immediately — no restart needed.</p>
                </div>
            </div>
        </article>
    </section>
</template>
