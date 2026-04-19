<script setup>
import LocaleSwitch from '../components/common/LocaleSwitch.vue';
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStoredUser } from '../lib/auth';

const route = useRoute();
const router = useRouter();
const logoUrl = '/logo2.png';

const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const isArabic = computed(() => locale.value === 'ar');

const features = [
    {
        icon: '📩',
        title: { en: 'Digital Invitations', ar: 'دعوات رقمية' },
        description: {
            en: 'Create beautiful digital invitations and send them via WhatsApp instantly.',
            ar: 'أنشئ دعوات رقمية أنيقة وأرسلها عبر واتساب بشكل فوري.',
        },
    },
    {
        icon: '📋',
        title: { en: 'Guest Management', ar: 'إدارة الضيوف' },
        description: {
            en: 'Upload guest lists, track RSVPs, and manage responses in real-time.',
            ar: 'ارفع قوائم الضيوف، وتابع الردود، وأدر الاستجابات بشكل مباشر.',
        },
    },
    {
        icon: '📱',
        title: { en: 'QR Check-in', ar: 'تسجيل حضور QR' },
        description: {
            en: 'Generate unique QR codes for each guest and track attendance live.',
            ar: 'أنشئ رمز QR فريد لكل ضيف وتابع الحضور لحظة بلحظة.',
        },
    },
    {
        icon: '📊',
        title: { en: 'Analytics & Reports', ar: 'التحليلات والتقارير' },
        description: {
            en: 'Get detailed reports on invitations sent, RSVPs, and attendance rates.',
            ar: 'احصل على تقارير مفصلة عن الدعوات المرسلة والردود ونسب الحضور.',
        },
    },
    {
        icon: '🌐',
        title: { en: 'Bilingual Support', ar: 'دعم ثنائي اللغة' },
        description: {
            en: 'Full Arabic and English support for invitations and dashboard.',
            ar: 'دعم كامل للعربية والإنجليزية في الدعوات ولوحة التحكم.',
        },
    },
    {
        icon: '🔒',
        title: { en: 'Secure & Reliable', ar: 'آمن وموثوق' },
        description: {
            en: 'Enterprise-grade security with Laravel, Sanctum, and MySQL.',
            ar: 'أمان موثوق بمعايير احترافية مع Laravel و Sanctum و MySQL.',
        },
    },
];

const steps = [
    {
        number: '1',
        title: { en: 'Create Your Event', ar: 'أنشئ فعاليتك' },
        description: {
            en: 'Set up your event details — name, date, venue, and guest count.',
            ar: 'أدخل تفاصيل الفعالية مثل الاسم والتاريخ والمكان وعدد الضيوف.',
        },
    },
    {
        number: '2',
        title: { en: 'Add Your Guests', ar: 'أضف ضيوفك' },
        description: {
            en: 'Upload your guest list via CSV/Excel or add them manually.',
            ar: 'ارفع قائمة الضيوف عبر CSV أو Excel أو أضفهم يدويًا.',
        },
    },
    {
        number: '3',
        title: { en: 'Send & Track', ar: 'أرسل وتابع' },
        description: {
            en: 'Send invitations and track RSVPs and attendance in real-time.',
            ar: 'أرسل الدعوات وتابع الردود والحضور بشكل مباشر.',
        },
    },
];

const plans = [
    {
        name: { en: 'Basic', ar: 'الأساسية' },
        price: '$29.99',
        period: { en: '/month', ar: '/شهريًا' },
        popular: false,
        features: {
            en: ['1 Event', '200 Guests', 'QR Codes', 'Basic Reports'],
            ar: ['فعالية واحدة', '200 ضيف', 'رموز QR', 'تقارير أساسية'],
        },
    },
    {
        name: { en: 'Pro', ar: 'الاحترافية' },
        price: '$99.99',
        period: { en: '/month', ar: '/شهريًا' },
        popular: true,
        features: {
            en: ['5 Events', '1,000 Guests', 'Advanced Reports', 'Excel Export'],
            ar: ['5 فعاليات', '1000 ضيف', 'تقارير متقدمة', 'تصدير Excel'],
        },
    },
    {
        name: { en: 'Enterprise', ar: 'المؤسسات' },
        price: '$299.99',
        period: { en: '/month', ar: '/شهريًا' },
        popular: false,
        features: {
            en: ['Unlimited Events', 'Unlimited Guests', 'Priority Support', 'Custom Branding'],
            ar: ['فعاليات غير محدودة', 'ضيوف غير محدودين', 'دعم أولوية', 'هوية مخصصة'],
        },
    },
];

