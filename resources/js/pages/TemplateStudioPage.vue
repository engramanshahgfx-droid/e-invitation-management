<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../lib/api';
import { getStoredUser } from '../lib/auth';
import { getStoredEventId } from '../lib/eventFlow';

const route = useRoute();
const router = useRouter();

const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const isArabic = computed(() => locale.value === 'ar');
const textAlignClass = computed(() => (isArabic.value ? 'text-right' : 'text-left'));
const selectedEventId = computed(() => String(route.query.event_id || getStoredEventId() || ''));
const organizer = ref(getStoredUser());
const templateSaving = ref(false);
const templateSaveNotice = ref('');
const templateSaveError = ref('');

const normalizeJsonObject = (value) => {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }

    return {};
};

const templates = [
    {
        id: 'royal',
        name: 'Royal Ceremony',
        nameAr: 'المراسم الملكية',
        tagline: 'Gold-trimmed editorial layout for formal weddings and premium galas.',
        taglineAr: 'تخطيط تحريري مذهّب لحفلات الزفاف الراقية والمناسبات الفاخرة.',
        category: 'Luxury',
        categoryAr: 'فاخر',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        palette: { primary: '#231942', secondary: '#d4af37', accent: '#f3e9d2', background: '#f8f3ea' },
        features: ['Editorial header', 'Framed details', 'Formal RSVP block'],
    },
    {
        id: 'garden',
        name: 'Garden Soiree',
        nameAr: 'أمسية الحديقة',
        tagline: 'Soft botanical styling with romantic spacing and pastel highlights.',
        taglineAr: 'تصميم نباتي ناعم بمساحات رومانسية ولمسات لونية هادئة.',
        category: 'Romantic',
        categoryAr: 'رومانسي',
        fontFamily: '"Playfair Display", Georgia, serif',
        palette: { primary: '#355c4b', secondary: '#d99f8c', accent: '#f3d8c7', background: '#fbf6f1' },
        features: ['Botanical corners', 'Soft card layers', 'Warm ceremony notes'],
    },
    {
        id: 'modern',
        name: 'Modern Glow',
        nameAr: 'وهج عصري',
        tagline: 'Confident gradient composition for product launches and modern celebrations.',
        taglineAr: 'تكوين جريء بتدرجات لونية لحفلات الإطلاق والاحتفالات الحديثة.',
        category: 'Contemporary',
        categoryAr: 'معاصر',
        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
        palette: { primary: '#0f172a', secondary: '#2563eb', accent: '#7dd3fc', background: '#e0f2fe' },
        features: ['Gradient surfaces', 'Bold typography', 'Timeline summary'],
    },
    {
        id: 'minimal',
        name: 'Minimal Monograph',
        nameAr: 'مخطوطة بسيطة',
        tagline: 'Quiet monochrome layout for refined private dinners and studio events.',
        taglineAr: 'تخطيط أحادي هادئ لعشاء خاص وفعاليات الاستوديو الراقية.',
        category: 'Minimal',
        categoryAr: 'بسيط',
        fontFamily: '"Helvetica Neue", "Arial Narrow", sans-serif',
        palette: { primary: '#111111', secondary: '#5c5c5c', accent: '#d4d4d4', background: '#f7f7f5' },
        features: ['Monochrome look', 'Quiet spacing', 'Editorial footer'],
    },
    {
        id: 'gala',
        name: 'Midnight Gala',
        nameAr: 'حفل منتصف الليل',
        tagline: 'High-contrast black-tie presentation with dramatic lighting accents.',
        taglineAr: 'عرض عالي التباين بطابع السهرة الرسمية ولمسات ضوئية درامية.',
        category: 'Black Tie',
        categoryAr: 'رسمي',
        fontFamily: '"Didot", "Times New Roman", serif',
        palette: { primary: '#f8fafc', secondary: '#f59e0b', accent: '#7c3aed', background: '#020617' },
        features: ['Night gradient', 'Stage-like framing', 'VIP detail row'],
    },
    {
        id: 'professional',
        name: 'Executive Brief',
        nameAr: 'الدعوة التنفيذية',
        tagline: 'Structured business invitation for forums, summits, and board events.',
        taglineAr: 'دعوة أعمال منظمة للقمم والمنتديات والاجتماعات الرفيعة.',
        category: 'Corporate',
        categoryAr: 'شركات',
        fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
        palette: { primary: '#0b1f3a', secondary: '#1d4ed8', accent: '#bfdbfe', background: '#eff6ff' },
        features: ['Agenda strip', 'Speaker-ready layout', 'Formal contact panel'],
    },
];

const activeTemplate = ref('royal');

