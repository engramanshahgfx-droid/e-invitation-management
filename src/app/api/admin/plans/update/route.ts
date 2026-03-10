import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { adminId, planId, updates } = await request.json();

    if (!adminId || !planId || !updates) {
      return NextResponse.json(
        { error: 'adminId, planId, and updates are required' },
        { status: 400 }
      );
    }

    // Only super admins can edit plans.
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single() as any;

    if (adminError || (admin as any)?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Super admin access required' },
        { status: 403 }
      );
    }

    const sanitizedUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.name === 'string') {
      sanitizedUpdates.name = updates.name.trim();
    }

    if (updates.description === null || typeof updates.description === 'string') {
      sanitizedUpdates.description = updates.description;
    }

    const hasNumericPrice = typeof updates.price === 'number' && !Number.isNaN(updates.price);

    if (
      updates.event_limit === null ||
      (typeof updates.event_limit === 'number' && !Number.isNaN(updates.event_limit))
    ) {
      sanitizedUpdates.event_limit = updates.event_limit;
    }

    if (typeof updates.is_active === 'boolean') {
      sanitizedUpdates.is_active = updates.is_active;
    }

    let updatePayload = { ...sanitizedUpdates };
    if (hasNumericPrice) {
      updatePayload = { ...updatePayload, price_paypal: updates.price };
    }

    let { data: updatedPlan, error: updateError } = await supabase
      .from('subscription_plans')
      .update(updatePayload)
      .eq('id', planId)
      .select('*')
      .single();

    // Backward compatibility for schema variants using price_monthly.
    if (updateError && hasNumericPrice) {
      const fallbackPayload = { ...sanitizedUpdates, price_monthly: updates.price };
      const fallbackResult = await supabase
        .from('subscription_plans')
        .update(fallbackPayload)
        .eq('id', planId)
        .select('*')
        .single();

      updatedPlan = fallbackResult.data;
      updateError = fallbackResult.error;
    }

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update plan' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error: any) {
    console.error('Admin update plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update plan' },
      { status: 500 }
    );
  }
}
