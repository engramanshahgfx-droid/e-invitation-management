<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $validated = $request->validate([
            'event_id' => ['nullable', 'exists:events,id'],
        ]);

        $eventQuery = Event::where('user_id', $userId);
        if (! empty($validated['event_id'])) {
            $eventQuery->where('id', $validated['event_id']);
        }

        $eventIds = $eventQuery->pluck('id');

        $totalEvents = $eventIds->count();
        $totalGuests = Guest::whereIn('event_id', $eventIds)->count();
        $confirmed = Invitation::whereIn('event_id', $eventIds)
            ->whereIn('status', ['accepted', 'attending'])
            ->count();
        $declined = Invitation::whereIn('event_id', $eventIds)
            ->where('status', 'declined')
            ->count();
        $pending = Invitation::whereIn('event_id', $eventIds)
            ->where('status', 'pending')
            ->count();
        $checkedIn = CheckIn::whereIn('event_id', $eventIds)->count();

        $recentEvents = Event::whereIn('id', $eventIds)
            ->orderByDesc('event_date')
            ->take(5)
            ->get(['id', 'title', 'event_date', 'status', 'location']);

        return response()->json([
            'success' => true,
            'data' => [
                'totals' => [
                    'events' => $totalEvents,
                    'guests' => $totalGuests,
                    'checkins' => $checkedIn,
                ],
                'invitationStatus' => [
                    'confirmed' => $confirmed,
                    'declined' => $declined,
                    'pending' => $pending,
                ],
                'recentEvents' => $recentEvents,
                'totalEvents' => $totalEvents,
                'totalGuests' => $totalGuests,
                'confirmedGuests' => $confirmed,
                'declinedGuests' => $declined,
                'pendingResponses' => $pending,
                'checkedIn' => $checkedIn,
            ],
        ]);
    }
}
