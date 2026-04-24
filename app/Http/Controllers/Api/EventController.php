<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = $request->user()
            ->events()
            ->orderByDesc('event_date')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event_date' => ['required', 'date'],
            'event_time' => ['required', 'date_format:H:i'],
            'location' => ['required', 'string', 'max:255'],
            'theme' => ['nullable', 'string', 'max:120'],
            'template_id' => ['nullable', 'string', 'max:80'],
            'template_data' => ['nullable', 'array'],
            'template_customization' => ['nullable', 'array'],
            'status' => ['nullable', 'in:draft,published,completed,cancelled'],
            'guest_count' => ['nullable', 'integer', 'min:0'],
            'budget' => ['nullable', 'numeric', 'min:0'],
        ]);

        $event = $request->user()->events()->create($validated);

        return response()->json([
            'success' => true,
            'data' => $event,
        ], 201);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $event->load(['invitations', 'guests']);

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event_date' => ['sometimes', 'date'],
            'event_time' => ['sometimes', 'date_format:H:i'],
            'location' => ['sometimes', 'string', 'max:255'],
            'theme' => ['nullable', 'string', 'max:120'],
            'template_id' => ['sometimes', 'nullable', 'string', 'max:80'],
            'template_data' => ['sometimes', 'nullable', 'array'],
            'template_customization' => ['sometimes', 'nullable', 'array'],
            'status' => ['sometimes', 'in:draft,published,completed,cancelled'],
            'guest_count' => ['nullable', 'integer', 'min:0'],
            'budget' => ['nullable', 'numeric', 'min:0'],
        ]);

        $event->update($validated);

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted.',
        ]);
    }
}
