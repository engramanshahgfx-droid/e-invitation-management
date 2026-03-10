import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''
);

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    const [usersCount, eventsCount, guestsCount] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('guests').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: usersCount.count || 0,
      totalEvents: eventsCount.count || 0,
      totalGuests: guestsCount.count || 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { totalUsers: 0, totalEvents: 0, totalGuests: 0 };
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*');

    if (error) throw error;

    const paidStatuses = new Set(['paid', 'approved']);
    const totalRevenue = data
      .filter(p => paidStatuses.has(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const approvedPayments = data.filter(p => paidStatuses.has(p.status)).length;
    const pendingPayments = data.filter(p => p.status === 'pending').length;
    const paypalPayments = data.filter(p => p.payment_method === 'paypal').length;
    const bankPayments = data.filter(p => p.payment_method === 'bank_transfer').length;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      approvedPayments,
      pendingPayments,
      paypalPayments,
      bankPayments,
      totalPayments: data.length,
    };
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return {
      totalRevenue: '0.00',
      approvedPayments: 0,
      pendingPayments: 0,
      paypalPayments: 0,
      bankPayments: 0,
      totalPayments: 0,
    };
  }
}

/**
 * Get pending bank transfers
 */
export async function getPendingBankTransfers() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, users(email, full_name), subscription_plans(name)')
      .eq('payment_method', 'bank_transfer')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching pending transfers:', error);
    return [];
  }
}

/**
 * Get all contact messages
 */
export async function getContactMessages() {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }
}

/**
 * Get all subscription plans
 */
export async function getAllPlans() {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

/**
 * Upgrade user to paid plan
 */
export async function upgradeUserPlan(userId: string, planName: string) {
  try {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        account_type: 'paid',
        plan_type: planName.toLowerCase(),
        subscription_expiry: expiryDate.toISOString(),
        event_limit: planName.toLowerCase().includes('pro') ? 999 : 5,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upgrading user:', error);
    throw error;
  }
}

/**
 * Suspend user account
 */
export async function suspendUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_status: 'suspended',
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
}

/**
 * Reactivate user account
 */
export async function reactivateUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw error;
  }
}

/**
 * Mark contact message as read
 */
export async function markMessageAsRead(messageId: string) {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

/**
 * Reply to contact message
 */
export async function replyToMessage(messageId: string, reply: string) {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status: 'replied', reply })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error replying to message:', error);
    throw error;
  }
}
