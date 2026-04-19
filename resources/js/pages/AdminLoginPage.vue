<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../lib/api';
import { persistAuth } from '../lib/auth';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const form = ref({ email: '', password: '' });

const submit = async () => {
    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.post('/auth/login', form.value);

        if (!['admin', 'superadmin'].includes(data.user?.account_type)) {
            error.value = 'Access denied. Admin account required.';
            return;
        }

        persistAuth({ token: data.token, user: data.user });
        await router.push({ name: 'admin-dashboard' });
    } catch (err) {
        error.value = err?.response?.data?.message || 'Login failed.';
    } finally {
        loading.value = false;
    }
};

const hints = computed(() => [
    { label: 'Admin', email: 'admin@example.com' },
    { label: 'Super Admin', email: 'superadmin@example.com' },
]);
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#1a0a2e,_#0a0a1a_60%)] px-4">
        <div class="w-full max-w-md">
            <!-- Logo area -->
            <div class="mb-8 text-center">
                <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 shadow-lg shadow-purple-900/50">
                    <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-white">Marasim Admin</h1>
                <p class="mt-1 text-sm text-slate-400">Platform Administration Panel</p>
            </div>

            <!-- Login card -->
            <div class="rounded-3xl border border-purple-900/40 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
                <h2 class="text-lg font-semibold text-white">Sign In to Admin</h2>
                <p class="mt-1 text-sm text-slate-400">Only admin and superadmin accounts can access this panel.</p>

                <form class="mt-6 grid gap-4" @submit.prevent="submit">
                    <label class="grid gap-2">
                        <span class="text-sm text-slate-300">Email</span>
                        <input
                            v-model="form.email"
                            type="email"
                            required
                            class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                            placeholder="admin@example.com"
                        >
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm text-slate-300">Password</span>
                        <input
                            v-model="form.password"
                            type="password"
                            required
                            class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                            placeholder="••••••••"
                        >
                    </label>

                    <p v-if="error" class="rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
                        {{ error }}
                    </p>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60"
                    >
                        {{ loading ? 'Signing in...' : 'Sign In' }}
                    </button>
                </form>

                <!-- Seed hints for dev -->
                <div class="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <p class="mb-2 text-xs uppercase tracking-widest text-slate-500">Seeded Accounts</p>
                    <div class="grid gap-1">
                        <div v-for="hint in hints" :key="hint.label" class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-800" @click="form.email = hint.email; form.password = 'password'">
                            <span class="text-xs text-slate-300">{{ hint.label }}</span>
                            <span class="text-xs text-slate-500">{{ hint.email }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
