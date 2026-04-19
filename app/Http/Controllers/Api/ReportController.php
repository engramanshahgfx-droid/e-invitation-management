<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\Event;
use App\Models\Guest;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function events(Request $request): StreamedResponse
    {
        $eventIds = $this->resolveEventIds($request);

        $events = Event::whereIn('id', $eventIds)
            ->orderByDesc('event_date')
            ->get(['id', 'title', 'event_date', 'event_time', 'location', 'status', 'guest_count']);

        return $this->streamCsv('events-report.csv', ['ID', 'Title', 'Date', 'Time', 'Location', 'Status', 'Guest Count'], $events->map(function ($event): array {
            return [
                (string) $event->id,
                (string) $event->title,
                (string) $event->event_date,
                (string) $event->event_time,
                (string) $event->location,
                (string) $event->status,
                (string) ($event->guest_count ?? 0),
            ];
        })->all());
    }

    public function guests(Request $request): StreamedResponse
    {
        $eventIds = $this->resolveEventIds($request);

        $guests = Guest::whereIn('event_id', $eventIds)
            ->with('event:id,title')
            ->orderByDesc('created_at')
            ->get(['id', 'event_id', 'name', 'email', 'phone', 'party_size', 'check_in_status', 'created_at']);

        return $this->streamCsv('guests-report.csv', ['ID', 'Event', 'Name', 'Email', 'Phone', 'Party Size', 'Check-in Status', 'Created At'], $guests->map(function ($guest): array {
            return [
                (string) $guest->id,
                (string) ($guest->event?->title ?? ''),
                (string) $guest->name,
                (string) ($guest->email ?? ''),
                (string) ($guest->phone ?? ''),
                (string) $guest->party_size,
                (string) $guest->check_in_status,
                (string) $guest->created_at,
            ];
        })->all());
    }

    public function checkins(Request $request): StreamedResponse
    {
        $eventIds = $this->resolveEventIds($request);

        $checkIns = CheckIn::whereIn('event_id', $eventIds)
            ->with('event:id,title')
            ->latest('checked_in_at')
            ->get(['id', 'event_id', 'guest_name', 'method', 'checked_in_at']);

        return $this->streamCsv('checkins-report.csv', ['ID', 'Event', 'Guest', 'Method', 'Checked In At'], $checkIns->map(function ($checkIn): array {
            return [
                (string) $checkIn->id,
                (string) ($checkIn->event?->title ?? ''),
                (string) $checkIn->guest_name,
                (string) $checkIn->method,
                (string) $checkIn->checked_in_at,
            ];
        })->all());
    }

    /**
     * @param array<int, string> $header
     * @param array<int, array<int, string>> $rows
     */
    private function streamCsv(string $filename, array $header, array $rows): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($header, $rows): void {
            $handle = fopen('php://output', 'w');
            if (! $handle) {
                return;
            }

            fputcsv($handle, $header);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename='.$filename);

        return $response;
    }

    private function resolveEventIds(Request $request)
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'exists:events,id'],
        ]);

        $events = Event::where('user_id', $request->user()->id);
        if (! empty($validated['event_id'])) {
            $events->where('id', $validated['event_id']);
        }

        return $events->pluck('id');
    }
}
