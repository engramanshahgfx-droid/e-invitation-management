'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { formatDate } from '@/lib/dateUtils';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyAdmin();
  }, []);

  const verifyAdmin = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/admin-login');
        return;
      }

      const { data: adminUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single() as any;

      if (!adminUser || (adminUser as any)?.role !== 'super_admin') {
        router.push('/admin-login');
        return;
      }

      setAdmin(adminUser);
    } catch (error) {
      router.push('/admin-login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin-login');
  };

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Verifying access...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="space-y-2">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
            { id: 'users', label: 'All Users', icon: '👥' },
            { id: 'payments', label: 'Payments', icon: '💳' },
            { id: 'bank-transfers', label: 'Bank Transfers', icon: '🏦' },
            { id: 'contact-messages', label: 'Contact Messages', icon: '💬' },
            { id: 'plans', label: 'Plans Management', icon: '📋' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-12 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'users' && 'All Users'}
              {activeTab === 'payments' && 'Payment Management'}
              {activeTab === 'bank-transfers' && 'Bank Transfer Approvals'}
              {activeTab === 'contact-messages' && 'Contact Messages'}
              {activeTab === 'plans' && 'Plans Management'}
              {activeTab === 'settings' && 'Settings'}
            </h2>
          </div>

          {activeTab === 'overview' && <DashboardOverview />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'payments' && <PaymentsManagement />}
          {activeTab === 'bank-transfers' && <BankTransfersManagement />}
          {activeTab === 'contact-messages' && <ContactMessagesPanel />}
          {activeTab === 'plans' && <PlansManagement />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError('');

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) {
        throw new Error('Admin not authenticated');
      }

      const response = await fetch('/api/admin/dashboard/overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: authData.user.id }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to fetch dashboard stats');
      }

      setStats(payload.stats || null);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Total Users</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Total Revenue</p>
        <p className="text-3xl font-bold text-green-600 mt-2">${stats?.totalRevenue}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Active Subscriptions</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.activeSubscriptions}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Total Events</p>
        <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.totalEvents}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Pending Approvals</p>
        <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pendingApprovals}</p>
      </div>
    </div>
  );
}

