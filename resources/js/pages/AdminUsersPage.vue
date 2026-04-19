<script setup>
import { onMounted, reactive, ref } from 'vue';
import api from '../lib/api';
import { getStoredUser } from '../lib/auth';

const currentUser = getStoredUser();
const loading = ref(false);
const error = ref('');
const users = ref([]);
const pagination = ref(null);
const pendingLoading = ref(false);
const pendingError = ref('');
const pendingSubscriptions = ref([]);
const deliveryLoading = ref(false);
const deliveryError = ref('');
const deliveryLog = ref([]);

const filters = reactive({ search: '', account_type: '', page: 1 });

const reviewModal = reactive({
    open: false,
    userId: null,
    userName: '',
    action: 'approve',
    note: '',
    saving: false,
    error: '',
});

const upgradeModal = reactive({
    open: false,
    userId: null,
    name: '',
    account_type: 'free',
    subscription_status: 'trial',
    saving: false,
    error: '',
});

const openUpgrade = (user) => {
    upgradeModal.open = true;
    upgradeModal.userId = user.id;
    upgradeModal.name = user.name;
    upgradeModal.account_type = user.account_type;
    upgradeModal.subscription_status = user.subscription_status || 'trial';
    upgradeModal.error = '';
};

const saveUpgrade = async () => {
    upgradeModal.saving = true;
    upgradeModal.error = '';
    try {
        await api.patch(`/admin/users/${upgradeModal.userId}/upgrade`, {
            account_type: upgradeModal.account_type,
            subscription_status: upgradeModal.subscription_status,
        });
        upgradeModal.open = false;
        await load();
    } catch (err) {
        upgradeModal.error = err?.response?.data?.message ?? 'Failed to update user.';
    } finally {
        upgradeModal.saving = false;
    }
};

