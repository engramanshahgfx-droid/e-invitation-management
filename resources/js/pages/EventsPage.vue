<script setup>
import { onMounted, ref } from 'vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../lib/api';

const route = useRoute();
const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const events = ref([]);
const loading = ref(false);
const error = ref('');

const form = ref({
    title: '',
    event_date: '',
    event_time: '',
    location: '',
    description: '',
    guest_count: 0,
});

const parseDateInput = (input) => {
    const value = String(input || '').trim();
    if (!value) {
        return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const ymdMatch = value.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
    if (ymdMatch) {
        const year = Number(ymdMatch[1]);
        const month = Number(ymdMatch[2]);
        const day = Number(ymdMatch[3]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
        return '';
    }

    const dmyOrMdyMatch = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (!dmyOrMdyMatch) {
        return '';
    }

    const first = Number(dmyOrMdyMatch[1]);
    const second = Number(dmyOrMdyMatch[2]);
    const year = Number(dmyOrMdyMatch[3]);

    let day = first;
    let month = second;

    // If first part cannot be a month, treat input as DD-MM-YYYY / DD/MM/YYYY.
    if (first > 12) {
        day = first;
        month = second;
    } else {
        // Default ambiguous forms (e.g. 02/23/2026) to MM/DD/YYYY for backward compatibility.
        month = first;
        day = second;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return '';
    }

    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

const parseTimeInput = (input) => {
    const value = String(input || '').trim().replace('--', '').trim().toLowerCase();
    if (!value) {
        return '';
    }

    const directMatch = value.match(/^(\d{1,2}):(\d{2})$/);
    if (directMatch) {
        const hour = Number(directMatch[1]);
        const minute = Number(directMatch[2]);
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
        return '';
    }

    const amPmMatch = value.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
    if (!amPmMatch) {
        return '';
    }

    let hour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2]);
    const period = amPmMatch[3];

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
        return '';
    }

    if (period === 'pm' && hour !== 12) {
        hour += 12;
    }
    if (period === 'am' && hour === 12) {
        hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const fetchEvents = async () => {
    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.get('/events');
        events.value = data.data?.data ?? [];
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load events. Login first and save auth token to localStorage.';
    } finally {
        loading.value = false;
    }
};

const createEvent = async () => {
    error.value = '';

    const normalizedDate = parseDateInput(form.value.event_date);
    const normalizedTime = parseTimeInput(form.value.event_time);

    if (!normalizedDate) {
        error.value = 'Please enter a valid date (YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY).';
        return;
    }

    if (!normalizedTime) {
        error.value = 'Please enter a valid time (HH:MM or HH:MM AM/PM).';
        return;
    }

    try {
        await api.post('/events', {
            ...form.value,
            event_date: normalizedDate,
            event_time: normalizedTime,
        });
        form.value = {
            title: '',
            event_date: '',
            event_time: '',
            location: '',
            description: '',
            guest_count: 0,
        };
        await fetchEvents();
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to create event.';
    }
};

onMounted(fetchEvents);
</script>

<template>
    <section class="grid gap-6 md:grid-cols-2">
        <article class="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 class="text-lg font-semibold text-white">{{ locale === 'ar' ? 'إنشاء فعالية' : 'Create Event' }}</h2>
            <p class="mt-1 text-sm text-slate-400">{{ locale === 'ar' ? 'هذه الصفحة هي بداية استعادة واجهة الإدارة القديمة داخل Vue.' : 'This page is the start of restoring the old management UI inside Vue.' }}</p>

            <form class="mt-4 grid gap-3" novalidate @submit.prevent="createEvent">
                <input v-model="form.title" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" placeholder="Title" required>
                <input v-model="form.event_date" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" type="text" placeholder="Date (YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY)" required>
                <input v-model="form.event_time" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" type="text" placeholder="Time (HH:MM or HH:MM AM/PM)" required>
                <input v-model="form.location" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" placeholder="Location" required>
                <textarea v-model="form.description" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" rows="3" placeholder="Description"></textarea>
                <input v-model.number="form.guest_count" class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" type="number" min="0" placeholder="Guest count">
                <button class="rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300" type="submit">Save Event</button>
            </form>
        </article>

        <article class="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div class="mb-3 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-white">{{ locale === 'ar' ? 'الفعاليات' : 'Events' }}</h2>
                <button class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800" @click="fetchEvents">{{ locale === 'ar' ? 'تحديث' : 'Refresh' }}</button>
            </div>

            <p v-if="loading" class="text-sm text-slate-400">{{ locale === 'ar' ? 'جاري تحميل الفعاليات...' : 'Loading events...' }}</p>
            <p v-if="error" class="mb-3 rounded-md border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{{ error }}</p>

            <ul class="grid gap-3">
                <li v-for="event in events" :key="event.id" class="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 class="font-semibold text-white">{{ event.title }}</h3>
                            <p class="mt-1 text-xs text-slate-400">{{ event.event_date }} at {{ event.event_time }} | {{ event.location }}</p>
                        </div>
                        <div class="flex gap-2">
                            <RouterLink
                                :to="{ name: 'event-workspace', params: { locale, id: event.id } }"
                                class="rounded-md border border-blue-700 px-3 py-1 text-xs text-blue-300 hover:bg-blue-950/40"
                            >
                                Workspace
                            </RouterLink>
                            <RouterLink
                                :to="{ name: 'invitations', params: { locale }, query: { event_id: String(event.id) } }"
                                class="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                            >
                                Invitations
                            </RouterLink>
                        </div>
                    </div>
                </li>
                <li v-if="!loading && events.length === 0" class="text-sm text-slate-500">{{ locale === 'ar' ? 'لا توجد فعاليات بعد.' : 'No events yet.' }}</li>
            </ul>
        </article>
    </section>
</template>