const form = ref({
    event_name: 'Catherine & Adrian',
    host_name: 'Catherine and Adrian Families',
    date: '2026-07-15',
    time: '18:00',
    location: 'The Swan House, Atlanta',
    description: 'invite you to celebrate a memorable evening of ceremony, dinner, and music.',
    dress_code: 'Formal Attire',
    rsvp_by: '2026-07-01',
    guest_name: '',
    special_note: 'Reception begins immediately after the main ceremony.',
});

const colors = ref({
    primary: templates[0].palette.primary,
    secondary: templates[0].palette.secondary,
    accent: templates[0].palette.accent,
    background: templates[0].palette.background,
});

const activeTemplateConfig = computed(() => templates.find((item) => item.id === activeTemplate.value) || templates[0]);

const content = computed(() => ({
    eyebrow: isArabic.value ? 'استوديو القوالب' : 'Template Studio',
    title: isArabic.value ? 'صمّم دعوات متعددة بأساليب احترافية' : 'Design Invitations In Multiple Professional Styles',
    subtitle: isArabic.value ? 'اختر الاتجاه البصري، عدّل المحتوى والألوان، ثم انتقل لإنشاء الدعوات ومشاركتها.' : 'Choose a visual direction, adjust the content and palette, then continue to create and share invitations.',
    eventLink: isArabic.value ? 'مرتبط بالفعالية رقم' : 'Connected to event ID',
    fillSample: isArabic.value ? 'تحميل نموذج فاخر' : 'Load Premium Sample',
    applyPalette: isArabic.value ? 'تطبيق ألوان القالب' : 'Apply Template Palette',
    saveTemplate: isArabic.value ? 'حفظ القالب' : 'Save Template',
    saveAndOpenInvitations: isArabic.value ? 'احفظ وافتح الدعوات' : 'Save & Open Invitations',
    savingTemplate: isArabic.value ? 'جارٍ الحفظ...' : 'Saving...',
    templateSaved: isArabic.value ? 'تم حفظ القالب لهذه الفعالية. يمكن الآن إرسال نفس التصميم للضيوف.' : 'Template saved for this event. Guests will receive this exact design.',
    saveRequiresEvent: isArabic.value ? 'اختر فعالية أولاً لحفظ القالب ومشاركته مع الضيوف.' : 'Select an event first to save this template for guest sending.',
    saveFailed: isArabic.value ? 'تعذر حفظ القالب. حاول مرة أخرى.' : 'Failed to save template. Please try again.',
    back: isArabic.value ? 'العودة إلى الدعوات' : 'Back to Invitations',
    gallery: isArabic.value ? 'معرض الاتجاهات' : 'Style Gallery',
    galleryHint: isArabic.value ? 'كل بطاقة تمثل لغة تصميم مختلفة للدعوات العامة، الخاصة، أو المؤسسية.' : 'Each card represents a distinct design language for social, premium, and corporate invitations.',
    contentTitle: isArabic.value ? 'محتوى الدعوة' : 'Invitation Content',
    paletteTitle: isArabic.value ? 'لوحة الألوان' : 'Color Palette',
    directionTitle: isArabic.value ? 'ملاحظات الأسلوب' : 'Style Notes',
    previewTitle: isArabic.value ? 'المعاينة الحية' : 'Live Preview',
    chooseTemplate: isArabic.value ? 'اختر القالب' : 'Choose Template',
    eventName: isArabic.value ? 'اسم الفعالية' : 'Event Name',
    hostName: isArabic.value ? 'المضيف أو الجهة المنظمة' : 'Host / Organizer',
    location: isArabic.value ? 'الموقع' : 'Location',
    description: isArabic.value ? 'وصف مختصر' : 'Short Description',
    dressCode: isArabic.value ? 'الزي المقترح' : 'Dress Code',
    guestName: isArabic.value ? 'اسم الضيف (اختياري)' : 'Guest Name (Optional)',
    specialNote: isArabic.value ? 'ملاحظة خاصة' : 'Special Note',
    primary: isArabic.value ? 'اللون الأساسي' : 'Primary',
    secondary: isArabic.value ? 'الثانوي' : 'Secondary',
    accent: isArabic.value ? 'الإبراز' : 'Accent',
    background: isArabic.value ? 'الخلفية' : 'Background',
    date: isArabic.value ? 'التاريخ' : 'Date',
    time: isArabic.value ? 'الوقت' : 'Time',
    rsvp: isArabic.value ? 'الرد قبل' : 'RSVP by',
    hostedBy: isArabic.value ? 'بدعوة من' : 'Hosted by',
    attire: isArabic.value ? 'الزي' : 'Attire',
    guest: isArabic.value ? 'الضيف' : 'Guest',
    specialAccess: isArabic.value ? 'ملاحظة الوصول' : 'Access Note',
    itinerary: isArabic.value ? 'برنامج الأمسية' : 'Evening Flow',
    agenda: isArabic.value ? 'محاور الحدث' : 'Agenda Snapshot',
    previewCaption: isArabic.value ? 'المعاينة التالية تعكس اتجاه القالب المختار ويمكن تعديلها مباشرة.' : 'The preview below follows the selected art direction and updates live as you edit.',
    organizerContact: isArabic.value ? 'تواصل واتساب مع المنظم' : 'Organizer WhatsApp Contact',
    organizerMissing: isArabic.value ? 'احفظ رقم واتساب المنظم من لوحة التحكم قبل الإرسال.' : 'Save the organizer WhatsApp number from the dashboard before sending.',
}));