const deleteUser = async (user) => {
    if (!confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    try {
        await api.delete(`/admin/users/${user.id}`);
        await load();
        await loadPending();
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to delete user.';
    }
};

const loadPending = async () => {
    pendingLoading.value = true;
    pendingError.value = '';

    try {
        const { data } = await api.get('/admin/subscriptions/pending');
        pendingSubscriptions.value = data.data.data || [];
    } catch (err) {
        pendingError.value = err?.response?.data?.message ?? 'Failed to load pending receipts.';
    } finally {
        pendingLoading.value = false;
    }
};

const loadDeliveryLog = async () => {
    deliveryLoading.value = true;
    deliveryError.value = '';

    try {
        const { data } = await api.get('/admin/invitations/delivery-log');
        deliveryLog.value = data.data || [];
    } catch (err) {
        deliveryError.value = err?.response?.data?.message ?? 'Failed to load invitation delivery history.';
    } finally {
        deliveryLoading.value = false;
    }
};

const viewReceipt = async (user) => {
    try {
        const response = await api.get(`/admin/subscriptions/${user.id}/receipt`, {
            responseType: 'blob',
        });

        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const receiptBlob = new Blob([response.data], { type: contentType });
        const receiptUrl = URL.createObjectURL(receiptBlob);
        const receiptWindow = window.open(receiptUrl, '_blank', 'noopener,noreferrer');

        if (receiptWindow) {
            receiptWindow.addEventListener('beforeunload', () => URL.revokeObjectURL(receiptUrl), { once: true });
            return;
        }

        URL.revokeObjectURL(receiptUrl);
        alert('Pop-up blocked. Please allow pop-ups and try again.');
    } catch (err) {
        alert(err?.response?.data?.message ?? 'Failed to open receipt.');
    }
};

const openReviewModal = (user, action) => {
    reviewModal.open = true;
    reviewModal.userId = user.id;
    reviewModal.userName = user.name;
    reviewModal.action = action;
    reviewModal.note = '';
    reviewModal.error = '';
};

const submitReview = async () => {
    reviewModal.saving = true;
    reviewModal.error = '';

    try {
        if (reviewModal.action === 'approve') {
            await api.patch(`/admin/subscriptions/${reviewModal.userId}/approve`, {
                review_note: reviewModal.note || null,
            });
        } else {
            await api.patch(`/admin/subscriptions/${reviewModal.userId}/reject`, {
                review_note: reviewModal.note,
            });
        }

        reviewModal.open = false;
        await load();
        await loadPending();
    } catch (err) {
        reviewModal.error = err?.response?.data?.message ?? 'Failed to submit payment review.';
    } finally {
        reviewModal.saving = false;
    }
};

const load = async (page = filters.page) => {
    loading.value = true;
    error.value = '';
    filters.page = page;

    try {
        const params = {
            page: filters.page,
            ...(filters.search ? { search: filters.search } : {}),
            ...(filters.account_type ? { account_type: filters.account_type } : {}),
        };
        const { data } = await api.get('/admin/users', { params });
        users.value = data.data.data;
        pagination.value = data.data;
    } catch (err) {
        error.value = err?.response?.data?.message ?? 'Failed to load users.';
    } finally {
        loading.value = false;
    }
};

onMounted(() => load());
onMounted(() => loadPending());
onMounted(() => loadDeliveryLog());
</script>

<template>
    <section class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-white">Users</h1>
                <p class="mt-1 text-sm text-slate-400">Manage all registered accounts, plans, and access levels.</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
            <input
                v-model="filters.search"
                type="search"
                placeholder="Search by name or email…"
                class="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                @input="load(1)"
            >
            <select
                v-model="filters.account_type"
                class="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                @change="load(1)"
            >
                <option value="">All plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
            </select>
        </div>

        <p v-if="loading" class="text-sm text-slate-400">Loading users…</p>
        <p v-if="error" class="rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{{ error }}</p>

        <!-- Pending receipts -->
        <div class="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
            <div class="border-b border-slate-800 px-6 py-4">
                <h2 class="text-lg font-semibold text-white">Pending Direct Bank Transfer Receipts</h2>
                <p class="mt-1 text-xs text-slate-400">Review uploaded receipts and approve/reject subscribers.</p>
            </div>

            <p v-if="pendingLoading" class="px-6 py-4 text-sm text-slate-400">Loading pending receipts…</p>
            <p v-if="pendingError" class="mx-6 my-4 rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{{ pendingError }}</p>

            <table v-if="!pendingLoading" class="w-full text-sm">
                <thead>
                    <tr class="border-b border-slate-800 text-left text-xs uppercase tracking-widest text-slate-500">
                        <th class="px-6 py-4">User</th>
                        <th class="px-6 py-4">Reference</th>
                        <th class="px-6 py-4">Submitted</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!pendingSubscriptions.length">
                        <td class="px-6 py-8 text-center text-slate-500" colspan="4">No pending payment receipts.</td>
                    </tr>
                    <tr v-for="u in pendingSubscriptions" :key="`pending-${u.id}`" class="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td class="px-6 py-4">
                            <div class="font-medium text-white">{{ u.name }}</div>
                            <div class="text-xs text-slate-400">{{ u.email }}</div>
                        </td>
                        <td class="px-6 py-4 text-slate-300">{{ u.payment_reference || '—' }}</td>
                        <td class="px-6 py-4 text-slate-400">{{ u.payment_submitted_at ? new Date(u.payment_submitted_at).toLocaleString() : '—' }}</td>
                        <td class="px-6 py-4 text-right">
                            <div class="inline-flex gap-2">
                                <button
                                    class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                                    type="button"
                                    @click="viewReceipt(u)"
                                >View Receipt</button>
                                <button
                                    class="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-900/40"
                                    type="button"
                                    @click="openReviewModal(u, 'approve')"
                                >Approve</button>
                                <button
                                    class="rounded-lg border border-rose-900/50 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-900/40"
                                    type="button"
                                    @click="openReviewModal(u, 'reject')"
                                >Reject</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
            <div class="border-b border-slate-800 px-6 py-4">
                <h2 class="text-lg font-semibold text-white">Invitation Delivery History</h2>
                <p class="mt-1 text-xs text-slate-400">Recent sent, failed, and skipped WhatsApp invitation attempts.</p>
            </div>

            <p v-if="deliveryLoading" class="px-6 py-4 text-sm text-slate-400">Loading delivery history…</p>
            <p v-if="deliveryError" class="mx-6 my-4 rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{{ deliveryError }}</p>

            <table v-if="!deliveryLoading" class="w-full text-sm">
                <thead>
                    <tr class="border-b border-slate-800 text-left text-xs uppercase tracking-widest text-slate-500">
                        <th class="px-6 py-4">Subscriber</th>
                        <th class="px-6 py-4">Event / Guest</th>
                        <th class="px-6 py-4">Phone</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4">Attempt</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!deliveryLog.length">
                        <td class="px-6 py-8 text-center text-slate-500" colspan="5">No invitation delivery attempts yet.</td>
                    </tr>
                    <tr v-for="entry in deliveryLog" :key="`delivery-${entry.id}`" class="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td class="px-6 py-4">
                            <div class="font-medium text-white">{{ entry.event?.user?.name || 'Unknown user' }}</div>
                            <div class="text-xs text-slate-400">{{ entry.event?.user?.email || 'No email' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-medium text-white">{{ entry.event?.title || 'Unknown event' }}</div>
                            <div class="text-xs text-slate-400">{{ entry.guest_name }}</div>
                        </td>
                        <td class="px-6 py-4 text-slate-300">{{ entry.delivery_phone || entry.guest_phone || '—' }}</td>
                        <td class="px-6 py-4">
                            <span class="rounded-full px-2 py-1 text-xs font-semibold" :class="{
                                'bg-emerald-900/50 text-emerald-300': entry.delivery_status === 'sent',
                                'bg-rose-900/50 text-rose-300': entry.delivery_status === 'failed',
                                'bg-amber-900/50 text-amber-300': entry.delivery_status === 'skipped',
                                'bg-slate-800 text-slate-300': !entry.delivery_status || entry.delivery_status === 'not_sent',
                            }">{{ entry.delivery_status || 'not_sent' }}</span>
                            <div v-if="entry.delivery_error" class="mt-1 text-xs text-rose-300">{{ entry.delivery_error }}</div>
                        </td>
                        <td class="px-6 py-4 text-slate-400">{{ entry.delivery_last_attempt_at ? new Date(entry.delivery_last_attempt_at).toLocaleString() : '—' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Table -->
        <div v-if="!loading" class="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-slate-800 text-left text-xs uppercase tracking-widest text-slate-500">
                        <th class="px-6 py-4">User</th>
                        <th class="px-6 py-4">Plan</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4">Joined</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!users.length">
                        <td class="px-6 py-12 text-center text-slate-500" colspan="5">No users found.</td>
                    </tr>
                    <tr v-for="u in users" :key="u.id" class="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td class="px-6 py-4">
                            <div class="font-medium text-white">{{ u.name }}</div>
                            <div class="text-xs text-slate-400">{{ u.email }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <span
                                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                                :class="{
                                    'bg-purple-900/50 text-purple-300': u.account_type === 'superadmin',
                                    'bg-amber-900/50 text-amber-300': u.account_type === 'admin',
                                    'bg-blue-900/50 text-blue-300': u.account_type === 'pro',
                                    'bg-slate-800 text-slate-300': u.account_type === 'free',
                                }"
                            >{{ u.account_type }}</span>
                        </td>
                        <td class="px-6 py-4">
                            <span
                                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                                :class="{
                                    'bg-emerald-900/50 text-emerald-300': u.subscription_status === 'active',
                                    'bg-yellow-900/50 text-yellow-300': u.subscription_status === 'trial',
                                    'bg-blue-900/50 text-blue-300': u.subscription_status === 'pending_review',
                                    'bg-rose-900/50 text-rose-300': ['expired','cancelled','rejected'].includes(u.subscription_status),
                                }"
                            >{{ u.subscription_status ?? '—' }}</span>
                        </td>
                        <td class="px-6 py-4 text-slate-400">{{ new Date(u.created_at).toLocaleDateString() }}</td>
                        <td class="px-6 py-4 text-right">
                            <div class="inline-flex gap-2">
                                <button
                                    class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                                    type="button"
                                    @click="openUpgrade(u)"
                                >Edit Plan</button>
                                <button
                                    v-if="u.id !== currentUser?.id"
                                    class="rounded-lg border border-rose-900/50 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-900/40"
                                    type="button"
                                    @click="deleteUser(u)"
                                >Delete</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.last_page > 1" class="flex items-center justify-between">
            <p class="text-sm text-slate-400">
                Page {{ pagination.current_page }} of {{ pagination.last_page }} — {{ pagination.total }} users
            </p>
            <div class="flex gap-2">
                <button
                    :disabled="pagination.current_page <= 1"
                    class="rounded-xl border border-slate-700 px-4 py-2 text-sm text-white disabled:opacity-40 hover:bg-slate-800"
                    type="button"
                    @click="load(pagination.current_page - 1)"
                >← Prev</button>
                <button
                    :disabled="pagination.current_page >= pagination.last_page"
                    class="rounded-xl border border-slate-700 px-4 py-2 text-sm text-white disabled:opacity-40 hover:bg-slate-800"
                    type="button"
                    @click="load(pagination.current_page + 1)"
                >Next →</button>
            </div>
        </div>
    </section>

    <!-- Upgrade modal -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="upgradeModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="upgradeModal.open = false">
                <div class="w-full max-w-md rounded-3xl border border-purple-900/40 bg-slate-900 p-8 shadow-2xl">
                    <h2 class="text-xl font-bold text-white">Edit Plan</h2>
                    <p class="mt-1 text-sm text-slate-400">{{ upgradeModal.name }}</p>

                    <div class="mt-6 grid gap-4">
                        <label class="grid gap-2">
                            <span class="text-sm text-slate-300">Account Type</span>
                            <select v-model="upgradeModal.account_type" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </label>

                        <label class="grid gap-2">
                            <span class="text-sm text-slate-300">Subscription Status</span>
                            <select v-model="upgradeModal.subscription_status" class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
                                <option value="trial">Trial</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="active">Active</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </label>

                        <p v-if="upgradeModal.error" class="rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{{ upgradeModal.error }}</p>

                        <div class="flex gap-3">
                            <button type="button" class="flex-1 rounded-xl border border-slate-700 py-3 text-sm text-slate-300 hover:bg-slate-800" @click="upgradeModal.open = false">Cancel</button>
                            <button type="button" :disabled="upgradeModal.saving" class="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60" @click="saveUpgrade">
                                {{ upgradeModal.saving ? 'Saving…' : 'Save Changes' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Payment review modal -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="reviewModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="reviewModal.open = false">
                <div class="w-full max-w-md rounded-3xl border border-purple-900/40 bg-slate-900 p-8 shadow-2xl">
                    <h2 class="text-xl font-bold text-white">
                        {{ reviewModal.action === 'approve' ? 'Approve Payment' : 'Reject Payment' }}
                    </h2>
                    <p class="mt-1 text-sm text-slate-400">{{ reviewModal.userName }}</p>

                    <div class="mt-6 grid gap-4">
                        <label class="grid gap-2">
                            <span class="text-sm text-slate-300">Review Note {{ reviewModal.action === 'reject' ? '(required)' : '(optional)' }}</span>
                            <textarea
                                v-model="reviewModal.note"
                                rows="4"
                                class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                                :placeholder="reviewModal.action === 'approve' ? 'Payment verified successfully.' : 'Reason for rejection.'"
                            />
                        </label>

                        <p v-if="reviewModal.error" class="rounded-xl border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{{ reviewModal.error }}</p>

                        <div class="flex gap-3">
                            <button type="button" class="flex-1 rounded-xl border border-slate-700 py-3 text-sm text-slate-300 hover:bg-slate-800" @click="reviewModal.open = false">Cancel</button>
                            <button
                                type="button"
                                :disabled="reviewModal.saving || (reviewModal.action === 'reject' && !reviewModal.note.trim())"
                                class="flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
                                :class="reviewModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'"
                                @click="submitReview"
                            >
                                {{ reviewModal.saving ? 'Saving…' : (reviewModal.action === 'approve' ? 'Approve' : 'Reject') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
