<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationCode;
use App\Services\PhoneNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly PhoneNumberService $phoneNumberService)
    {
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'otp_code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $otpRecord = VerificationCode::where('email', $validated['email'])
            ->where('type', 'registration')
            ->where('code', $validated['otp_code'])
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $otpRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired registration OTP.',
            ], 422);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $this->phoneNumberService->normalize($validated['phone'] ?? null),
            'password' => $validated['password'],
            'account_type' => 'free',
            'subscription_status' => 'trial',
        ]);

        $token = $user->createToken('api')->plainTextToken;

        $otpRecord->update([
            'is_used' => true,
            'used_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function sendRegistrationOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:190'],
        ]);

        $existingUser = User::where('email', $validated['email'])->exists();

        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'This email is already registered. Please sign in.',
            ], 422);
        }

        $code = (string) random_int(100000, 999999);

        VerificationCode::where('email', $validated['email'])
            ->where('type', 'registration')
            ->delete();

        VerificationCode::create([
            'email' => $validated['email'],
            'code' => $code,
            'type' => 'registration',
            'expires_at' => now()->addMinutes(10),
        ]);

        return $this->sendOtpResponse(
            email: $validated['email'],
            code: $code,
            subject: 'Marasim - Verify your account',
            body: "Your Marasim verification code is {$code}. It expires in 10 minutes.",
            failureLogContext: 'Registration OTP mail delivery failed.'
        );
    }

    public function verifyRegistrationOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:190'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $record = VerificationCode::where('email', $validated['email'])
            ->where('type', 'registration')
            ->where('code', $validated['code'])
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired registration OTP.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration OTP verified successfully.',
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => $request->user(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user = $request->user();

        if (array_key_exists('phone', $validated)) {
            $validated['phone'] = $this->phoneNumberService->normalize($validated['phone']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $code = (string) random_int(100000, 999999);

        VerificationCode::where('email', $validated['email'])
            ->where('type', 'password_reset')
            ->delete();

        VerificationCode::create([
            'email' => $validated['email'],
            'code' => $code,
            'type' => 'password_reset',
            'expires_at' => now()->addMinutes(10),
        ]);

        return $this->sendOtpResponse(
            email: $validated['email'],
            code: $code,
            subject: 'Marasim - Password reset OTP',
            body: "Your Marasim password reset code is {$code}. It expires in 10 minutes.",
            failureLogContext: 'Password reset OTP mail delivery failed.'
        );
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $record = VerificationCode::where('email', $validated['email'])
            ->where('type', 'password_reset')
            ->where('code', $validated['code'])
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP verified.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $record = VerificationCode::where('email', $validated['email'])
            ->where('type', 'password_reset')
            ->where('code', $validated['code'])
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP.',
            ], 422);
        }

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        $record->update([
            'is_used' => true,
            'used_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful.',
        ]);
    }

    private function sendOtpResponse(string $email, string $code, string $subject, string $body, string $failureLogContext): JsonResponse
    {
        try {
            Mail::raw($body, function ($message) use ($email, $subject): void {
                $message->to($email)
                    ->subject($subject);
            });

            $response = [
                'success' => true,
                'message' => 'Verification OTP sent to your email.',
                'delivery_channel' => 'email',
            ];

            if (config('app.debug')) {
                $response['debug_code'] = $code;
            }

            return response()->json($response);
        } catch (\Throwable $exception) {
            Log::warning($failureLogContext, [
                'email' => $email,
                'error' => $exception->getMessage(),
            ]);

            if (config('app.debug')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email delivery is unavailable right now. Use the OTP shown below to continue.',
                    'delivery_channel' => 'debug',
                    'debug_code' => $code,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'We could not deliver the OTP email right now. Please try again in a moment.',
            ], 503);
        }
    }
}