const previewFrameStyle = computed(() => ({
    background: activeTemplate.value === 'gala'
        ? `radial-gradient(circle at top, ${colors.value.accent}33 0%, ${colors.value.background} 40%, ${colors.value.primary} 100%)`
        : `linear-gradient(135deg, ${colors.value.background} 0%, #ffffff 78%)`,
}));

const draftStorageKey = computed(() => `marasim_template_draft_${selectedEventId.value || 'global'}`);

function saveTemplateDraft() {
    if (typeof window === 'undefined') {
        return;
    }

    const payload = {
        event_id: selectedEventId.value || null,
        template_id: activeTemplate.value,
        template_data: {
            ...form.value,
        },
        template_customization: {
            colors: {
                ...colors.value,
            },
        },
        saved_at: new Date().toISOString(),
    };

    window.localStorage.setItem(draftStorageKey.value, JSON.stringify(payload));
}

function loadTemplateDraft() {
    if (typeof window === 'undefined') {
        return;
    }

    const rawEvent = window.localStorage.getItem(draftStorageKey.value);
    const rawGlobal = window.localStorage.getItem('marasim_template_draft_global');

    let parsed = null;
    if (rawEvent) {
        try {
            parsed = JSON.parse(rawEvent);
        } catch {
            parsed = null;
        }
    }

    if (!parsed && rawGlobal) {
        try {
            parsed = JSON.parse(rawGlobal);
        } catch {
            parsed = null;
        }
    }

    if (!parsed) {
        return;
    }

    try {
        if (parsed?.template_id) {
            activeTemplate.value = parsed.template_id;
        }

        const canUseTemplateData = !selectedEventId.value
            || !parsed?.event_id
            || String(parsed.event_id) === String(selectedEventId.value);

        if (canUseTemplateData && parsed?.template_data && typeof parsed.template_data === 'object') {
            form.value = {
                ...form.value,
                ...parsed.template_data,
            };
        }

        if (parsed?.template_customization?.colors && typeof parsed.template_customization.colors === 'object') {
            colors.value = {
                ...colors.value,
                ...parsed.template_customization.colors,
            };
        }
    } catch {
        // Ignore corrupt drafts and keep current editor state.
    }
}

const detailCards = computed(() => [
    { label: content.value.date, value: formatDate(form.value.date) },
    { label: content.value.time, value: formatTime(form.value.time) },
    { label: content.value.location, value: form.value.location || '---' },
    { label: content.value.rsvp, value: formatDate(form.value.rsvp_by) },
]);

function formatDate(value) {
    if (!value) return '---';

    try {
        return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(`${value}T00:00:00`));
    } catch {
        return value;
    }
}

function formatTime(value) {
    if (!value) return '---';

    const [hours, minutes] = value.split(':');
    if (!hours || !minutes) return value;

    try {
        return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(2026, 0, 1, Number(hours), Number(minutes)));
    } catch {
        return value;
    }
}

function applyTemplatePalette(templateId = activeTemplate.value) {
    const template = templates.find((item) => item.id === templateId) || templates[0];
    colors.value = { ...template.palette };
}

function selectTemplate(templateId) {
    activeTemplate.value = templateId;
    applyTemplatePalette(templateId);
}

function currentTemplatePayload() {
    return {
        template_id: activeTemplate.value,
        template_data: {
            ...form.value,
        },
        template_customization: {
            colors: {
                ...colors.value,
            },
        },
    };
}

