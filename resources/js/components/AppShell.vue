<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearAuth, fetchCurrentUser, getStoredUser } from '../lib/auth';

const route = useRoute();
const router = useRouter();

const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const isArabic = computed(() => locale.value === 'ar');
const alternateLocale = computed(() => (locale.value === 'ar' ? 'en' : 'ar'));
const isAdminLayout = computed(() => route.meta.layout === 'admin');
const isDashboardLayout = computed(() => !['marketing', 'blank', 'admin'].includes(route.meta.layout));

const dashboardText = computed(() => ({
    appTitle: isArabic.value ? 'لوحة إدارة الفعاليات' : 'Event Management Dashboard',
    dashboard: isArabic.value ? 'الرئيسية' : 'Dashboard',
    events: isArabic.value ? 'الفعاليات' : 'Events',
    guests: isArabic.value ? 'الضيوف' : 'Guests',
    templateStudio: isArabic.value ? 'استوديو القوالب' : 'Template Studio',
    invitations: isArabic.value ? 'الدعوات' : 'Invitations',
    pricing: isArabic.value ? 'الاشتراك' : 'Pricing',
    checkIn: isArabic.value ? 'تسجيل الدخول' : 'Check-in',
    reports: isArabic.value ? 'التقارير' : 'Reports',
    marketplace: isArabic.value ? 'المتجر' : 'Marketplace',
    admin: isArabic.value ? 'الإدارة' : 'Admin',
    switchLanguage: isArabic.value ? 'English' : 'العربية',
    unknownUser: isArabic.value ? 'مستخدم' : 'User',
    noEmail: isArabic.value ? 'لا يوجد بريد' : 'No email',
    logout: isArabic.value ? 'تسجيل الخروج' : 'Logout',
}));

const user = ref(getStoredUser());
const adminUser = computed(() => user.value);
const isAdminUser = computed(() => ['admin', 'superadmin'].includes(user.value?.account_type || ''));
const profileMenuOpen = ref(false);
const profileMenuRef = ref(null);

const syncUser = async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        user.value = null;
        return;
    }

    try {
        user.value = await fetchCurrentUser();
    } catch {
        user.value = getStoredUser();
    }
};

const userInitials = computed(() => {
    const fullName = (user.value?.name || '').trim();

    if (!fullName) {
        return 'U';
    }

    const parts = fullName.split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
});

const toggleProfileMenu = () => {
    profileMenuOpen.value = !profileMenuOpen.value;
};

const closeProfileMenu = (event) => {
    if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) {
        profileMenuOpen.value = false;
    }
};

const handleAuthUserUpdated = (event) => {
    user.value = event.detail;
};

onMounted(async () => {
    await syncUser();
    window.addEventListener('click', closeProfileMenu);
    window.addEventListener('auth-user-updated', handleAuthUserUpdated);
});

onUnmounted(() => {
    window.removeEventListener('click', closeProfileMenu);
    window.removeEventListener('auth-user-updated', handleAuthUserUpdated);
});

const logout = async () => {
    clearAuth();
    await router.push({ name: 'login', params: { locale: locale.value } });
};

const adminLogout = () => {
    clearAuth();
    router.push({ name: 'admin-login' });
};
</script>

