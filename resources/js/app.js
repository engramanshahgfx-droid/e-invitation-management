import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import AppShell from './components/AppShell.vue';

if ('serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		const registrations = await navigator.serviceWorker.getRegistrations();
		await Promise.all(registrations.map((registration) => registration.unregister()));
	});
}

const app = createApp(AppShell);

app.use(createPinia());
app.use(router);
app.mount('#app');