const prefillFromEvent = async () => {
    if (!selectedEventId.value) {
        return;
    }

    try {
        const { data } = await api.get(`/events/${selectedEventId.value}`);
        const event = data.data;
        if (!event) {
            return;
        }

        form.value.event_name = event.title || form.value.event_name;
        form.value.host_name = event.organizer_name || form.value.host_name;
        form.value.date = event.event_date || form.value.date;
        form.value.time = event.event_time || form.value.time;
        form.value.location = event.location || form.value.location;
        form.value.description = event.description || form.value.description;

        if (event.template_id) {
            activeTemplate.value = event.template_id;
            applyTemplatePalette(event.template_id);
        }

        const eventTemplateData = normalizeJsonObject(event.template_data);
        if (Object.keys(eventTemplateData).length > 0) {
            form.value = {
                ...form.value,
                ...eventTemplateData,
            };
        }

        const eventTemplateCustomization = normalizeJsonObject(event.template_customization);
        const eventTemplateColors = normalizeJsonObject(eventTemplateCustomization.colors);
        if (Object.keys(eventTemplateColors).length > 0) {
            colors.value = {
                ...colors.value,
                ...eventTemplateColors,
            };
        }
    } catch {
        // Keep manual values when event prefill fails.
    }
};

function quickFillSample() {
    form.value.event_name = 'Marasim Signature Evening';
    form.value.host_name = 'Marasim Events House';
    form.value.date = '2026-12-10';
    form.value.time = '20:00';
    form.value.location = 'Marasim Royal Hall, Riyadh';
    form.value.description = 'requests the pleasure of your company for a curated evening of hospitality, dining, and celebration.';
    form.value.dress_code = 'Black Tie / National Dress';
    form.value.rsvp_by = '2026-11-25';
    form.value.guest_name = 'Aman Shah';
    form.value.special_note = 'Private valet entrance opens 30 minutes before guest arrival.';
}

async function openInvitations() {
    if (selectedEventId.value) {
        await saveTemplateToEvent();
    }

    await router.push({
        name: 'invitations',
        params: { locale: locale.value },
        query: route.query,
    });
}

async function saveTemplateToEvent() {
    templateSaveNotice.value = '';
    templateSaveError.value = '';

    if (!selectedEventId.value) {
        templateSaveError.value = content.value.saveRequiresEvent;
        return;
    }

    templateSaving.value = true;

    try {
        await api.patch(`/events/${selectedEventId.value}`, currentTemplatePayload());
        templateSaveNotice.value = content.value.templateSaved;
        saveTemplateDraft();
    } catch {
        templateSaveError.value = content.value.saveFailed;
    } finally {
        templateSaving.value = false;
    }
}

watch([activeTemplate, form, colors], saveTemplateDraft, { deep: true });

onMounted(async () => {
    await prefillFromEvent();
    loadTemplateDraft();
    saveTemplateDraft();
});
</script>

