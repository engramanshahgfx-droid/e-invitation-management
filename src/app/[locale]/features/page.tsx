import Link from 'next/link'

export default async function FeaturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900">Powerful Features</h1>
        <p className="mt-4 text-xl text-gray-600">Everything you need to manage invitations effortlessly</p>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: '🎉',
              title: 'Event Management',
              description: 'Create and manage unlimited events with all details in one place.',
            },
            {
              icon: '👥',
              title: 'Guest Lists',
              description: 'Add guests, track RSVPs, and manage attendance effortlessly.',
            },
            {
              icon: '📱',
              title: 'WhatsApp Invitations',
              description: 'Send beautiful invitations via WhatsApp directly to guests.',
            },
            {
              icon: '🎟️',
              title: 'QR Code Check-in',
              description: 'Fast check-in using QR codes. Real-time attendance tracking.',
            },
            {
              icon: '📊',
              title: 'Analytics & Reports',
              description: 'View detailed attendance reports and guest statistics.',
            },
            {
              icon: '🎨',
              title: 'Custom Templates',
              description: 'Design beautiful invitation templates with your branding.',
            },
            {
              icon: '🌍',
              title: 'Multi-language',
              description: 'Support for English and Arabic invitations.',
            },
            {
              icon: '📧',
              title: 'Email Notifications',
              description: 'Automated email reminders and confirmations.',
            },
            {
              icon: '🔒',
              title: 'Secure',
              description: 'Enterprise-grade security for your data.',
            },
          ].map((feature, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-lg text-blue-100">Create your first invitation today!</p>
          <Link
            href={`/${locale}/auth/register`}
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-bold text-blue-600 hover:bg-blue-50"
          >
            Sign Up Free
          </Link>
        </div>
      </div>
    </div>
  )
}
