<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Guest;
use App\Services\PhoneNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function __construct(private readonly PhoneNumberService $phoneNumberService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'exists:events,id'],
        ]);

        $query = Guest::query()
            ->whereHas('event', function ($eventQuery) use ($request): void {
                $eventQuery->where('user_id', $request->user()->id);
            })
            ->latest();

        if (! empty($validated['event_id'])) {
            $query->where('event_id', $validated['event_id']);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(50),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'party_size' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $event = Event::findOrFail($validated['event_id']);

        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $guest = Guest::create([
            ...$validated,
            'phone' => $this->phoneNumberService->normalize($validated['phone'] ?? null),
            'party_size' => $validated['party_size'] ?? 1,
            'check_in_status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $guest,
        ], 201);
    }

    public function show(Request $request, Guest $guest): JsonResponse
    {
        if ($guest->event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $guest,
        ]);
    }

    public function update(Request $request, Guest $guest): JsonResponse
    {
        if ($guest->event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'party_size' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        if (array_key_exists('phone', $validated)) {
            $validated['phone'] = $this->phoneNumberService->normalize($validated['phone']);
        }

        $guest->update($validated);

        return response()->json([
            'success' => true,
            'data' => $guest,
        ]);
    }

    public function destroy(Request $request, Guest $guest): JsonResponse
    {
        if ($guest->event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $guest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Guest deleted.',
        ]);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
        ]);

        $event = Event::findOrFail($validated['event_id']);

        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        Guest::where('event_id', $event->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'All guests deleted.',
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'csv' => ['required', 'string'],
        ]);

        $event = Event::findOrFail($validated['event_id']);

        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $rows = preg_split('/\r\n|\r|\n/', trim($validated['csv'])) ?: [];
        if (count($rows) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'CSV must include header and at least one row.',
            ], 422);
        }

        $header = array_map(static fn ($item) => strtolower(trim($item)), str_getcsv((string) array_shift($rows)));
        $created = 0;

        foreach ($rows as $row) {
            if (trim($row) === '') {
                continue;
            }

            $values = str_getcsv($row);
            $record = array_combine($header, array_pad($values, count($header), null));

            if (! $record || empty($record['name'])) {
                continue;
            }

            Guest::create([
                'event_id' => $event->id,
                'name' => (string) ($record['name'] ?? ''),
                'email' => $record['email'] ?? null,
                'phone' => $this->phoneNumberService->normalize($record['phone'] ?? null),
                'party_size' => max((int) ($record['party_size'] ?? 1), 1),
                'check_in_status' => 'pending',
            ]);

            $created++;
        }

        return response()->json([
            'success' => true,
            'message' => "Imported {$created} guests.",
            'count' => $created,
        ]);
    }
}
