<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckInController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\PublicInvitationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/register/send-otp', [AuthController::class, 'sendRegistrationOtp']);
Route::post('/auth/register/verify-otp', [AuthController::class, 'verifyRegistrationOtp']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/forgot-password/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/forgot-password/reset', [AuthController::class, 'resetPassword']);

Route::get('/invitations/shared/{invitation_code}', [PublicInvitationController::class, 'show']);
Route::post('/invitations/shared/{invitation_code}/rsvp', [PublicInvitationController::class, 'rsvp']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/subscription/status', [SubscriptionController::class, 'status']);
    Route::post('/subscription/bank-transfer', [SubscriptionController::class, 'submitBankTransfer']);

    Route::middleware('approved-subscriber')->group(function (): void {
        Route::apiResource('events', EventController::class);
        Route::apiResource('invitations', InvitationController::class);
        Route::apiResource('guests', GuestController::class);

        Route::post('/guests/upload', [GuestController::class, 'upload']);
        Route::delete('/guests/delete-all', [GuestController::class, 'destroyAll']);

        Route::get('/dashboard/overview', [DashboardController::class, 'overview']);

        Route::get('/reports/events/export', [ReportController::class, 'events']);
        Route::get('/reports/guests/export', [ReportController::class, 'guests']);
        Route::get('/reports/checkins/export', [ReportController::class, 'checkins']);

        Route::post('/invitations/bulk-from-guests', [InvitationController::class, 'bulkFromGuests']);
        Route::post('/invitations/{invitation}/share', [InvitationController::class, 'share']);

        Route::get('/events/{event}/check-ins', [CheckInController::class, 'index']);
        Route::post('/events/{event}/check-ins', [CheckInController::class, 'store']);
    });
});

// Admin routes — requires Sanctum auth + admin/superadmin account_type
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function (): void {
    Route::get('/overview', [AdminController::class, 'overview']);
    Route::get('/system-stats', [AdminController::class, 'systemStats']);
    Route::get('/plans', [AdminController::class, 'plans']);
    Route::get('/invitations/delivery-log', [AdminController::class, 'invitationDeliveryLog']);

    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/users/{user}', [AdminController::class, 'showUser']);
    Route::patch('/users/{user}/upgrade', [AdminController::class, 'upgradeUser']);
    Route::post('/users/{user}/reset-password', [AdminController::class, 'resetUserPassword']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);

    Route::get('/subscriptions/pending', [AdminController::class, 'pendingSubscriptions']);
    Route::get('/subscriptions/{user}/receipt', [AdminController::class, 'subscriptionReceipt']);
    Route::patch('/subscriptions/{user}/approve', [AdminController::class, 'approveSubscription']);
    Route::patch('/subscriptions/{user}/reject', [AdminController::class, 'rejectSubscription']);
});
