<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';

const route = useRoute();
const router = useRouter();
const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const isArabic = computed(() => locale.value === 'ar');

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const notice = ref('');

const bankDetails = ref({
    account_name: 'Marasim Events LLC',
    bank_name: 'National Bank',
    account_number: '0000000000',
    iban: '',
    currency: 'SAR',
});

const plans = ref([]);
const selectedPlan = ref('basic');
const status = ref('trial');
const currentPlan = ref('basic');
const fallbackPlans = [
    {
        key: 'basic',
        name: 'Basic',
        price_label: 'Free Trial / Entry Plan',
        description: 'Suitable for starting with one event workflow.',
    },
    {
        key: 'pro',
        name: 'Pro',
        price_label: 'Professional Plan',
        description: 'For growing teams with heavier invitation operations.',
    },
    {
        key: 'enterprise',
        name: 'Enterprise',
        price_label: 'Custom Pricing',
        description: 'For organizations that need advanced scale and support.',
    },
];

const form = ref({
    reference_number: '',
    note: '',
    receipt: null,
});

const displayPlans = computed(() => (plans.value.length ? plans.value : fallbackPlans));

const statusLabel = computed(() => {
    if (status.value === 'active') return isArabic.value ? 'نشط' : 'Active';
    if (status.value === 'pending_review') return isArabic.value ? 'قيد المراجعة' : 'Pending Review';
    if (status.value === 'rejected') return isArabic.value ? 'مرفوض' : 'Rejected';
    if (status.value === 'expired') return isArabic.value ? 'منتهي' : 'Expired';
    if (status.value === 'cancelled') return isArabic.value ? 'ملغي' : 'Cancelled';
    return isArabic.value ? 'تجريبي' : 'Trial';
});

const statusHint = computed(() => {
    if (status.value === 'active') return isArabic.value ? 'اشتراكك مفعل ويمكنك استخدام جميع الميزات.' : 'Your subscription is active and all features are available.';
    if (status.value === 'pending_review') return isArabic.value ? 'تم استلام الإيصال. بانتظار مراجعة الإدارة.' : 'Receipt received. Waiting for admin approval.';
    if (status.value === 'rejected') return isArabic.value ? 'تم رفض آخر طلب. يمكنك رفع إيصال جديد.' : 'Your last request was rejected. You can submit a new receipt.';
    return isArabic.value ? 'اختر الباقة وارفع الإيصال لتفعيل الاشتراك.' : 'Choose a plan and upload receipt to activate your subscription.';
});

const selectedPlanName = computed(() => {
    const activePlan = displayPlans.value.find((plan) => plan.key === selectedPlan.value);
    return activePlan?.name || selectedPlan.value;
});

const selectedFileName = computed(() => form.value.receipt?.name || '');

const content = computed(() => ({
    title: isArabic.value ? 'الباقات والاشتراك' : 'Plans & Subscription',
    subtitle: isArabic.value ? 'اختر الباقة المناسبة ثم ارفع إيصال التحويل البنكي للمراجعة.' : 'Choose your package and upload your bank transfer receipt for approval.',
    currentStatus: isArabic.value ? 'الحالة الحالية' : 'Current Status',
    currentPlan: isArabic.value ? 'الباقة الحالية' : 'Current Plan',
    statusDetails: isArabic.value ? 'تفاصيل الحالة' : 'Status Details',
    choosePlan: isArabic.value ? 'اختر الباقة' : 'Choose Plan',
    paymentSteps: isArabic.value ? 'خطوات الدفع' : 'Payment Steps',
    step1: isArabic.value ? '1) اختر الباقة المناسبة.' : '1) Select your plan.',
    step2: isArabic.value ? '2) حوّل المبلغ على حساب البنك الموضح.' : '2) Transfer payment using the bank details shown.',
    step3: isArabic.value ? '3) ارفع إيصال الدفع ثم أرسل الطلب.' : '3) Upload your payment receipt and submit.',
    step4: isArabic.value ? '4) انتظر مراجعة الإدارة وتفعيل الباقة.' : '4) Wait for admin review and activation.',
    bankDetails: isArabic.value ? 'بيانات التحويل البنكي' : 'Bank Transfer Details',
    accountName: isArabic.value ? 'اسم الحساب' : 'Account Name',
    bankName: isArabic.value ? 'اسم البنك' : 'Bank Name',
    accountNumber: isArabic.value ? 'رقم الحساب' : 'Account Number',
    iban: 'IBAN',
    currency: isArabic.value ? 'العملة' : 'Currency',
    reference: isArabic.value ? 'رقم المرجع (اختياري)' : 'Reference Number (Optional)',
    note: isArabic.value ? 'ملاحظة (اختياري)' : 'Note (Optional)',
    receipt: isArabic.value ? 'إيصال الدفع' : 'Payment Receipt',
    receiptHint: isArabic.value ? 'الأنواع المدعومة: صورة أو PDF' : 'Supported formats: image or PDF',
    selectedFile: isArabic.value ? 'الملف المختار' : 'Selected File',
    noFile: isArabic.value ? 'لم يتم اختيار ملف بعد' : 'No file selected yet',
    selectedPlanLabel: isArabic.value ? 'الباقة المختارة' : 'Selected Plan',
    submit: isArabic.value ? 'إرسال طلب التفعيل' : 'Submit for Approval',
    submitPending: isArabic.value ? 'بانتظار مراجعة الإدارة' : 'Waiting for Admin Review',
    pending: isArabic.value ? 'طلبك قيد المراجعة من الإدارة.' : 'Your request is pending admin review.',
    help: isArabic.value ? 'هل تحتاج مساعدة؟ تواصل مع الدعم أو اطلب من الإدارة مراجعة آخر إيصال رفعته.' : 'Need help? Contact support or ask your admin to review your latest receipt submission.',
    backToDashboard: isArabic.value ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard',
}));

