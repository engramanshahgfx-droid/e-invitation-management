<script setup>
import LocaleSwitch from '../components/common/LocaleSwitch.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';
import { persistAuth } from '../lib/auth';

const route = useRoute();
const router = useRouter();
const logoUrl = '/logo2.png';

const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const isArabic = computed(() => locale.value === 'ar');
const loading = ref(false);
const error = ref('');
const notice = ref('');

const form = ref({
    email: '',
    password: '',
});

const content = computed(() => ({
    title: isArabic.value ? 'تسجيل الدخول' : 'Sign In',
    subtitle: isArabic.value ? 'ادخل إلى لوحة إدارة فعالياتك' : 'Access your event management dashboard',
    email: isArabic.value ? 'البريد الإلكتروني' : 'Email Address',
    password: isArabic.value ? 'كلمة المرور' : 'Password',
    submit: isArabic.value ? 'دخول' : 'Sign In',
    noAccount: isArabic.value ? 'ليس لديك حساب؟' : 'No account yet?',
    create: isArabic.value ? 'أنشئ حسابًا' : 'Create one',
    forgotPassword: isArabic.value ? 'نسيت كلمة المرور؟' : 'Forgot password?',
}));

if (route.query.registered === '1') {
    notice.value = isArabic.value ? 'تم إنشاء الحساب بنجاح. سجل الدخول الآن.' : 'Account created successfully. Please sign in.';
}

if (route.query.reset === '1') {
    notice.value = isArabic.value ? 'تم تحديث كلمة المرور بنجاح.' : 'Password reset successfully.';
}

const submit = async () => {
    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.post('/auth/login', form.value);
        persistAuth({ token: data.token, user: data.user });
        await router.push({ name: 'dashboard', params: { locale: locale.value } });
    } catch (err) {
        error.value = err?.response?.data?.message || err?.response?.data?.errors?.email?.[0] || 'Login failed.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div :dir="isArabic ? 'rtl' : 'ltr'" class="min-h-screen bg-[radial-gradient(circle_at_top,_#12204d,_#020617_45%,_#030712)] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div class="mx-auto flex max-w-6xl items-start justify-between">
            <RouterLink :to="{ name: 'home', params: { locale } }" class="flex items-center gap-2">
                <img :src="logoUrl" alt="Marasim" class="h-14 w-14 object-contain">
                <span class="text-lg font-semibold">Marasim</span>
            </RouterLink>
            <LocaleSwitch />
        </div>

        <div class="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <section class="relative overflow-hidden rounded-3xl border border-blue-300/20 bg-blue-500/10 p-8 backdrop-blur">
                <div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
                <div class="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

                <p class="relative text-sm uppercase tracking-[0.28em] text-cyan-300">Marasim Control</p>
                <h1 class="relative mt-4 text-4xl font-bold leading-tight">{{ content.title }}</h1>
                <p class="relative mt-4 max-w-xl text-lg text-slate-200">{{ content.subtitle }}</p>

                <div class="relative mt-10 grid gap-4 sm:grid-cols-3">
                    <div class="rounded-2xl border border-cyan-300/20 bg-slate-950/50 p-4">
                        <p class="text-2xl font-bold text-cyan-300">248</p>
                        <p class="mt-1 text-sm text-slate-400">Guests Invited</p>
                    </div>
                    <div class="rounded-2xl border border-emerald-300/20 bg-slate-950/50 p-4">
                        <p class="text-2xl font-bold text-emerald-300">186</p>
                        <p class="mt-1 text-sm text-slate-400">Confirmed</p>
                    </div>
                    <div class="rounded-2xl border border-amber-300/20 bg-slate-950/50 p-4">
                        <p class="text-2xl font-bold text-amber-300">142</p>
                        <p class="mt-1 text-sm text-slate-400">Checked In</p>
                    </div>
                </div>

                <div class="relative mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                    <p class="font-semibold text-white">{{ isArabic ? 'تدفق متكامل' : 'Integrated Flow' }}</p>
                    <p class="mt-2">{{ isArabic ? 'الآن جميع الصفحات مترابطة: الفعالية -> الضيوف -> الدعوات -> تسجيل الدخول -> التقارير.' : 'All pages now work as one pipeline: event -> guests -> invitations -> check-in -> reports.' }}</p>
                </div>
            </section>

            <section class="rounded-3xl border border-white/20 bg-white/95 p-8 text-slate-900 shadow-2xl">
                <h2 class="text-2xl font-bold">{{ content.title }}</h2>
                <p class="mt-2 text-sm text-slate-500">{{ content.subtitle }}</p>

                <form class="mt-8 grid gap-4" @submit.prevent="submit">
                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.email }}</span>
                        <input v-model="form.email" class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" type="email" required>
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.password }}</span>
                        <input v-model="form.password" class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" type="password" required>
                    </label>

                    <div class="text-right text-sm">
                        <RouterLink :to="{ name: 'forgot-password', params: { locale } }" class="font-semibold text-blue-600 hover:text-blue-700">{{ content.forgotPassword }}</RouterLink>
                    </div>

                    <p v-if="notice" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ notice }}</p>

                    <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

                    <button class="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60" type="submit" :disabled="loading">
                        {{ loading ? '...' : content.submit }}
                    </button>
                </form>

                <p class="mt-6 text-sm text-slate-500">
                    {{ content.noAccount }}
                    <RouterLink :to="{ name: 'register', params: { locale } }" class="font-semibold text-blue-600">{{ content.create }}</RouterLink>
                </p>
            </section>
        </div>
    </div>
</template>