const content = computed(() => ({
    navFeatures: isArabic.value ? 'المميزات' : 'Features',
    navHowItWorks: isArabic.value ? 'كيف يعمل' : 'How it Works',
    navPricing: isArabic.value ? 'الأسعار' : 'Pricing',
    signIn: isArabic.value ? 'تسجيل الدخول' : 'Sign In',
    createInvitation: isArabic.value ? 'إنشاء دعوة' : 'Create Invitation',
    heroBadge: isArabic.value ? 'ابدأ مجانًا، بدون بطاقة ائتمان' : 'Start Free — No Credit Card Required',
    heroTitlePrefix: isArabic.value ? 'أنشئ دعوات رقمية' : 'Create Digital Invitations',
    heroTitleAccent: isArabic.value ? 'بسهولة' : 'Easily',
    heroDescription: isArabic.value
        ? 'أدر فعالياتك، وأرسل دعوات واتساب، وتابع الردود، ونظم تسجيل الحضور عبر QR من منصة واحدة.'
        : 'Manage events, send invitations, track RSVPs, and handle QR check-ins — all from one powerful platform.',
    heroSecondaryCta: isArabic.value ? 'شاهد كيف يعمل' : 'See How it Works',
    dashboardUrl: 'marasim.digital/dashboard',
    guestsInvited: isArabic.value ? 'تمت دعوته' : 'Guests Invited',
    confirmed: isArabic.value ? 'مؤكد' : 'Confirmed',
    checkedIn: isArabic.value ? 'تم تسجيل حضوره' : 'Checked In',
    weeklyActivity: isArabic.value ? 'النشاط الأسبوعي للدعوات' : 'Weekly Invitation Activity',
    howItWorksTitle: isArabic.value ? 'كيف يعمل' : 'How It Works',
    howItWorksDescription: isArabic.value ? 'ابدأ في 3 خطوات بسيطة' : 'Get started in 3 simple steps',
    featuresTitle: isArabic.value ? 'كل ما تحتاجه' : 'Everything You Need',
    featuresDescription: isArabic.value
        ? 'أدوات قوية لإدارة فعالياتك من البداية إلى النهاية'
        : 'Powerful tools to manage your events from start to finish',
    pricingTitle: isArabic.value ? 'أسعار بسيطة وواضحة' : 'Simple, Transparent Pricing',
    pricingDescription: isArabic.value ? 'ابدأ مجانًا وقم بالترقية عندما تكون جاهزًا' : "Start free, upgrade when you're ready",
    mostPopular: isArabic.value ? 'الأكثر شيوعًا' : 'MOST POPULAR',
    getStarted: isArabic.value ? 'ابدأ الآن' : 'Get Started',
    ctaTitle: isArabic.value ? 'جاهز لتبسيط إدارة فعالياتك؟' : 'Ready to Simplify Your Event Management?',
    ctaDescription: isArabic.value
        ? 'انضم إلى منظمي الفعاليات الذين يستخدمون Marasim لإنشاء دعوات رقمية مميزة.'
        : 'Join event organizers who use Marasim to create stunning digital invitations.',
    ctaButton: isArabic.value ? 'أنشئ دعوتك' : 'Create Your Invitation',
    footerNote: isArabic.value ? 'لا حاجة إلى بطاقة ائتمان · توجد خطة مجانية' : 'No credit card required · Free plan available',
    footerRights: isArabic.value ? 'جميع الحقوق محفوظة.' : 'All rights reserved.',
}));

