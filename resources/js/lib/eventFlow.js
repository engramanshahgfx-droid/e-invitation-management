import { computed, watch } from 'vue';

const STORAGE_KEY = 'selected_event_id';

export const getStoredEventId = () => localStorage.getItem(STORAGE_KEY) || '';

export const persistEventId = (eventId) => {
    if (!eventId) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }

    localStorage.setItem(STORAGE_KEY, String(eventId));
};

export const useEventQuerySync = ({ route, router, selectedEventId }) => {
    const queryEventId = computed(() => String(route.query.event_id || ''));

    if (!selectedEventId.value) {
        selectedEventId.value = queryEventId.value || getStoredEventId();
    }

    watch(
        () => queryEventId.value,
        (value) => {
            if (value && value !== selectedEventId.value) {
                selectedEventId.value = value;
            }
        }
    );

    watch(
        () => selectedEventId.value,
        async (value) => {
            persistEventId(value);

            const nextQuery = {
                ...route.query,
            };

            if (value) {
                nextQuery.event_id = String(value);
            } else {
                delete nextQuery.event_id;
            }

            if (value === queryEventId.value) {
                return;
            }

            await router.replace({
                query: nextQuery,
            });
        }
    );
};
