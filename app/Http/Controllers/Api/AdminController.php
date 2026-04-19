<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    // ------------------------------------------------------------------ overview

    public function overview(): JsonResponse
    {
        $totalUsers     = User::count();
        $totalEvents    = Event::count();
        $totalGuests    = Guest::count();
        $totalCheckins  = CheckIn::count();
        $totalInvitations = Invitation::count();

        $adminUsers     = User::whereIn('account_type', ['admin', 'superadmin'])->count();
        $freeUsers      = User::where('account_type', 'free')->count();
        $proUsers       = User::where('account_type', 'pro')->count();

        $recentUsers = User::orderByDesc('created_at')
            ->take(10)
            ->get(['id', 'name', 'email', 'account_type', 'subscription_status', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => [
                'totals' => [
                    'users'       => $totalUsers,
                    'events'      => $totalEvents,
                    'guests'      => $totalGuests,
                    'checkins'    => $totalCheckins,
                    'invitations' => $totalInvitations,
                ],
                'usersByType' => [
                    'free'       => $freeUsers,
                    'pro'        => $proUsers,
                    'admin'      => $adminUsers,
                ],
                'recentUsers' => $recentUsers,
            ],
        ]);
    }

    // ------------------------------------------------------------------ users

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($type = $request->query('account_type')) {
            $query->where('account_type', $type);
        }

        $users = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    public function showUser(User $user): JsonResponse
    {
        $user->loadCount(['events', 'guests', 'invitations']);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    public function upgradeUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'account_type'        => ['required', 'in:free,pro,admin,superadmin'],
            'subscription_status' => ['nullable', 'in:trial,pending_review,active,rejected,expired,cancelled'],
            'subscription_plan'   => ['nullable', 'in:basic,pro,enterprise'],
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data'    => $user->fresh(),
        ]);
    }

    public function resetUserPassword(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->update(['password' => Hash::make($validated['password'])]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully.',
        ]);
    }

    public function deleteUser(Request $request, User $user): JsonResponse
    {
        // Prevent superadmin from deleting themselves
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted.',
        ]);
    }

    // ------------------------------------------------------------------ plans (account_type based)

    public function plans(): JsonResponse
    {
        $plans = [
            [
                'id'          => 'free',
                'name'        => 'Free',
                'description' => 'Basic access. Trial period.',
                'features'    => ['Up to 1 event', '50 guests', 'Basic templates'],
            ],
            [
                'id'          => 'pro',
                'name'        => 'Pro',
                'description' => 'Full organizer access.',
                'features'    => ['Unlimited events', 'Unlimited guests', 'All templates', 'Reports & analytics', 'CSV export'],
            ],
            [
                'id'          => 'admin',
                'name'        => 'Admin',
                'description' => 'Platform admin access (same capability as Super Admin).',
                'features'    => ['All Pro features', 'User management', 'System overview', 'Payment verification'],
            ],
            [
                'id'          => 'superadmin',
                'name'        => 'Super Admin',
                'description' => 'Platform admin access (same capability as Admin).',
                'features'    => ['All Pro features', 'User management', 'System overview', 'Payment verification'],
            ],
        ];

        $counts = User::selectRaw('account_type, count(*) as total')
            ->groupBy('account_type')
            ->pluck('total', 'account_type');

        foreach ($plans as &$plan) {
            $plan['user_count'] = $counts[$plan['id']] ?? 0;
        }

        return response()->json([
            'success' => true,
            'data'    => $plans,
        ]);
    }

    // ------------------------------------------------------------------ system stats

    public function systemStats(): JsonResponse
    {
        $stats = [
            'users_today'      => User::whereDate('created_at', today())->count(),
            'events_today'     => Event::whereDate('created_at', today())->count(),
            'invitations_sent' => Invitation::count(),
            'checkins_today'   => CheckIn::whereDate('created_at', today())->count(),
            'active_users'     => User::where('subscription_status', 'active')->count(),
            'trial_users'      => User::where('subscription_status', 'trial')->count(),
            'pending_payment_reviews' => User::where('subscription_status', 'pending_review')->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => $stats,
        ]);
    }

    // ------------------------------------------------------------------ subscription reviews

    public function pendingSubscriptions(): JsonResponse
    {
        $users = User::where('subscription_status', 'pending_review')
            ->orderByDesc('payment_submitted_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function invitationDeliveryLog(): JsonResponse
    {
        $invitations = Invitation::query()
            ->with(['event:id,title,user_id', 'event.user:id,name,email'])
            ->whereNotNull('delivery_channel')
            ->latest('delivery_last_attempt_at')
            ->take(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invitations,
        ]);
    }

    public function approveSubscription(Request $request, User $user): JsonResponse
    {
        if (! $user->payment_receipt_path) {
            return response()->json([
                'success' => false,
                'message' => 'No payment receipt uploaded for this user.',
            ], 422);
        }

        $validated = $request->validate([
            'review_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $user->update([
            'account_type' => in_array($user->account_type, ['admin', 'superadmin'], true) ? $user->account_type : 'pro',
            'subscription_status' => 'active',
            'subscription_plan' => $user->subscription_plan ?: 'basic',
            'subscription_approved_at' => now(),
            'payment_reviewed_at' => now(),
            'payment_reviewed_by' => $request->user()->id,
            'payment_review_note' => $validated['review_note'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription approved. User is now an official event subscriber.',
            'data' => $user->fresh(),
        ]);
    }

    public function rejectSubscription(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'review_note' => ['required', 'string', 'max:1000'],
        ]);

        $user->update([
            'subscription_status' => 'rejected',
            'payment_reviewed_at' => now(),
            'payment_reviewed_by' => $request->user()->id,
            'payment_review_note' => $validated['review_note'],
            'subscription_approved_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription payment was rejected.',
            'data' => $user->fresh(),
        ]);
    }

    public function subscriptionReceipt(User $user): StreamedResponse|JsonResponse
    {
        if (! $user->payment_receipt_path || ! Storage::disk('public')->exists($user->payment_receipt_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Receipt file not found.',
            ], 404);
        }

        $disk = Storage::disk('public');
        $mimeType = $disk->mimeType($user->payment_receipt_path) ?: 'application/octet-stream';
        $filename = basename($user->payment_receipt_path);

        return $disk->response($user->payment_receipt_path, $filename, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }
}