// Users Management Component
function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [upgradeModal, setUpgradeModal] = useState<{ shown: boolean; userId: string | null }>({ shown: false, userId: null });
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [upgrading, setUpgrading] = useState(false);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    fetchAdmin();
    fetchUsers();
    fetchPlans();
    // Refresh users every 30 seconds to catch new registrations
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdmin = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        setAdmin(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      setPlans(data || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/admin/users/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: authData.user.id }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to fetch users');
      }

      setUsers(payload.users || []);
      if (payload.synced > 0) {
        console.log(`✅ Synced ${payload.synced} missing user profiles`);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const handleUpgradeClick = (userId: string) => {
    setUpgradeModal({ shown: true, userId });
    setSelectedPlan('basic');
  };

  const handleConfirmUpgrade = async () => {
    if (!upgradeModal.userId || !selectedPlan || !admin) {
      alert('Please select a plan');
      return;
    }

    setUpgrading(true);
    try {
      const response = await fetch('/api/admin/upgrade-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: admin.id,
          userId: upgradeModal.userId,
          planType: selectedPlan,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade user');
      }

      alert(`✅ User upgraded to ${selectedPlan} plan successfully!`);
      setUpgradeModal({ shown: false, userId: null });
      setSelectedPlan('');
      await fetchUsers();
    } catch (error) {
      console.error('Upgrade error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upgrade user');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading && users.length === 0) return <div>Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Total Users: {users.length}
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Full Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Plan</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Joined</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.full_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.subscription_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.subscription_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.plan_type || 'free'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleUpgradeClick(user.id)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Upgrade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upgrade Modal */}
      {upgradeModal.shown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Select Plan to Upgrade</h3>
            
            <div className="space-y-3 mb-6">
              {plans.map((plan) => (
                <label key={plan.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                  style={{ borderColor: selectedPlan === plan.name.toLowerCase() ? '#3b82f6' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="plan"
                    value={plan.name.toLowerCase()}
                    checked={selectedPlan === plan.name.toLowerCase()}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{plan.name}</p>
                    <p className="text-sm text-gray-600">${plan.price_monthly}/month</p>
                  </div>
                </label>
              ))}
              {/* Free option */}
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                style={{ borderColor: selectedPlan === 'free' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="plan"
                  value="free"
                  checked={selectedPlan === 'free'}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900">Free</p>
                  <p className="text-sm text-gray-600">No cost</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUpgradeModal({ shown: false, userId: null });
                  setSelectedPlan('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={upgrading || !selectedPlan}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {upgrading ? 'Upgrading...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Payments Management Component
function PaymentsManagement() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/payments/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: authData.user.id }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payments');
      }

      setPayments(result.payments || []);
      setError(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to fetch payments:', error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-600">Loading payments...</div>;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">Error loading payments</p>
        <p className="text-red-700 text-sm mt-1">{error}</p>
        <p className="text-red-600 text-xs mt-2">Check browser console (F12) for more details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          <p className="text-lg">No payments found</p>
          <p className="text-sm mt-2">Payments will appear here once users make purchases</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Full Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Plan</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Method</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment: any) => {
                const user = payment.users?.[0] || payment.users;
                const plan = payment.subscription_plans;
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600">{user?.email || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{user?.full_name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-600">{plan?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">${parseFloat(payment.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={payment.payment_method === 'paypal' ? 'text-blue-600 font-medium' : 'text-green-600 font-medium'}>
                        {payment.payment_method === 'bank_transfer' ? 'Bank Transfer' : payment.payment_method === 'paypal' ? 'PayPal' : payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'paid' ? '✅ Paid' : 
                         payment.status === 'pending' ? '⏳ Pending' : 
                         '❌ Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Bank Transfers Management Component
function BankTransfersManagement() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAdmin();
    fetchPendingTransfers();
    const interval = setInterval(fetchPendingTransfers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdmin = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        setAdmin(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin:', error);
    }
  };

  const fetchPendingTransfers = async () => {
    try {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/bank-transfers/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: authData.user.id }),
      });

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    if (!admin) return;
    
    setProcessing(paymentId);
    try {
      const response = await fetch('/api/admin/bank-transfers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: admin.id,
          paymentId,
          action: 'approve',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      alert('✅ ' + data.message);
      await fetchPendingTransfers();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Failed to approve'));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!admin) return;
    
    setProcessing(paymentId);
    try {
      const response = await fetch('/api/admin/bank-transfers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: admin.id,
          paymentId,
          action: 'reject',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      alert('✅ ' + data.message);
      await fetchPendingTransfers();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Failed to reject'));
    } finally {
      setProcessing(null);
    }
  };

  const handleViewProof = (payment: any) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-gray-600">Loading pending transfers...</div>;
  }

  if (payments.length === 0) {
    return <div className="text-gray-600 text-center py-8">No pending bank transfer payments</div>;
  }

  return (
    <>
      {/* Table Layout */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Full Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment: any) => {
              const user = payment.users?.[0] || payment.users;
              const plan = payment.subscription_plans;
              
              return (
                <tr key={payment.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-600">{user?.email}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user?.full_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">${parseFloat(payment.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{plan?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(payment.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      onClick={() => handleViewProof(payment)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-semibold"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleApprove(payment.id)}
                      disabled={processing === payment.id}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition text-xs font-semibold"
                    >
                      {processing === payment.id ? '...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(payment.id)}
                      disabled={processing === payment.id}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition text-xs font-semibold"
                    >
                      {processing === payment.id ? '...' : '❌ Reject'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal for Viewing Payment Proof */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center sticky top-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Payment Proof Review</h3>
                <p className="text-sm text-gray-600">
                  {selectedPayment.users?.[0]?.full_name || selectedPayment.users?.full_name} - {selectedPayment.users?.[0]?.email || selectedPayment.users?.email}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Payment Details Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Amount</p>
                  <p className="text-2xl font-bold text-green-600">${parseFloat(selectedPayment.amount).toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Plan</p>
                  <p className="text-lg font-bold text-blue-600">{selectedPayment.subscription_plans?.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Date Submitted</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedPayment.created_at)}</p>
                </div>
              </div>

              {/* Payment Proof Image */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Payment Proof Screenshot</h4>
                <div className="bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden">
                  {selectedPayment.receipt_url ? (
                    <img 
                      src={selectedPayment.receipt_url} 
                      alt="Payment Proof" 
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-400">
                      No image uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Customer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Full Name</p>
                    <p className="text-gray-900">{selectedPayment.users?.[0]?.full_name || selectedPayment.users?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                    <p className="text-gray-900">{selectedPayment.users?.[0]?.email || selectedPayment.users?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
                    <p className="text-gray-900">{selectedPayment.users?.[0]?.phone || selectedPayment.users?.phone || 'No phone'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Current Plan</p>
                    <p className="text-gray-900">{selectedPayment.users?.[0]?.plan_type || selectedPayment.users?.plan_type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="bg-gray-100 px-6 py-4 border-t flex gap-3 sticky bottom-0">
              <button
                onClick={() => {
                  handleApprove(selectedPayment.id);
                  setShowModal(false);
                }}
                disabled={processing === selectedPayment.id}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition"
              >
                {processing === selectedPayment.id ? '⏳ Processing...' : '✅ Approve & Upgrade'}
              </button>
              <button
                onClick={() => {
                  handleReject(selectedPayment.id);
                  setShowModal(false);
                }}
                disabled={processing === selectedPayment.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold transition"
              >
                {processing === selectedPayment.id ? '⏳ Processing...' : '❌ Reject'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Contact Messages Component
function ContactMessagesPanel() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const admin = await getCurrentUser();
      const { data } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      setMessages(data || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading messages...</div>;

  return (
    <div className="space-y-4">
      {messages.map((msg: any) => (
        <div key={msg.id} className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{msg.name}</p>
              <p className="text-sm text-gray-600">{msg.email}</p>
              <p className="mt-2 text-gray-700">{msg.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              msg.status === 'read' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
            }`}>
              {msg.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Plans Management Component
function PlansManagement() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_paypal: '',
    event_limit: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order', { ascending: true });
      setPlans(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (plan: any) => {
    setError('');
    setSuccess('');
    setEditingPlanId(plan.id);
    setForm({
      name: plan.name || '',
      description: plan.description || '',
      price_paypal: (plan.price_paypal ?? plan.price_monthly ?? '').toString(),
      event_limit: plan.event_limit === null || plan.event_limit === undefined ? '' : plan.event_limit.toString(),
      is_active: !!plan.is_active,
    });
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setError('');
  };

  const handleSavePlan = async (planId: string) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.name.trim()) {
        throw new Error('Plan name is required');
      }

      const priceValue = Number(form.price_paypal);
      if (Number.isNaN(priceValue) || priceValue < 0) {
        throw new Error('Price must be a valid number');
      }

      const eventLimitValue = form.event_limit.trim() === '' ? null : Number(form.event_limit);
      if (eventLimitValue !== null && (Number.isNaN(eventLimitValue) || eventLimitValue < 1)) {
        throw new Error('Event limit must be empty or greater than 0');
      }

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user?.id) {
        throw new Error('Admin session expired. Please login again.');
      }

      const response = await fetch('/api/admin/plans/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: authData.user.id,
          planId,
          updates: {
            name: form.name.trim(),
            description: form.description.trim() || null,
            price: priceValue,
            event_limit: eventLimitValue,
            is_active: form.is_active,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to update plan');
      }

      setPlans((prev) => prev.map((plan) => (plan.id === planId ? payload.plan : plan)));
      setEditingPlanId(null);
      setSuccess('Plan updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading plans...</div>;

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <div key={plan.id} className="bg-white p-6 rounded-lg shadow">
            {editingPlanId === plan.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD / month)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_paypal}
                    onChange={(e) => setForm((prev) => ({ ...prev, price_paypal: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Limit (empty = unlimited)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.event_limit}
                    onChange={(e) => setForm((prev) => ({ ...prev, event_limit: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Active Plan
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleSavePlan(plan.id)}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">${plan.price_paypal ?? plan.price_monthly ?? 0}/mo</p>
                <p className="text-sm text-gray-600 mt-4">{plan.description}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-700">
                    Events: {plan.event_limit === null || plan.event_limit === undefined ? 'Unlimited' : plan.event_limit}
                  </p>
                  <p className="text-sm text-gray-700">
                    Status: {plan.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <button
                  onClick={() => handleStartEdit(plan)}
                  className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
                >
                  Edit Plan
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings Component
function SettingsPanel() {
  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Admin Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Account Information
          </label>
          <p className="text-sm text-gray-600">Manage bank transfer details in database</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Notifications
          </label>
          <input type="checkbox" defaultChecked className="rounded" /> Enable email alerts for pending approvals
        </div>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Settings
        </button>
      </div>
    </div>
  );
}