onMounted(() => {
    if (getStoredUser()) {
        router.replace({ name: 'dashboard', params: { locale: locale.value } });
    }
});
</script>

<template>
    <div :dir="isArabic ? 'rtl' : 'ltr'" class="min-h-screen bg-white text-gray-900">
        <nav class="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
            <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <RouterLink :to="{ name: 'home', params: { locale } }" class="flex items-center">
                    <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg">
                        <img :src="logoUrl" alt="Marasim Logo" class="h-20 w-20 object-contain">
                    </div>
                </RouterLink>

                <div class="hidden items-center gap-6 md:flex">
                    <a class="text-sm text-gray-600 hover:text-gray-900" href="#features">{{ content.navFeatures }}</a>
                    <a class="text-sm text-gray-600 hover:text-gray-900" href="#how-it-works">{{ content.navHowItWorks }}</a>
                    <a class="text-sm text-gray-600 hover:text-gray-900" href="#pricing">{{ content.navPricing }}</a>
                </div>

                <div class="flex items-center gap-3">
                    <LocaleSwitch />
                    <RouterLink :to="{ name: 'login', params: { locale } }" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">{{ content.signIn }}</RouterLink>
                    <RouterLink :to="{ name: 'register', params: { locale } }" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">{{ content.createInvitation }}</RouterLink>
                </div>
            </div>
        </nav>

        <section class="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-4xl text-center">
                <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">✨ {{ content.heroBadge }}</div>
                <h1 class="mb-6 text-5xl font-extrabold leading-tight text-gray-900 sm:text-6xl">
                    {{ content.heroTitlePrefix }} <span class="text-blue-600">{{ content.heroTitleAccent }}</span>
                </h1>
                <p class="mx-auto mb-10 max-w-2xl text-xl text-gray-600">{{ content.heroDescription }}</p>
                <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <RouterLink :to="{ name: 'register', params: { locale } }" class="w-full rounded-lg bg-blue-600 px-8 py-3.5 text-center font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto">
                        {{ content.createInvitation }} →
                    </RouterLink>
                    <a class="w-full rounded-lg border border-gray-300 px-8 py-3.5 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto" href="#how-it-works">
                        {{ content.heroSecondaryCta }}
                    </a>
                </div>

                <div class="relative mt-16">
                    <div class="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white shadow-2xl">
                        <div class="flex items-center gap-2 bg-gray-800 px-4 py-3">
                            <div class="flex gap-1.5">
                                <div class="h-3 w-3 rounded-full bg-red-400" />
                                <div class="h-3 w-3 rounded-full bg-yellow-400" />
                                <div class="h-3 w-3 rounded-full bg-green-400" />
                            </div>
                            <div class="flex-1 text-center text-xs text-gray-400">{{ content.dashboardUrl }}</div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-50 via-white to-sky-50 p-8">
                            <div class="mb-6 grid grid-cols-3 gap-4">
                                <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                    <div class="text-2xl font-bold text-blue-600">248</div>
                                    <div class="text-sm text-gray-500">{{ content.guestsInvited }}</div>
                                </div>
                                <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                    <div class="text-2xl font-bold text-green-600">186</div>
                                    <div class="text-sm text-gray-500">{{ content.confirmed }}</div>
                                </div>
                                <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                    <div class="text-2xl font-bold text-purple-600">142</div>
                                    <div class="text-sm text-gray-500">{{ content.checkedIn }}</div>
                                </div>
                            </div>
                            <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <div class="flex h-32 items-end justify-around gap-2">
                                    <div v-for="(height, index) in [40, 65, 85, 70, 90, 75, 95]" :key="index" class="w-full rounded-t-md bg-blue-500" :style="{ height: `${height}%` }" />
                                </div>
                                <div class="mt-2 text-center text-xs text-gray-400">{{ content.weeklyActivity }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="how-it-works" class="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-5xl">
                <div class="mb-16 text-center">
                    <h2 class="mb-4 text-3xl font-bold text-gray-900">{{ content.howItWorksTitle }}</h2>
                    <p class="text-lg text-gray-600">{{ content.howItWorksDescription }}</p>
                </div>
                <div class="grid gap-8 md:grid-cols-3">
                    <div v-for="step in steps" :key="step.number" class="text-center">
                        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">{{ step.number }}</div>
                        <h3 class="mb-3 text-xl font-semibold text-gray-900">{{ step.title[locale] }}</h3>
                        <p class="text-gray-600">{{ step.description[locale] }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" class="px-4 py-20 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-6xl">
                <div class="mb-16 text-center">
                    <h2 class="mb-4 text-3xl font-bold text-gray-900">{{ content.featuresTitle }}</h2>
                    <p class="text-lg text-gray-600">{{ content.featuresDescription }}</p>
                </div>
                <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div v-for="feature in features" :key="feature.title.en" class="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
                        <div class="mb-4 text-3xl">{{ feature.icon }}</div>
                        <h3 class="mb-2 text-lg font-semibold text-gray-900">{{ feature.title[locale] }}</h3>
                        <p class="text-sm text-gray-600">{{ feature.description[locale] }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="pricing" class="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-5xl">
                <div class="mb-16 text-center">
                    <h2 class="mb-4 text-3xl font-bold text-gray-900">{{ content.pricingTitle }}</h2>
                    <p class="text-lg text-gray-600">{{ content.pricingDescription }}</p>
                </div>
                <div class="grid gap-8 md:grid-cols-3">
                    <div v-for="plan in plans" :key="plan.name.en" :class="plan.popular ? 'relative overflow-hidden rounded-xl border-2 border-blue-600 bg-white shadow-xl' : 'overflow-hidden rounded-xl border-2 border-gray-200 bg-white'">
                        <div v-if="plan.popular" class="bg-blue-600 py-1.5 text-center text-xs font-bold text-white">{{ content.mostPopular }}</div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-900">{{ plan.name[locale] }}</h3>
                            <div class="mt-4 flex items-baseline">
                                <span class="text-4xl font-extrabold text-gray-900">{{ plan.price }}</span>
                                <span class="ml-1 text-gray-500">{{ plan.period[locale] }}</span>
                            </div>
                            <ul class="mt-6 space-y-3">
                                <li v-for="feature in plan.features[locale]" :key="feature" class="flex items-center gap-2 text-sm text-gray-700">
                                    <span class="text-green-500">✓</span>
                                    {{ feature }}
                                </li>
                            </ul>
                            <RouterLink :to="{ name: 'register', params: { locale } }" :class="plan.popular ? 'mt-6 block rounded-lg bg-blue-600 py-2.5 text-center font-medium text-white transition-colors hover:bg-blue-700' : 'mt-6 block rounded-lg bg-gray-100 py-2.5 text-center font-medium text-gray-900 transition-colors hover:bg-gray-200'">
                                {{ content.getStarted }}
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="px-4 py-20 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-3xl text-center">
                <h2 class="mb-4 text-3xl font-bold text-gray-900">{{ content.ctaTitle }}</h2>
                <p class="mb-8 text-lg text-gray-600">{{ content.ctaDescription }}</p>
                <RouterLink :to="{ name: 'register', params: { locale } }" class="inline-block rounded-lg bg-blue-600 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700">
                    {{ content.ctaButton }} →
                </RouterLink>
                <p class="mt-4 text-sm text-gray-500">{{ content.footerNote }}</p>
            </div>
        </section>

        <footer class="bg-gray-900 px-4 py-12 text-white sm:px-6 lg:px-8">
            <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
                <div class="flex items-center gap-2">
                    <div class="h-8 w-8 overflow-hidden">
                        <img :src="logoUrl" alt="Marasim Logo" class="h-full w-full object-contain">
                    </div>
                    <span class="text-lg font-bold">Marasim</span>
                </div>
                <p class="text-sm text-slate-300">© {{ new Date().getFullYear() }} Marasim. {{ content.footerRights }}</p>
            </div>
        </footer>
    </div>
</template>