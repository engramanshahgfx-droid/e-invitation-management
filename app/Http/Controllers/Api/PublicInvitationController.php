<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicInvitationController extends Controller
{
    public function show(string $invitation_code): JsonResponse
    {
        $invitation = Invitation::with('event.user:id,name,phone')
            ->where('invitation_code', $invitation_code)
            ->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $invitation->id,
                'guest_name' => $invitation->guest_name,
                'guest_email' => $invitation->guest_email,
                'guest_phone' => $invitation->guest_phone,
                'status' => $invitation->status,
                'event_title' => $invitation->event?->title,
                'event_date' => $invitation->event?->event_date,
                'event_time' => $invitation->event?->event_time,
                'event_location' => $invitation->event?->location,
                'event_description' => $invitation->event?->description,
                'organizer_name' => $invitation->event?->user?->name,
                'organizer_phone' => $invitation->event?->user?->phone,
            ],
        ]);
    }

    public function rsvp(Request $request, string $invitation_code): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:accepted,declined,attending'],
        ]);

        $invitation = Invitation::where('invitation_code', $invitation_code)->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation not found.',
            ], 404);
        }

        $invitation->update([
            'status' => $validated['status'],
            'responded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'RSVP updated successfully.',
            'data' => $invitation,
        ]);
    }
}
