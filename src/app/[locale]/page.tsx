'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getCurrentUser } from '@/lib/auth';

const features = [
  {
    icon: '📩',
    title: 'Digital Invitations',
    description: 'Create beautiful digital invitations and send them via WhatsApp instantly.',
  },
  {
    icon: '📋',
    title: 'Guest Management',
    description: 'Upload guest lists, track RSVPs, and manage responses in real-time.',
  },
  {
    icon: '📱',
    title: 'QR Check-in',
    description: 'Generate unique QR codes for each guest and track attendance live.',
  },
  {
    icon: '📊',
    title: 'Analytics & Reports',
    description: 'Get detailed reports on invitations sent, RSVPs, and attendance rates.',
  },
  {
    icon: '🌐',
    title: 'Bilingual Support',
    description: 'Full Arabic and English support for invitations and dashboard.',
  },
  {
    icon: '🔒',
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with Supabase and Stripe payment processing.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Create Your Event',
    description: 'Set up your event details — name, date, venue, and invitation template.',
  },
  {
    number: '2',
    title: 'Add Your Guests',
    description: 'Upload your guest list via CSV/Excel or add them manually.',
  },
  {
    number: '3',
    title: 'Send & Track',
    description: 'Send WhatsApp invitations and track RSVPs and attendance in real-time.',
  },
];

const plans = [
  {
    name: 'Basic',
    price: '$29.99',
    period: '/month',
    color: 'bg-green-500',
    features: ['1 Event', '200 Guests', '1,000 WhatsApp Messages', 'QR Codes', 'Basic Reports'],
  },
  {
    name: 'Pro',
    price: '$99.99',
    period: '/month',
    color: 'bg-blue-600',
    popular: true,
    features: ['5 Events', '1,000 Guests', '5,000 WhatsApp Messages', 'Advanced Reports', 'Excel Export'],
  },
  {
    name: 'Enterprise',
    price: '$299.99',
    period: '/month',
    color: 'bg-purple-600',
    features: ['Unlimited Events', 'Unlimited Guests', 'Unlimited Messages', 'Priority Support', 'Custom Branding'],
  },
];

export default function HomePage() {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.replace(`/${locale}/event-management-dashboard`);
        }
      } catch {
        // ignore unauthenticated state
      }
    };

    redirectIfAuthenticated();
  }, [locale, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">InviteFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How it Works</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/auth/login`}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Create Invitation
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            ✨ Start Free — No Credit Card Required
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Create Digital Invitations{' '}
            <span className="text-blue-600">Easily</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Manage events, send WhatsApp invitations, track RSVPs, and handle QR check-ins —
            all from one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/auth/register`}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Create Invitation →
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              See How it Works
            </a>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-400">inviteflow.app/dashboard</span>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-blue-600">248</div>
                    <div className="text-sm text-gray-500">Guests Invited</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-green-600">186</div>
                    <div className="text-sm text-gray-500">Confirmed</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-purple-600">142</div>
                    <div className="text-sm text-gray-500">Checked In</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="h-32 flex items-end justify-around gap-2">
                    {[40, 65, 85, 70, 90, 75, 95].map((h, i) => (
                      <div
                        key={i}
                        className="bg-blue-500 rounded-t-md w-full"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-2 text-center">Weekly Invitation Activity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600">Powerful tools to manage your events from start to finish</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you&apos;re ready</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl overflow-hidden border-2 ${
                  plan.popular ? 'border-blue-600 shadow-xl relative' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-center text-xs font-bold py-1.5">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="ml-1 text-gray-500">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/${locale}/auth/register`}
                    className={`mt-6 block text-center py-2.5 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Simplify Your Event Management?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of event organizers who use InviteFlow to create stunning digital invitations.
          </p>
          <Link
            href={`/${locale}/auth/register`}
            className="inline-block px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your Invitation →
          </Link>
          <p className="mt-4 text-sm text-gray-500">No credit card required · Free plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IF</span>
            </div>
            <span className="text-lg font-bold text-white">InviteFlow</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} InviteFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
