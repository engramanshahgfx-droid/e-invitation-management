<script setup>
import LocaleSwitch from '../components/common/LocaleSwitch.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';

const route = useRoute();
const router = useRouter();
const logoUrl = '/public/logo2.png';

const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const isArabic = computed(() => locale.value === 'ar');

const step = ref(1);
const sending = ref(false);
const verifying = ref(false);
const resetting = ref(false);
const error = ref('');
const notice = ref('');

const form = ref({
    email: '',
    code: '',
    password: '',
    password_confirmation: '',
});

const content = computed(() => ({
    title: isArabic.value ? 'نسيت كلمة المرور' : 'Forgot Password',
    subtitle: isArabic.value ? 'استعد الوصول إلى حسابك عبر OTP.' : 'Recover access to your account with OTP verification.',
    email: isArabic.value ? 'البريد الإلكتروني' : 'Email Address',
    otp: isArabic.value ? 'رمز OTP' : 'OTP Code',
    password: isArabic.value ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: isArabic.value ? 'تأكيد كلمة المرور' : 'Confirm Password',
    sendOtp: isArabic.value ? 'إرسال OTP' : 'Send OTP',
    verifyOtp: isArabic.value ? 'تحقق من OTP' : 'Verify OTP',
    resetPassword: isArabic.value ? 'تحديث كلمة المرور' : 'Reset Password',
    signIn: isArabic.value ? 'العودة لتسجيل الدخول' : 'Back to Sign In',
}));

const sendOtp = async () => {
    error.value = '';
    notice.value = '';
    sending.value = true;

    try {
        const { data } = await api.post('/auth/forgot-password/send-otp', { email: form.value.email });
        notice.value = data.debug_code
            ? `${data.message || 'OTP was sent to your email.'} (${data.debug_code})`
            : (data.message || 'OTP was sent to your email.');
        step.value = 2;
    } catch (err) {
        error.value = err?.response?.data?.message || 'Failed to send OTP.';
    } finally {
        sending.value = false;
    }
};

const verifyOtp = async () => {
    error.value = '';
    notice.value = '';
    verifying.value = true;

    try {
        await api.post('/auth/forgot-password/verify-otp', {
            email: form.value.email,
            code: form.value.code,
        });
        notice.value = isArabic.value ? 'تم التحقق من OTP بنجاح.' : 'OTP verified successfully.';
        step.value = 3;
    } catch (err) {
        error.value = err?.response?.data?.message || 'OTP verification failed.';
    } finally {
        verifying.value = false;
    }
};

const resetPassword = async () => {
    error.value = '';
    notice.value = '';

    if (form.value.password !== form.value.password_confirmation) {
        error.value = isArabic.value ? 'كلمة المرور وتأكيدها غير متطابقين.' : 'Password and confirmation do not match.';
        return;
    }

    resetting.value = true;

    try {
        await api.post('/auth/forgot-password/reset', {
            email: form.value.email,
            code: form.value.code,
            password: form.value.password,
            password_confirmation: form.value.password_confirmation,
        });

        await router.push({ name: 'login', params: { locale: locale.value }, query: { reset: '1' } });
    } catch (err) {
        error.value = err?.response?.data?.message || 'Failed to reset password.';
    } finally {
        resetting.value = false;
    }
};
</script>

<template>
    <div :dir="isArabic ? 'rtl' : 'ltr'" class="min-h-screen bg-[radial-gradient(circle_at_top,_#12204d,_#020617_45%,_#030712)] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div class="mx-auto flex max-w-5xl items-start justify-between">
            <RouterLink :to="{ name: 'home', params: { locale } }" class="flex items-center gap-2">
                <img :src="logoUrl" alt="Marasim" class="h-14 w-14 object-contain">
                <span class="text-lg font-semibold">Marasim</span>
            </RouterLink>
            <LocaleSwitch />
        </div>

        <div class="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/20 bg-white/95 p-8 text-slate-900 shadow-2xl">
            <h1 class="text-3xl font-bold">{{ content.title }}</h1>
            <p class="mt-2 text-sm text-slate-500">{{ content.subtitle }}</p>

            <div class="mt-6 flex items-center gap-2 text-xs">
                <span :class="step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'" class="rounded-full px-2 py-1 font-semibold">1</span>
                <span :class="step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'" class="rounded-full px-2 py-1 font-semibold">2</span>
                <span :class="step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'" class="rounded-full px-2 py-1 font-semibold">3</span>
            </div>

            <form class="mt-8 grid gap-4" @submit.prevent>
                <label class="grid gap-2">
                    <span class="text-sm font-medium">{{ content.email }}</span>
                    <input v-model="form.email" type="email" required class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" :disabled="step > 1">
                </label>

                <template v-if="step >= 2">
                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.otp }}</span>
                        <input v-model="form.code" type="text" maxlength="6" minlength="6" required class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" :disabled="step > 2">
                    </label>
                </template>

                <template v-if="step >= 3">
                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.password }}</span>
                        <input v-model="form.password" type="password" required class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500">
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.confirmPassword }}</span>
                        <input v-model="form.password_confirmation" type="password" required class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500">
                    </label>
                </template>

                <p v-if="notice" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ notice }}</p>
                <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

                <button
                    v-if="step === 1"
                    type="button"
                    class="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    :disabled="sending"
                    @click="sendOtp"
                >
                    {{ sending ? '...' : content.sendOtp }}
                </button>

                <button
                    v-if="step === 2"
                    type="button"
                    class="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    :disabled="verifying"
                    @click="verifyOtp"
                >
                    {{ verifying ? '...' : content.verifyOtp }}
                </button>

                <button
                    v-if="step === 3"
                    type="button"
                    class="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    :disabled="resetting"
                    @click="resetPassword"
                >
                    {{ resetting ? '...' : content.resetPassword }}
                </button>
            </form>

            <p class="mt-6 text-sm text-slate-500">
                <RouterLink :to="{ name: 'login', params: { locale } }" class="font-semibold text-blue-600">{{ content.signIn }}</RouterLink>
            </p>
        </div>
    </div>
</template>