<template>
    <!-- Admin Layout -->
    <div v-if="isAdminLayout" class="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1a0a2e,_#0a0a1a_60%)]">
        <header class="border-b border-purple-900/50 bg-slate-950/80 backdrop-blur">
            <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                        <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-[0.22em] text-purple-300">Marasim Admin</p>
                        <p class="text-xs text-slate-400">{{ adminUser?.account_type === 'superadmin' ? 'Super Admin' : 'Admin' }} Panel</p>
                    </div>
                </div>
                <nav class="flex items-center gap-1 text-sm">
                    <RouterLink :to="{ name: 'admin-dashboard' }" class="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">Dashboard</RouterLink>
                    <RouterLink :to="{ name: 'admin-users' }" class="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">Users</RouterLink>
                    <RouterLink :to="{ name: 'admin-plans' }" class="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">Plans</RouterLink>
                    <div class="mx-2 h-5 w-px bg-slate-700" />
                    <span class="mr-2 text-xs text-slate-400">{{ adminUser?.name }}</span>
                    <button class="rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-500" type="button" @click="adminLogout">Logout</button>
                </nav>
            </div>
        </header>
        <main class="mx-auto max-w-7xl px-4 py-8">
            <RouterView />
        </main>
    </div>

    <!-- Regular Dashboard Layout -->
    <div v-else-if="isDashboardLayout" :dir="isArabic ? 'rtl' : 'ltr'" class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <header class="relative z-[90] border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
            <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.22em] text-amber-300">Marasim</p>
                    <h1 class="text-lg font-semibold text-white">{{ dashboardText.appTitle }}</h1>
                </div>
                <nav class="flex items-center gap-2 text-sm">
                    <RouterLink :to="{ name: 'dashboard', params: { locale } }" class="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">{{ dashboardText.dashboard }}</RouterLink>
                    <RouterLink :to="{ name: 'events', params: { locale } }" class="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">{{ dashboardText.events }}</RouterLink>
                    <RouterLink :to="{ name: 'guest-list', params: { locale } }" class="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">{{ dashboardText.guests }}</RouterLink>
                    <RouterLink :to="{ name: 'template-studio', params: { locale } }" class="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">{{ dashboardText.templateStudio }}</RouterLink>
                    <RouterLink :to="{ name: 'invitations', params: { locale } }" class="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">{{ dashboardText.invitations }}</RouterLink>
                    <RouterLink :to="{ name: 'pricing', params: { locale } }" class="rounded-md px-3 py-2 text-emerald-300 hover:bg-slate-800 hover:text-emerald-200">{{ dashboardText.pricing }}</RouterLink>
                    <RouterLink :to="{ name: 'check-in', params: { locale } }" class="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">{{ dashboardText.checkIn }}</RouterLink>
                    <RouterLink :to="{ name: 'reports', params: { locale } }" class="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">{{ dashboardText.reports }}</RouterLink>
                    <RouterLink :to="{ name: 'marketplace', params: { locale } }" class="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">{{ dashboardText.marketplace }}</RouterLink>
                    <RouterLink v-if="isAdminUser" :to="{ name: 'admin-dashboard' }" class="rounded-md px-3 py-2 text-purple-300 hover:bg-slate-800 hover:text-purple-200">{{ dashboardText.admin }}</RouterLink>
                    <RouterLink
                        :to="{ name: route.name || 'dashboard', params: { ...route.params, locale: alternateLocale }, query: route.query }"
                        class="rounded-md border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white"
                    >
                        {{ dashboardText.switchLanguage }}
                    </RouterLink>
                    <div class="mx-1 h-5 w-px bg-slate-700/70" />
                    <div ref="profileMenuRef" class="relative">
                        <button
                            type="button"
                            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-xs font-bold text-white transition hover:border-slate-500 hover:bg-slate-700"
                            @click.stop="toggleProfileMenu"
                        >
                            {{ userInitials }}
                        </button>

                        <div
                            v-if="profileMenuOpen"
                            class="absolute right-0 top-full z-[120] mt-3 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl"
                        >
                            <div class="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2">
                                <p class="text-sm font-semibold text-white">{{ user?.name || dashboardText.unknownUser }}</p>
                                <p class="mt-1 text-xs text-slate-300">{{ user?.email || dashboardText.noEmail }}</p>
                                <p class="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">{{ user?.account_type || 'free' }}</p>
                            </div>

                            <button
                                class="mt-3 w-full rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                                type="button"
                                @click="logout"
                            >
                                {{ dashboardText.logout }}
                            </button>
                        </div>
                    </div>
                </nav>
            </div>
        </header>

        <main class="mx-auto max-w-6xl px-4 py-8">
            <RouterView />
        </main>
    </div>

    <!-- Marketing / blank layouts -->
    <RouterView v-else />
</template>

