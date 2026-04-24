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

const loading = ref(false);
const resending = ref(false);
const error = ref('');
const notice = ref('');
const otp = ref('');

const pending = ref(null);

try {
    pending.value = JSON.parse(sessionStorage.getItem('pending_registration') || 'null');
} catch {
    pending.value = null;
}

if (!pending.value?.email) {
    router.replace({ name: 'register', params: { locale: locale.value } });
}

if (pending.value?.debug_code) {
    notice.value = `${pending.value.otp_message || 'Email delivery is unavailable right now. Use the OTP shown below to continue.'} (${pending.value.debug_code})`;
} else if (pending.value?.otp_message) {
    notice.value = pending.value.otp_message;
}

const content = computed(() => ({
    title: isArabic.value ? 'تحقق البريد الإلكتروني' : 'Verify Email',
    subtitle: isArabic.value ? 'أدخل رمز التحقق الذي تم إرساله إلى بريدك لإكمال إنشاء الحساب.' : 'Enter the verification code sent to your email to complete account creation.',
    otpLabel: isArabic.value ? 'رمز التحقق (OTP)' : 'Verification OTP',
    resendOtp: isArabic.value ? 'إعادة إرسال OTP' : 'Resend OTP',
    completeRegistration: isArabic.value ? 'إكمال إنشاء الحساب' : 'Complete Registration',
    sending: isArabic.value ? 'جاري الإرسال...' : 'Sending...',
    creating: isArabic.value ? 'جاري الإنشاء...' : 'Creating account...',
    back: isArabic.value ? 'الرجوع' : 'Back',
    sentHint: isArabic.value ? 'تم إرسال OTP إلى بريدك الإلكتروني.' : 'OTP was sent to your email.',
    doneHint: isArabic.value ? 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.' : 'Account created successfully. You can sign in now.',
}));

const resendOtp = async () => {
    error.value = '';
    notice.value = '';
    resending.value = true;

    try {
        const { data } = await api.post('/auth/register/send-otp', { email: pending.value.email });
        pending.value = {
            ...pending.value,
            otp_message: data.message || null,
            delivery_channel: data.delivery_channel || null,
            debug_code: data.debug_code || null,
        };
        sessionStorage.setItem('pending_registration', JSON.stringify(pending.value));
        notice.value = data.debug_code
            ? `${data.message || content.value.sentHint} (${data.debug_code})`
            : (data.message || content.value.sentHint);
    } catch (err) {
        error.value = err?.response?.data?.message || 'Failed to resend OTP.';
    } finally {
        resending.value = false;
    }
};

const submit = async () => {
    error.value = '';
    notice.value = '';

    if (!otp.value || otp.value.length !== 6) {
        error.value = isArabic.value ? 'أدخل OTP صحيح من 6 أرقام.' : 'Enter a valid 6-digit OTP.';
        return;
    }

    loading.value = true;

    try {
        await api.post('/auth/register/verify-otp', {
            email: pending.value.email,
            code: otp.value,
        });

        await api.post('/auth/register', {
            name: pending.value.name,
            email: pending.value.email,
            phone: pending.value.phone,
            password: pending.value.password,
            password_confirmation: pending.value.password_confirmation,
            otp_code: otp.value,
        });

        sessionStorage.removeItem('pending_registration');
        notice.value = content.value.doneHint;

        setTimeout(() => {
            router.push({ name: 'login', params: { locale: locale.value }, query: { registered: '1' } });
        }, 900);
    } catch (err) {
        error.value = err?.response?.data?.message || Object.values(err?.response?.data?.errors || {}).flat()[0] || 'Verification failed.';
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

        <div class="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-[1fr_1fr]">
            <section class="rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
                <p class="text-sm uppercase tracking-[0.28em] text-blue-300">Secure Signup</p>
                <h1 class="mt-4 text-4xl font-bold leading-tight">{{ content.title }}</h1>
                <p class="mt-4 text-lg text-slate-300">{{ content.subtitle }}</p>

                <div class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                    <p class="mt-1 font-semibold text-white">{{ pending?.email }}</p>
                </div>
            </section>

            <section class="rounded-3xl bg-white p-8 shadow-2xl">
                <h2 class="text-2xl font-bold text-slate-900">{{ content.title }}</h2>
                <p class="mt-2 text-sm text-slate-500">{{ content.subtitle }}</p>

                <form class="mt-8 grid gap-4" @submit.prevent="submit">
                    <label class="grid gap-2">
                        <span class="text-sm font-medium">{{ content.otpLabel }}</span>
                        <input
                            v-model="otp"
                            class="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                            type="text"
                            maxlength="6"
                            minlength="6"
                            required
                        >
                    </label>

                    <p v-if="notice" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ notice }}</p>
                    <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                            type="button"
                            :disabled="resending"
                            @click="resendOtp"
                        >
                            {{ resending ? content.sending : content.resendOtp }}
                        </button>

                        <button
                            class="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                            type="submit"
                            :disabled="loading"
                        >
                            {{ loading ? content.creating : content.completeRegistration }}
                        </button>
                    </div>

                    <button
                        type="button"
                        class="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                        @click="router.push({ name: 'register', params: { locale } })"
                    >
                        {{ content.back }}
                    </button>
                </form>
            </section>
        </div>
    </div>
</template>
