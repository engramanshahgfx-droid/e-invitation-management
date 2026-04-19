<script setup>
const packs = [
    { id: 1, name: 'Classic Gold Pack', price: '$49', features: '100 invitations, RSVP tracking, QR check-in' },
    { id: 2, name: 'Premium Wedding Pack', price: '$89', features: '500 invitations, premium templates, analytics' },
    { id: 3, name: 'Enterprise Event Pack', price: '$199', features: 'Unlimited invitations, team dashboard, priority support' },
];
</script>

<template>
    <section class="grid gap-6">
        <article class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 class="text-lg font-semibold text-white">Marketplace</h2>
            <p class="mt-2 text-sm text-slate-400">Choose an invitation package. Checkout APIs will be connected in the next payment wave.</p>
        </article>

        <article class="grid gap-4 md:grid-cols-3">
            <div v-for="pack in packs" :key="pack.id" class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h3 class="text-base font-semibold text-white">{{ pack.name }}</h3>
                <p class="mt-1 text-2xl font-bold text-amber-300">{{ pack.price }}</p>
                <p class="mt-3 text-sm text-slate-400">{{ pack.features }}</p>
                <button class="mt-4 w-full rounded-md bg-amber-400 px-3 py-2 font-semibold text-slate-950">Add to Cart</button>
            </div>
        </article>
    </section>
</template>
