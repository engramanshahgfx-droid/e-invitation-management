<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\Event;
use App\Models\Guest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckInController extends Controller
{
    public function index(Request $request, Event $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $checkIns = CheckIn::where('event_id', $event->id)
            ->latest('checked_in_at')
            ->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $checkIns,
        ]);
    }

    public function store(Request $request, Event $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'guest_id' => ['nullable', 'exists:guests,id'],
            'guest_name' => ['required', 'string', 'max:120'],
            'method' => ['nullable', 'in:qr_code,manual'],
            'invitation_code' => ['nullable', 'string', 'max:64'],
        ]);

        $guestId = $validated['guest_id'] ?? null;

        if (! $guestId && ! empty($validated['invitation_code'])) {
            $guest = Guest::query()
                ->where('event_id', $event->id)
                ->whereHas('invitation', function ($query) use ($validated): void {
                    $query->where('invitation_code', $validated['invitation_code']);
                })
                ->first();

            if ($guest) {
                $guestId = $guest->id;
            }
        }

        if ($guestId) {
            $alreadyCheckedIn = Guest::where('id', $guestId)
                ->where('check_in_status', 'checked_in')
                ->exists();

            if ($alreadyCheckedIn) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guest already checked in.',
                ], 409);
            }
        }

        $checkIn = CheckIn::create([
            'event_id' => $event->id,
            'guest_id' => $guestId,
            'guest_name' => $validated['guest_name'],
            'method' => $validated['method'] ?? 'manual',
            'checked_in_at' => now(),
        ]);

        if ($guestId) {
            Guest::where('id', $guestId)->update([
                'check_in_status' => 'checked_in',
                'checked_in_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $checkIn,
        ], 201);
    }
}
