<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const locale = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'));
const nextLocale = computed(() => (locale.value === 'en' ? 'ar' : 'en'));
const label = computed(() => (nextLocale.value === 'en' ? 'EN' : 'ع'));

const toggleLocale = () => {
    router.push({
        name: route.name,
        params: {
            ...route.params,
            locale: nextLocale.value,
        },
        query: route.query,
    });
};
</script>

<template>
    <button
        class="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 sm:text-sm"
        type="button"
        @click="toggleLocale"
    >
        {{ label }}
    </button>
</template>