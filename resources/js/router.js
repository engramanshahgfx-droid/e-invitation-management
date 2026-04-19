import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from './pages/DashboardPage.vue';
import EventsPage from './pages/EventsPage.vue';
import HomePage from './pages/HomePage.vue';
import LoginPage from './pages/LoginPage.vue';
import RegisterPage from './pages/RegisterPage.vue';
import RegisterVerifyPage from './pages/RegisterVerifyPage.vue';
import ForgotPasswordPage from './pages/ForgotPasswordPage.vue';
import GuestListPage from './pages/GuestListPage.vue';
import CheckInPage from './pages/CheckInPage.vue';
import InvitationsPage from './pages/InvitationsPage.vue';
import ReportsPage from './pages/ReportsPage.vue';
import MarketplacePage from './pages/MarketplacePage.vue';
import PublicInvitationPage from './pages/PublicInvitationPage.vue';
import EventWorkspacePage from './pages/EventWorkspacePage.vue';
import TemplateStudioPage from './pages/TemplateStudioPage.vue';
import AdminLoginPage from './pages/AdminLoginPage.vue';
import AdminDashboardPage from './pages/AdminDashboardPage.vue';
import AdminUsersPage from './pages/AdminUsersPage.vue';
import AdminPlansPage from './pages/AdminPlansPage.vue';
import PricingPage from './pages/PricingPage.vue';

const supportedLocales = ['en', 'ar'];

const withLocale = (path) => `/:locale(${supportedLocales.join('|')})${path}`;

const routes = [
    {
        path: '/',
        redirect: '/en',
    },
    {
        path: withLocale(''),
        name: 'home',
        component: HomePage,
        meta: { layout: 'marketing' },
    },
    {
        path: withLocale('/auth/login'),
        name: 'login',
        component: LoginPage,
        meta: { layout: 'blank' },
    },
    {
        path: withLocale('/auth/register'),
        name: 'register',
        component: RegisterPage,
        meta: { layout: 'blank' },
    },
    {
        path: withLocale('/auth/register/verify'),
        name: 'register-verify',
        component: RegisterVerifyPage,
        meta: { layout: 'blank' },
    },
    {
        path: withLocale('/auth/forgot-password'),
        name: 'forgot-password',
        component: ForgotPasswordPage,
        meta: { layout: 'blank' },
    },
    {
        path: withLocale('/pricing'),
        name: 'pricing',
        component: PricingPage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/event-management-dashboard'),
        name: 'dashboard',
        component: DashboardPage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/events'),
        name: 'events',
        component: EventsPage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/events/:id/workspace'),
        name: 'event-workspace',
        component: EventWorkspacePage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/guest-list-management'),
        name: 'guest-list',
        component: GuestListPage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/qr-check-in-system'),
        name: 'check-in',
        component: CheckInPage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/invitations'),
        name: 'invitations',
        component: InvitationsPage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/invitations/template-studio'),
        name: 'template-studio',
        component: TemplateStudioPage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/reports'),
        name: 'reports',
        component: ReportsPage,
        meta: { requiresAuth: true },
    },
    {
        path: withLocale('/marketplace'),
        name: 'marketplace',
        component: MarketplacePage,
        meta: { requiresAuth: true },
    },
    {
        path: '/invitation/:code',
        name: 'public-invitation',
        component: PublicInvitationPage,
        meta: { layout: 'blank' },
    },
    // Admin routes — no locale prefix
    {
        path: '/admin/login',
        name: 'admin-login',
        component: AdminLoginPage,
        meta: { layout: 'blank' },
    },
    {
        path: '/admin',
        name: 'admin-dashboard',
        component: AdminDashboardPage,
        meta: { layout: 'admin', requiresAdmin: true },
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: AdminUsersPage,
        meta: { layout: 'admin', requiresAdmin: true },
    },
    {
        path: '/admin/plans',
        name: 'admin-plans',
        component: AdminPlansPage,
        meta: { layout: 'admin', requiresAdmin: true },
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/en',
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const locale = supportedLocales.includes(to.params.locale) ? to.params.locale : 'en';
    const token = localStorage.getItem('auth_token');

    // Admin guard
    if (to.meta.requiresAdmin) {
        if (!token) return { name: 'admin-login' };
        try {
            const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
            if (!['admin', 'superadmin'].includes(user.account_type)) {
                return { name: 'admin-login' };
            }
        } catch {
            return { name: 'admin-login' };
        }
    }

    // Normal auth guard
    if (to.meta.requiresAuth && !token) {
        return { name: 'login', params: { locale } };
    }

    if ((to.name === 'login' || to.name === 'register' || to.name === 'register-verify' || to.name === 'forgot-password') && token) {
        return { name: 'dashboard', params: { locale } };
    }

    return true;
});

export default router;
