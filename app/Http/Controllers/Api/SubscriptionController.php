<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SubscriptionController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        $plans = [
            [
                'id' => 'basic',
                'name' => 'Basic',
                'price' => 29.99,
                'billing_period' => 'month',
                'features' => ['1 Event', '200 Guests', 'QR Codes', 'Basic Reports'],
            ],
            [
                'id' => 'pro',
                'name' => 'Pro',
                'price' => 99.99,
                'billing_period' => 'month',
                'features' => ['5 Events', '1,000 Guests', 'Advanced Reports', 'Excel Export'],
            ],
            [
                'id' => 'enterprise',
                'name' => 'Enterprise',
                'price' => 299.99,
                'billing_period' => 'month',
                'features' => ['Unlimited Events', 'Unlimited Guests', 'Priority Support', 'Custom Branding'],
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'subscription_status' => $user->subscription_status,
                'subscription_plan' => $user->subscription_plan,
                'subscription_payment_method' => $user->subscription_payment_method,
                'payment_reference' => $user->payment_reference,
                'payment_note' => $user->payment_note,
                'payment_submitted_at' => $user->payment_submitted_at,
                'payment_reviewed_at' => $user->payment_reviewed_at,
                'payment_review_note' => $user->payment_review_note,
                'subscription_approved_at' => $user->subscription_approved_at,
                'can_manage_event_features' => $user->canManageEventFeatures(),
                'plans' => $plans,
                'bank_details' => [
                    'account_name' => config('services.bank_transfer.account_name'),
                    'bank_name' => config('services.bank_transfer.bank_name'),
                    'account_number' => config('services.bank_transfer.account_number'),
                    'iban' => config('services.bank_transfer.iban'),
                    'currency' => config('services.bank_transfer.currency', 'USD'),
                ],
            ],
        ]);
    }

    public function submitBankTransfer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receipt' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'selected_plan' => ['required', 'in:basic,pro,enterprise'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
            'payment_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();

        if ($user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Admin accounts do not require subscription payment approval.',
            ], 422);
        }

        if ($user->payment_receipt_path) {
            Storage::disk('public')->delete($user->payment_receipt_path);
        }

        $receiptPath = $validated['receipt']->store('payment-receipts', 'public');

        $user->update([
            'subscription_payment_method' => 'bank_transfer',
            'subscription_plan' => $validated['selected_plan'],
            'payment_receipt_path' => $receiptPath,
            'payment_reference' => $validated['payment_reference'] ?? null,
            'payment_note' => $validated['payment_note'] ?? null,
            'payment_submitted_at' => now(),
            'payment_reviewed_at' => null,
            'payment_reviewed_by' => null,
            'payment_review_note' => null,
            'subscription_status' => 'pending_review',
            'subscription_approved_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment receipt uploaded. Your subscription is pending admin review.',
            'data' => [
                'subscription_status' => $user->fresh()->subscription_status,
            ],
        ]);
    }
}
