<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStoredUser } from '../lib/auth';

const route = useRoute();
const router = useRouter();
const user = getStoredUser();

const isAdminLayout = computed(() => route.meta.layout === 'admin');

const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push({ name: 'admin-login' });
};
</script>

<template>
    <div v-if="isAdminLayout" class="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1a0a2e,_#0a0a1a_60%)]">
        <header class="border-b border-purple-900/50 bg-slate-950/80 backdrop-blur">
            <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                        <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-[0.22em] text-purple-300">Marasim Admin</p>
                        <p class="text-xs text-slate-400">{{ user?.account_type === 'superadmin' ? 'Super Admin' : 'Admin' }} Panel</p>
                    </div>
                </div>

                <nav class="flex items-center gap-1 text-sm">
                    <RouterLink :to="{ name: 'admin-dashboard' }" class="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">
                        Dashboard
                    </RouterLink>
                    <RouterLink :to="{ name: 'admin-users' }" class="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">
                        Users
                    </RouterLink>
                    <RouterLink :to="{ name: 'admin-plans' }" class="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">
                        Plans
                    </RouterLink>
                    <div class="mx-2 h-5 w-px bg-slate-700" />
                    <span class="mr-2 text-xs text-slate-400">{{ user?.name }}</span>
                    <button class="rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-500" type="button" @click="logout">
                        Logout
                    </button>
                </nav>
            </div>
        </header>

        <main class="mx-auto max-w-7xl px-4 py-8">
            <RouterView />
        </main>
    </div>

    <RouterView v-else />
</template>