<template>
    <section :dir="isArabic ? 'rtl' : 'ltr'" :class="textAlignClass" class="space-y-6">
        <article class="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 text-white shadow-2xl">
            <div class="relative isolate overflow-hidden px-6 py-8 sm:px-8">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,159,140,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.2),transparent_28%),linear-gradient(135deg,#020617,#111827_55%,#1e293b)]" />
                <div class="absolute -right-10 top-0 h-40 w-40 rounded-full border border-white/10 bg-white/5 blur-2xl" />
                <div class="absolute bottom-0 left-0 h-32 w-32 rounded-full border border-amber-300/20 bg-amber-300/10 blur-2xl" />
                <div class="relative z-10 flex flex-wrap items-start justify-between gap-4">
                    <div class="max-w-3xl">
                        <p class="text-xs uppercase tracking-[0.35em] text-amber-300">{{ content.eyebrow }}</p>
                        <h1 class="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">{{ content.title }}</h1>
                        <p class="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">{{ content.subtitle }}</p>
                        <p v-if="selectedEventId" class="mt-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                            {{ content.eventLink }}: {{ selectedEventId }}
                        </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button class="rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800" type="button" @click="quickFillSample">{{ content.fillSample }}</button>
                        <button class="rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-400/20" type="button" @click="applyTemplatePalette()">{{ content.applyPalette }}</button>
                        <button class="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60" type="button" :disabled="templateSaving" @click="saveTemplateToEvent">{{ templateSaving ? content.savingTemplate : content.saveTemplate }}</button>
                        <button class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60" type="button" :disabled="templateSaving" @click="openInvitations">{{ templateSaving ? content.savingTemplate : content.saveAndOpenInvitations }}</button>
                    </div>
                </div>

                <p v-if="templateSaveNotice" class="relative z-10 mt-4 rounded-xl border border-emerald-800/40 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-200">{{ templateSaveNotice }}</p>
                <p v-if="templateSaveError" class="relative z-10 mt-3 rounded-xl border border-rose-800/40 bg-rose-950/40 px-4 py-2 text-sm text-rose-200">{{ templateSaveError }}</p>
            </div>
        </article>

        <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div class="space-y-6">
                <article class="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                    <div class="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 class="text-lg font-semibold text-white">{{ content.gallery }}</h2>
                            <p class="mt-1 text-sm text-slate-400">{{ content.galleryHint }}</p>
                        </div>
                        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ content.chooseTemplate }}</p>
                    </div>

                    <div class="mt-4 grid gap-3 md:grid-cols-2">
                        <button
                            v-for="template in templates"
                            :key="template.id"
                            type="button"
                            class="group overflow-hidden rounded-[1.5rem] border transition duration-200"
                            :class="[
                                textAlignClass,
                                activeTemplate === template.id ? 'border-white/30 bg-slate-950 shadow-lg shadow-black/30' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950',
                            ]"
                            @click="selectTemplate(template.id)"
                        >
                            <div class="h-28 border-b border-white/5 p-4" :style="{ background: `linear-gradient(135deg, ${template.palette.primary}, ${template.palette.secondary})` }">
                                <div class="flex items-start justify-between gap-3">
                                    <span class="rounded-full border border-white/20 bg-black/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">{{ isArabic ? template.categoryAr : template.category }}</span>
                                    <div class="flex gap-1.5">
                                        <span class="h-3 w-3 rounded-full border border-white/25" :style="{ backgroundColor: template.palette.primary }" />
                                        <span class="h-3 w-3 rounded-full border border-white/25" :style="{ backgroundColor: template.palette.secondary }" />
                                        <span class="h-3 w-3 rounded-full border border-white/25" :style="{ backgroundColor: template.palette.accent }" />
                                    </div>
                                </div>
                                <div class="mt-6 text-white" :style="{ fontFamily: template.fontFamily }">
                                    <p class="text-xl font-semibold">{{ isArabic ? template.nameAr : template.name }}</p>
                                    <p class="mt-1 text-xs text-white/80">{{ isArabic ? 'دعوة مصقولة وقابلة للتخصيص' : 'Refined, customizable invitation direction' }}</p>
                                </div>
                            </div>
                            <div class="p-4">
                                <p class="text-sm font-semibold text-white">{{ isArabic ? template.nameAr : template.name }}</p>
                                <p class="mt-1 text-xs leading-5 text-slate-400">{{ isArabic ? template.taglineAr : template.tagline }}</p>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    <span v-for="feature in template.features" :key="feature" class="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">{{ feature }}</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </article>

                <article class="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                    <h2 class="text-lg font-semibold text-white">{{ content.contentTitle }}</h2>
                    <div class="mt-4 grid gap-3">
                        <input v-model="form.event_name" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" :placeholder="content.eventName">
                        <input v-model="form.host_name" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" :placeholder="content.hostName">
                        <div class="grid gap-3 md:grid-cols-2">
                            <input v-model="form.date" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" type="date">
                            <input v-model="form.time" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" type="time">
                        </div>
                        <input v-model="form.location" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" :placeholder="content.location">
                        <textarea v-model="form.description" rows="3" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" :placeholder="content.description" />
                        <div class="grid gap-3 md:grid-cols-2">
                            <input v-model="form.dress_code" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" :placeholder="content.dressCode">
                            <input v-model="form.rsvp_by" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" type="date">
                        </div>
                        <input v-model="form.guest_name" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" :placeholder="content.guestName">
                        <input v-model="form.special_note" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500" :placeholder="content.specialNote">
                    </div>
                </article>

                <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <article class="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                        <h2 class="text-lg font-semibold text-white">{{ content.paletteTitle }}</h2>
                        <div class="mt-4 grid gap-3 md:grid-cols-2">
                            <label class="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"><span>{{ content.primary }}</span><input v-model="colors.primary" type="color" class="h-12 w-full rounded-xl border border-slate-700 bg-slate-950"></label>
                            <label class="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"><span>{{ content.secondary }}</span><input v-model="colors.secondary" type="color" class="h-12 w-full rounded-xl border border-slate-700 bg-slate-950"></label>
                            <label class="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"><span>{{ content.accent }}</span><input v-model="colors.accent" type="color" class="h-12 w-full rounded-xl border border-slate-700 bg-slate-950"></label>
                            <label class="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"><span>{{ content.background }}</span><input v-model="colors.background" type="color" class="h-12 w-full rounded-xl border border-slate-700 bg-slate-950"></label>
                        </div>
                    </article>

                    <article class="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                        <h2 class="text-lg font-semibold text-white">{{ content.directionTitle }}</h2>
                        <p class="mt-2 text-sm text-slate-400">{{ isArabic ? activeTemplateConfig.taglineAr : activeTemplateConfig.tagline }}</p>
                        <div class="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                            <div class="flex flex-wrap gap-2">
                                <span v-for="feature in activeTemplateConfig.features" :key="feature" class="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200">{{ feature }}</span>
                            </div>
                            <p class="mt-4 text-xs leading-6 text-slate-400">{{ content.previewCaption }}</p>
                        </div>
                    </article>
                </div>
            </div>

            <article class="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                <div class="flex items-end justify-between gap-3">
                    <div>
                        <h2 class="text-lg font-semibold text-white">{{ content.previewTitle }}</h2>
                        <p class="mt-1 text-sm text-slate-400">{{ isArabic ? activeTemplateConfig.nameAr : activeTemplateConfig.name }}</p>
                    </div>
                    <span class="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{{ isArabic ? activeTemplateConfig.categoryAr : activeTemplateConfig.category }}</span>
                </div>

                <div class="mt-4 rounded-[2rem] border border-slate-800 p-4" :style="previewFrameStyle">
                    <div class="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border shadow-2xl" :style="{ borderColor: `${colors.secondary}66`, backgroundColor: activeTemplate === 'gala' ? colors.background : '#ffffff', fontFamily: activeTemplateConfig.fontFamily }">
                        <template v-if="activeTemplate === 'royal'">
                            <div class="relative overflow-hidden px-8 py-10 text-center" :style="{ color: colors.primary, background: `linear-gradient(180deg, ${colors.background} 0%, #ffffff 100%)` }">
                                <div class="absolute inset-x-8 top-6 h-px" :style="{ backgroundColor: `${colors.secondary}66` }" />
                                <div class="absolute inset-x-8 bottom-6 h-px" :style="{ backgroundColor: `${colors.secondary}66` }" />
                                <p class="text-[11px] uppercase tracking-[0.45em]" :style="{ color: colors.secondary }">{{ content.eyebrow }}</p>
                                <h3 class="mt-6 text-5xl font-semibold leading-none">{{ form.event_name }}</h3>
                                <p class="mx-auto mt-4 max-w-lg text-base leading-7" :style="{ color: `${colors.primary}CC` }">{{ form.description }}</p>
                                <div class="mx-auto mt-8 grid max-w-xl gap-4 md:grid-cols-3">
                                    <div v-for="card in detailCards.slice(0, 3)" :key="card.label" class="rounded-2xl border px-4 py-4" :style="{ borderColor: `${colors.secondary}55`, backgroundColor: `${colors.accent}22` }">
                                        <p class="text-[11px] uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ card.label }}</p>
                                        <p class="mt-2 text-sm font-semibold leading-6">{{ card.value }}</p>
                                    </div>
                                </div>
                                <div class="mx-auto mt-8 max-w-xl rounded-[1.75rem] border px-6 py-5" :style="{ borderColor: `${colors.primary}26` }">
                                    <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.hostedBy }}</p>
                                    <p class="mt-2 text-lg">{{ form.host_name }}</p>
                                    <p class="mt-3 text-sm text-slate-600">{{ content.rsvp }} {{ formatDate(form.rsvp_by) }}</p>
                                </div>
                            </div>
                        </template>

                        <template v-else-if="activeTemplate === 'garden'">
                            <div class="relative overflow-hidden px-8 py-10" :style="{ background: `linear-gradient(180deg, ${colors.background}, #ffffff)` }">
                                <div class="absolute left-0 top-0 h-40 w-40 rounded-br-[7rem]" :style="{ backgroundColor: `${colors.accent}55` }" />
                                <div class="absolute bottom-0 right-0 h-48 w-48 rounded-tl-[8rem]" :style="{ backgroundColor: `${colors.secondary}22` }" />
                                <div class="relative z-10 mx-auto max-w-xl text-center" :style="{ color: colors.primary }">
                                    <p class="text-[11px] uppercase tracking-[0.4em]" :style="{ color: colors.secondary }">{{ content.eyebrow }}</p>
                                    <h3 class="mt-5 text-4xl font-semibold">{{ form.event_name }}</h3>
                                    <p class="mt-3 text-base leading-7">{{ form.description }}</p>
                                    <div class="mt-8 grid gap-4 md:grid-cols-2" :class="textAlignClass">
                                        <div class="rounded-[1.5rem] border bg-white/80 p-5 backdrop-blur" :style="{ borderColor: `${colors.secondary}40` }">
                                            <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.date }}</p>
                                            <p class="mt-2 text-xl font-semibold">{{ formatDate(form.date) }}</p>
                                            <p class="mt-4 text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.time }}</p>
                                            <p class="mt-2 text-sm font-medium">{{ formatTime(form.time) }}</p>
                                        </div>
                                        <div class="rounded-[1.5rem] border bg-white/80 p-5 backdrop-blur" :style="{ borderColor: `${colors.primary}20` }">
                                            <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.location }}</p>
                                            <p class="mt-2 text-sm leading-7">{{ form.location }}</p>
                                            <p class="mt-4 text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.attire }}</p>
                                            <p class="mt-2 text-sm font-medium">{{ form.dress_code }}</p>
                                        </div>
                                    </div>
                                    <p class="mt-8 text-sm">{{ content.hostedBy }} {{ form.host_name }}</p>
                                </div>
                            </div>
                        </template>

                        <template v-else-if="activeTemplate === 'modern'">
                            <div class="relative overflow-hidden px-8 py-9" :style="{ background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.secondary} 58%, ${colors.accent} 130%)` }">
                                <div class="absolute -left-12 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                                <div class="absolute right-0 top-0 h-52 w-52 rounded-full bg-black/20 blur-2xl" />
                                <div class="relative z-10 rounded-[2rem] border border-white/15 bg-white/10 p-8 text-white backdrop-blur-md">
                                    <div class="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p class="text-[11px] uppercase tracking-[0.35em] text-white/70">{{ content.eyebrow }}</p>
                                            <h3 class="mt-4 max-w-md text-4xl font-black leading-tight">{{ form.event_name }}</h3>
                                        </div>
                                        <div class="rounded-2xl border border-white/20 bg-black/10 px-4 py-3 text-sm text-white/80">
                                            <p>{{ content.rsvp }}</p>
                                            <p class="mt-1 font-semibold text-white">{{ formatDate(form.rsvp_by) }}</p>
                                        </div>
                                    </div>
                                    <p class="mt-6 max-w-xl text-base leading-7 text-white/85">{{ form.description }}</p>
                                    <div class="mt-8 grid gap-4 md:grid-cols-3">
                                        <div class="rounded-2xl bg-black/15 p-4">
                                            <p class="text-[11px] uppercase tracking-[0.25em] text-white/60">{{ content.date }}</p>
                                            <p class="mt-2 text-lg font-semibold">{{ formatDate(form.date) }}</p>
                                        </div>
                                        <div class="rounded-2xl bg-black/15 p-4">
                                            <p class="text-[11px] uppercase tracking-[0.25em] text-white/60">{{ content.time }}</p>
                                            <p class="mt-2 text-lg font-semibold">{{ formatTime(form.time) }}</p>
                                        </div>
                                        <div class="rounded-2xl bg-black/15 p-4">
                                            <p class="text-[11px] uppercase tracking-[0.25em] text-white/60">{{ content.attire }}</p>
                                            <p class="mt-2 text-lg font-semibold">{{ form.dress_code }}</p>
                                        </div>
                                    </div>
                                    <div class="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-white/85">
                                        <span>{{ form.location }}</span>
                                        <span>{{ content.hostedBy }} {{ form.host_name }}</span>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-else-if="activeTemplate === 'minimal'">
                            <div class="px-8 py-10" :style="{ backgroundColor: colors.background, color: colors.primary }">
                                <div class="mx-auto max-w-xl border-t pt-6" :style="{ borderColor: `${colors.primary}25` }">
                                    <p class="text-[11px] uppercase tracking-[0.45em]" :style="{ color: colors.secondary }">{{ content.eyebrow }}</p>
                                    <h3 class="mt-8 text-4xl font-semibold tracking-tight">{{ form.event_name }}</h3>
                                    <p class="mt-5 max-w-lg text-base leading-8" :style="{ color: `${colors.primary}CC` }">{{ form.description }}</p>
                                    <div class="mt-10 grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
                                        <div>
                                            <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.date }}</p>
                                            <p class="mt-2 text-sm font-semibold">{{ formatDate(form.date) }}</p>
                                            <p class="mt-6 text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.time }}</p>
                                            <p class="mt-2 text-sm font-semibold">{{ formatTime(form.time) }}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.location }}</p>
                                            <p class="mt-2 text-sm leading-7">{{ form.location }}</p>
                                            <p class="mt-6 text-xs uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.specialAccess }}</p>
                                            <p class="mt-2 text-sm leading-7">{{ form.special_note || '---' }}</p>
                                        </div>
                                    </div>
                                    <div class="mt-10 flex flex-wrap items-end justify-between gap-4 border-t pt-5 text-sm" :style="{ borderColor: `${colors.primary}20` }">
                                        <span>{{ content.hostedBy }} {{ form.host_name }}</span>
                                        <span>{{ content.rsvp }} {{ formatDate(form.rsvp_by) }}</span>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-else-if="activeTemplate === 'gala'">
                            <div class="relative overflow-hidden px-8 py-10 text-white" :style="{ background: `linear-gradient(160deg, ${colors.background} 0%, #111827 50%, #000000 100%)` }">
                                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.22),transparent_35%)]" />
                                <div class="relative z-10 mx-auto max-w-xl rounded-[2rem] border p-8" :style="{ borderColor: `${colors.secondary}44`, backgroundColor: 'rgba(15,23,42,0.46)' }">
                                    <p class="text-center text-[11px] uppercase tracking-[0.45em]" :style="{ color: colors.secondary }">{{ content.eyebrow }}</p>
                                    <h3 class="mt-5 text-center text-5xl font-semibold">{{ form.event_name }}</h3>
                                    <p class="mx-auto mt-4 max-w-md text-center text-base leading-7 text-white/80">{{ form.description }}</p>
                                    <div class="mt-8 grid gap-3 md:grid-cols-3">
                                        <div v-for="card in detailCards.slice(0, 3)" :key="card.label" class="rounded-2xl border px-4 py-4 text-center" :style="{ borderColor: `${colors.secondary}33`, backgroundColor: 'rgba(255,255,255,0.04)' }">
                                            <p class="text-[11px] uppercase tracking-[0.25em] text-white/55">{{ card.label }}</p>
                                            <p class="mt-2 text-sm font-semibold text-white">{{ card.value }}</p>
                                        </div>
                                    </div>
                                    <div class="mt-8 rounded-2xl px-5 py-4 text-sm" :style="{ backgroundColor: `${colors.secondary}15` }">
                                        <div class="flex flex-wrap items-center justify-between gap-3">
                                            <span>{{ content.attire }}: {{ form.dress_code }}</span>
                                            <span>{{ content.guest }}: {{ form.guest_name || 'VIP Guest' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-else>
                            <div class="px-8 py-10" :style="{ background: `linear-gradient(180deg, ${colors.background}, #ffffff)` }">
                                <div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                                    <div>
                                        <div class="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]" :style="{ backgroundColor: `${colors.accent}66`, color: colors.primary }">{{ isArabic ? activeTemplateConfig.categoryAr : activeTemplateConfig.category }}</div>
                                        <h3 class="mt-5 text-4xl font-bold leading-tight" :style="{ color: colors.primary }">{{ form.event_name }}</h3>
                                        <p class="mt-4 max-w-xl text-base leading-7" :style="{ color: `${colors.primary}D9` }">{{ form.description }}</p>
                                        <div class="mt-8 rounded-[1.5rem] border p-5" :style="{ borderColor: `${colors.secondary}35`, backgroundColor: '#ffffff' }">
                                            <p class="text-xs font-semibold uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.agenda }}</p>
                                            <div class="mt-4 grid gap-4 md:grid-cols-3">
                                                <div>
                                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ content.date }}</p>
                                                    <p class="mt-2 text-sm font-semibold" :style="{ color: colors.primary }">{{ formatDate(form.date) }}</p>
                                                </div>
                                                <div>
                                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ content.time }}</p>
                                                    <p class="mt-2 text-sm font-semibold" :style="{ color: colors.primary }">{{ formatTime(form.time) }}</p>
                                                </div>
                                                <div>
                                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ content.attire }}</p>
                                                    <p class="mt-2 text-sm font-semibold" :style="{ color: colors.primary }">{{ form.dress_code }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="rounded-[1.75rem] border p-6" :style="{ borderColor: `${colors.primary}18`, backgroundColor: '#ffffff' }">
                                        <p class="text-xs font-semibold uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.location }}</p>
                                        <p class="mt-3 text-sm leading-7" :style="{ color: colors.primary }">{{ form.location }}</p>
                                        <p class="mt-6 text-xs font-semibold uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.hostedBy }}</p>
                                        <p class="mt-3 text-sm font-semibold" :style="{ color: colors.primary }">{{ form.host_name }}</p>
                                        <p class="mt-6 text-xs font-semibold uppercase tracking-[0.25em]" :style="{ color: colors.secondary }">{{ content.rsvp }}</p>
                                        <p class="mt-3 text-sm font-semibold" :style="{ color: colors.primary }">{{ formatDate(form.rsvp_by) }}</p>
                                        <div class="mt-8 rounded-2xl px-4 py-3 text-sm" :style="{ backgroundColor: `${colors.accent}4D`, color: colors.primary }">{{ form.special_note || 'Bring your team for an evening of networking and curated hospitality.' }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <div class="mx-auto mt-4 max-w-2xl rounded-[1.5rem] border border-slate-800 bg-slate-950 px-5 py-4 text-sm text-slate-200">
                        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{{ content.organizerContact }}</p>
                        <p class="mt-2 font-semibold text-white">{{ organizer?.name || form.host_name }}</p>
                        <p class="mt-1 text-slate-300">{{ organizer?.phone || content.organizerMissing }}</p>
                    </div>
                </div>
            </article>
        </div>
    </section>
</template>