const statusClass = computed(() => {
    if (status.value === 'active') return 'bg-emerald-100 text-emerald-700';
    if (status.value === 'pending_review') return 'bg-amber-100 text-amber-700';
    if (status.value === 'rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-200 text-slate-700';
});

const loadStatus = async () => {
    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.get('/subscription/status');
        status.value = data.subscription_status || 'trial';
        currentPlan.value = data.subscription_plan || 'basic';
        bankDetails.value = data.bank_details || bankDetails.value;
        plans.value = data.plans || [];
        selectedPlan.value = data.subscription_plan || data.plans?.[0]?.key || 'basic';
    } catch (err) {
        error.value = err?.response?.data?.message || 'Failed to load subscription data.';
    } finally {
        loading.value = false;
    }
};

const submitTransfer = async () => {
    error.value = '';
    notice.value = '';

    if (!form.value.receipt) {
        error.value = isArabic.value ? 'يرجى رفع صورة الإيصال.' : 'Please upload your receipt file.';
        return;
    }

    submitting.value = true;

    try {
        const payload = new FormData();
        payload.append('selected_plan', selectedPlan.value);
        payload.append('receipt', form.value.receipt);

        if (form.value.reference_number) payload.append('payment_reference', form.value.reference_number);
        if (form.value.note) payload.append('payment_note', form.value.note);

        const { data } = await api.post('/subscription/bank-transfer', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        notice.value = data.message || content.value.pending;
        form.value.reference_number = '';
        form.value.note = '';
        form.value.receipt = null;
        await loadStatus();
    } catch (err) {
        error.value = err?.response?.data?.message || 'Failed to submit transfer.';
    } finally {
        submitting.value = false;
    }
};

onMounted(loadStatus);
</script>

<template>
    <div :dir="isArabic ? 'rtl' : 'ltr'" class="space-y-6">
        <section class="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e3a8a)] p-8 text-white shadow-xl">
            <h1 class="text-3xl font-black tracking-tight">{{ content.title }}</h1>
            <p class="mt-2 text-slate-200">{{ content.subtitle }}</p>
        </section>

        <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-900">{{ content.currentStatus }}</h2>

                <div v-if="loading" class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Loading...</div>

                <template v-else>
                    <div class="mt-4 flex flex-wrap items-center gap-3">
                        <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClass">{{ status }}</span>
                        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{{ statusLabel }}</span>
                        <span class="text-sm text-slate-500">{{ content.currentPlan }}: <strong class="text-slate-800">{{ currentPlan }}</strong></span>
                    </div>

                    <div class="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">{{ content.statusDetails }}</p>
                        <p class="mt-1 text-sm text-blue-900">{{ statusHint }}</p>
                    </div>

                    <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">{{ content.paymentSteps }}</p>
                        <ul class="mt-2 space-y-1 text-sm text-slate-700">
                            <li>{{ content.step1 }}</li>
                            <li>{{ content.step2 }}</li>
                            <li>{{ content.step3 }}</li>
                            <li>{{ content.step4 }}</li>
                        </ul>
                    </div>

                    <h3 class="mt-6 text-base font-semibold text-slate-900">{{ content.choosePlan }}</h3>
                    <div class="mt-3 grid gap-3 sm:grid-cols-3">
                        <label
                            v-for="plan in displayPlans"
                            :key="plan.key"
                            class="cursor-pointer rounded-2xl border p-4 transition"
                            :class="selectedPlan === plan.key ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'"
                        >
                            <input v-model="selectedPlan" :value="plan.key" type="radio" class="hidden">
                            <p class="text-sm font-semibold text-slate-900">{{ plan.name }}</p>
                            <p class="mt-1 text-xs text-slate-500">{{ plan.price_label }}</p>
                            <p class="mt-2 text-xs text-slate-600">{{ plan.description }}</p>
                        </label>
                    </div>

                    <form class="mt-6 grid gap-4" @submit.prevent="submitTransfer">
                        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <span class="font-semibold">{{ content.selectedPlanLabel }}:</span>
                            <span class="ml-1">{{ selectedPlanName }}</span>
                        </div>

                        <label class="grid gap-2 !opacity-100">
                            <span class="!text-black !opacity-100 text-sm font-semibold">{{ content.reference }}</span>
                            <input v-model="form.reference_number" type="text" class="rounded-xl border border-slate-400 bg-white px-4 py-3 text-black outline-none transition placeholder:text-slate-500 focus:border-blue-600 !border-slate-500 !text-black !opacity-100">
                        </label>

                        <label class="grid gap-2 !opacity-100">
                            <span class="!text-black !opacity-100 text-sm font-semibold">{{ content.note }}</span>
                            <textarea v-model="form.note" rows="3" class="rounded-xl border border-slate-400 bg-white px-4 py-3 text-black outline-none transition placeholder:text-slate-500 focus:border-blue-600 !border-slate-500 !text-black !opacity-100" />
                        </label>

                        <label class="grid gap-2 !opacity-100">
                            <span class="!text-black !opacity-100 text-sm font-semibold">{{ content.receipt }}</span>
                            <input type="file" accept="image/*,.pdf" class="rounded-xl border border-slate-400 bg-white px-3 py-2 text-black file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700 !border-slate-500 !text-black !opacity-100" @change="(e) => form.receipt = e.target.files?.[0] || null">
                            <span class="text-xs !text-slate-800 !opacity-100">{{ content.receiptHint }}</span>
                            <span class="text-sm !text-black !opacity-100">
                                <strong class="!text-black">{{ content.selectedFile }}:</strong>
                                {{ selectedFileName || content.noFile }}
                            </span>
                        </label>

                        <p v-if="notice" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ notice }}</p>
                        <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

                        <button
                            class="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                            type="submit"
                            :disabled="submitting || status === 'pending_review'"
                        >
                            {{ status === 'pending_review' ? content.submitPending : (submitting ? '...' : content.submit) }}
                        </button>
                    </form>
                </template>
            </div>

            <aside class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-900">{{ content.bankDetails }}</h2>
                <dl class="mt-4 space-y-3 text-sm">
                    <div class="rounded-xl bg-slate-50 p-3">
                        <dt class="text-slate-500">{{ content.accountName }}</dt>
                        <dd class="font-semibold text-slate-900">{{ bankDetails.account_name }}</dd>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-3">
                        <dt class="text-slate-500">{{ content.bankName }}</dt>
                        <dd class="font-semibold text-slate-900">{{ bankDetails.bank_name }}</dd>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-3">
                        <dt class="text-slate-500">{{ content.accountNumber }}</dt>
                        <dd class="font-semibold text-slate-900">{{ bankDetails.account_number }}</dd>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-3" v-if="bankDetails.iban">
                        <dt class="text-slate-500">{{ content.iban }}</dt>
                        <dd class="font-semibold text-slate-900">{{ bankDetails.iban }}</dd>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-3">
                        <dt class="text-slate-500">{{ content.currency }}</dt>
                        <dd class="font-semibold text-slate-900">{{ bankDetails.currency }}</dd>
                    </div>
                </dl>
            </aside>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
                {{ content.help }}
            </p>
            <button class="mt-3 text-sm font-semibold text-blue-700" @click="router.push({ name: 'dashboard', params: { locale } })">{{ content.backToDashboard }}</button>
        </section>
    </div>
</template>
