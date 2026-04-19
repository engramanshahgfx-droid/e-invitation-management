<script setup>
import LocaleSwitch from '../components/common/LocaleSwitch.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';

const route = useRoute();
const router = useRouter();
const logoUrl = '/logo2.png';

const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const isArabic = computed(() => locale.value === 'ar');
const loading = ref(false);
const error = ref('');

const form = ref({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
});

const content = computed(() => ({
    title: isArabic.value ? 'إنشاء حساب' : 'Create Account',
    subtitle: isArabic.value ? 'ابدأ في إدارة الدعوات والضيوف من منصة واحدة' : 'Start managing invitations and guests from one platform',
    name: isArabic.value ? 'الاسم الكامل' : 'Full Name',
    email: isArabic.value ? 'البريد الإلكتروني' : 'Email Address',
    phone: isArabic.value ? 'رقم الجوال' : 'Phone Number',
    password: isArabic.value ? 'كلمة المرور' : 'Password',
    confirmPassword: isArabic.value ? 'تأكيد كلمة المرور' : 'Confirm Password',
    submit: isArabic.value ? 'متابعة للتحقق' : 'Continue to Verification',
    hasAccount: isArabic.value ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    signIn: isArabic.value ? 'سجل الدخول' : 'Sign In',
    passwordMismatch: isArabic.value ? 'كلمة المرور وتأكيدها غير متطابقين.' : 'Password and confirmation do not match.',
    sendingOtp: isArabic.value ? 'جارٍ إرسال الرمز...' : 'Sending OTP...',
}));

const submit = async () => {
    error.value = '';

    if (form.value.password !== form.value.password_confirmation) {
        error.value = content.value.passwordMismatch;
        return;
    }

    loading.value = true;

    try {
        const { data } = await api.post('/auth/register/send-otp', { email: form.value.email });

        sessionStorage.setItem('pending_registration', JSON.stringify({
            ...form.value,
            otp_message: data.message || null,
            delivery_channel: data.delivery_channel || null,
            debug_code: data.debug_code || null,
        }));

        await router.push({ name: 'register-verify', params: { locale: locale.value } });
    } catch (err) {
        error.value = err?.response?.data?.message || Object.values(err?.response?.data?.errors || {}).flat()[0] || 'Failed to send OTP.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div :dir="isArabic ? 'rtl' : 'ltr'" class="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div class="mx-auto flex max-w-6xl items-start justify-between">
            <RouterLink :to="{ name: 'home', params: { locale } }" class="flex items-center gap-2">
                <img :src="logoUrl" alt="Marasim" class="h-14 w-14 object-contain">
                <span class="text-lg font-semibold">Marasim</span>
            </RouterLink>
            <LocaleSwitch />
        </div>

        <div class="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section class="rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
                <p class="text-sm uppercase tracking-[0.28em] text-blue-300">Marasim</p>
                <h1 class="mt-4 text-4xl font-bold leading-tight">{{ content.title }}</h1>
                <p class="mt-4 max-w-xl text-lg text-slate-300">{{ content.subtitle }}</p>

                <ul class="mt-10 grid gap-4 text-sm text-slate-300">
                    <li class="rounded-2xl border border-white/10 bg-white/5 p-4">Digital invitations with Laravel backend and Vue frontend</li>
                    <li class="rounded-2xl border border-white/10 bg-white/5 p-4">Guest tracking and RSVP workflows</li>
                    <li class="rounded-2xl border border-white/10 bg-white/5 p-4">Secure OTP verification with email delivery</li>
                </ul>
            </section>

            <section class="rounded-3xl bg-white p-8 shadow-2xl">
                <h2 class="text-2xl font-bold">{{ content.title }}</h2>
                <p class="mt-2 text-sm text-slate-500">{{ content.subtitle }}</p>

                <form class="mt-8 grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
                    <label class="grid gap-2 sm:col-span-2">
                        <span class="text-sm font-medium">{{ content.name }}</span>
                        <input v-model="form.name" class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" type="text" required>
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.email }}</span>
                        <input v-model="form.email" class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" type="email" required>
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.phone }}</span>
                        <input v-model="form.phone" class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" type="text">
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.password }}</span>
                        <input v-model="form.password" class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" type="password" required>
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.confirmPassword }}</span>
                        <input v-model="form.password_confirmation" class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" type="password" required>
                    </label>

                    <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2">{{ error }}</p>

                    <button class="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:col-span-2" type="submit" :disabled="loading">
                        {{ loading ? content.sendingOtp : content.submit }}
                    </button>
                </form>

                <p class="mt-6 text-sm text-slate-500">
                    {{ content.hasAccount }}
                    <RouterLink :to="{ name: 'login', params: { locale } }" class="font-semibold text-blue-600">{{ content.signIn }}</RouterLink>
                </p>
            </section>
        </div>
    </div>
</template>