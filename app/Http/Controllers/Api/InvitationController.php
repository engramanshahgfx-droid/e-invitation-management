<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Invitation;
use App\Services\InvitationDeliveryService;
use App\Services\PhoneNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;

class InvitationController extends Controller
{
    public function __construct(
        private readonly InvitationDeliveryService $invitationDeliveryService,
        private readonly PhoneNumberService $phoneNumberService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'exists:events,id'],
        ]);

        $query = Invitation::query()
            ->whereHas('event', function ($query) use ($request): void {
                $query->where('user_id', $request->user()->id);
            })
            ->latest();

        if (! empty($validated['event_id'])) {
            $query->where('event_id', $validated['event_id']);
        }

        $invitations = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $invitations,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'guest_name' => ['required', 'string', 'max:120'],
            'guest_email' => ['required', 'email', 'max:190'],
            'guest_phone' => ['nullable', 'string', 'max:30', 'regex:/^(\+966|0)?[0-9]{7,12}$/'],
            'template_id' => ['nullable', 'string'],
            'template_data' => ['nullable', 'json'],
            'template_customization' => ['nullable', 'json'],
        ]);

        $event = Event::findOrFail($validated['event_id']);

        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $this->ensureOrganizerPhoneConfigured($request);

        $templateId = $validated['template_id'] ?? $event->template_id;
        $templateData = $this->templateDataWithGuestName(
            array_key_exists('template_data', $validated) ? $validated['template_data'] : $event->template_data,
            $validated['guest_name']
        );
        $templateCustomization = $this->normalizeTemplateObject(
            array_key_exists('template_customization', $validated) ? $validated['template_customization'] : $event->template_customization
        );

        if (! $templateId && $templateData === null && $templateCustomization === null) {
            $templateId = null;
        }

        $invitationPayload = $validated;
        unset($invitationPayload['template_id'], $invitationPayload['template_data'], $invitationPayload['template_customization']);

        $invitation = Invitation::create([
            ...$invitationPayload,
            'guest_phone' => $this->phoneNumberService->normalize($validated['guest_phone'] ?? null),
            'template_id' => $templateId,
            'template_data' => $templateData,
            'template_customization' => $templateCustomization,
            'status' => 'pending',
            'invitation_code' => strtoupper(bin2hex(random_bytes(4))),
            'delivery_status' => 'not_sent',
        ]);

        $publicUrl = $this->invitationDeliveryService->publicUrl($invitation);
        $whatsAppDelivery = $this->invitationDeliveryService->sendWhatsApp($invitation);

        return response()->json([
            'success' => true,
            'message' => $whatsAppDelivery['sent'] ?? false
                ? 'Invitation created and sent on WhatsApp.'
                : 'Invitation created successfully.',
            'data' => [
                'invitation' => $invitation,
                'public_url' => $publicUrl,
                'whatsapp' => $whatsAppDelivery,
            ],
        ], 201);
    }

    public function show(Request $request, Invitation $invitation): JsonResponse
    {
        if ($invitation->event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $invitation,
        ]);
    }

    public function update(Request $request, Invitation $invitation): JsonResponse
    {
        if ($invitation->event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'guest_name' => ['sometimes', 'string', 'max:120'],
            'guest_email' => ['sometimes', 'email', 'max:190'],
            'guest_phone' => ['sometimes', 'nullable', 'string', 'max:30', 'regex:/^(\+966|0)?[0-9]{7,12}$/'],
            'status' => ['sometimes', 'in:pending,accepted,declined,attending'],
            'template_id' => ['sometimes', 'string'],
            'template_data' => ['sometimes', 'json'],
            'template_customization' => ['sometimes', 'json'],
        ]);

        if (array_key_exists('status', $validated)) {
            $validated['responded_at'] = now();
        }

        if (array_key_exists('guest_phone', $validated)) {
            $validated['guest_phone'] = $this->phoneNumberService->normalize($validated['guest_phone']);
        }

        $invitation->update($validated);

        return response()->json([
            'success' => true,
            'data' => $invitation,
        ]);
    }

    public function destroy(Request $request, Invitation $invitation): JsonResponse
    {
        if ($invitation->event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $invitation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invitation deleted.',
        ]);
    }

    public function share(Request $request, Invitation $invitation): JsonResponse
    {
        if ($invitation->event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $this->ensureOrganizerPhoneConfigured($request);

        $base = rtrim(config('app.url') ?? URL::to('/'), '/');
        $publicUrl = $this->invitationDeliveryService->publicUrl($invitation);
        $apiUrl = $base.'/api/invitations/shared/'.$invitation->invitation_code;
        $whatsAppDelivery = $this->invitationDeliveryService->sendWhatsApp($invitation);
        $this->invitationDeliveryService->markShared($invitation);

        return response()->json([
            'success' => true,
            'data' => [
                'invitation_code' => $invitation->invitation_code,
                'public_url' => $publicUrl,
                'api_url' => $apiUrl,
                'whatsapp' => $whatsAppDelivery,
            ],
        ]);
    }

    public function bulkFromGuests(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'resend_existing' => ['nullable', 'boolean'],
        ]);

        $event = Event::findOrFail($validated['event_id']);

        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $this->ensureOrganizerPhoneConfigured($request);

        $resendExisting = (bool) ($validated['resend_existing'] ?? false);
        $guests = Guest::where('event_id', $event->id)->get();

        $eventTemplateId = $event->template_id;
        $eventTemplateData = $event->template_data;
        $eventTemplateCustomization = $event->template_customization;

        $createdCount = 0;
        $sentCount = 0;
        $failedCount = 0;
        $skippedCount = 0;
        $results = [];

        foreach ($guests as $guest) {
            $invitation = $guest->invitation_id ? Invitation::find($guest->invitation_id) : null;

            if (! $invitation) {
                $invitation = Invitation::create([
                    'event_id' => $event->id,
                    'guest_name' => $guest->name,
                    'guest_email' => $guest->email,
                    'guest_phone' => $this->phoneNumberService->normalize($guest->phone),
                    'template_id' => $eventTemplateId,
                    'template_data' => $this->templateDataWithGuestName($eventTemplateData, $guest->name),
                    'template_customization' => $this->normalizeTemplateObject($eventTemplateCustomization),
                    'status' => 'pending',
                    'invitation_code' => strtoupper(bin2hex(random_bytes(4))),
                    'delivery_status' => 'not_sent',
                ]);

                $guest->update(['invitation_id' => $invitation->id]);
                $createdCount++;
            } elseif (! $resendExisting) {
                $results[] = [
                    'guest_id' => $guest->id,
                    'guest_name' => $guest->name,
                    'invitation_id' => $invitation->id,
                    'delivery_status' => $invitation->delivery_status,
                    'reason' => 'existing_invitation_skipped',
                ];
                $skippedCount++;
                continue;
            }

            $delivery = $this->invitationDeliveryService->sendWhatsApp($invitation);

            if ($delivery['sent'] ?? false) {
                $sentCount++;
            } elseif (($delivery['status'] ?? '') === 'skipped') {
                $skippedCount++;
            } else {
                $failedCount++;
            }

            $results[] = [
                'guest_id' => $guest->id,
                'guest_name' => $guest->name,
                'invitation_id' => $invitation->id,
                'delivery_status' => $invitation->fresh()->delivery_status,
                'reason' => $delivery['reason'] ?? null,
                'to' => $delivery['to'] ?? null,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Bulk invitation processing completed.',
            'data' => [
                'created_count' => $createdCount,
                'sent_count' => $sentCount,
                'failed_count' => $failedCount,
                'skipped_count' => $skippedCount,
                'results' => $results,
            ],
        ]);
    }

    private function ensureOrganizerPhoneConfigured(Request $request): void
    {
        $user = $request->user();
        $normalizedPhone = $this->phoneNumberService->normalize($user?->phone);

        if ($normalizedPhone) {
            if ($user && $user->phone !== $normalizedPhone) {
                $user->forceFill(['phone' => $normalizedPhone])->save();
            }

            return;
        }

        throw ValidationException::withMessages([
            'phone' => ['Save a valid WhatsApp number on your profile before sending invitations.'],
        ]);
    }

    private function normalizeTemplateObject(mixed $value): ?array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value) && trim($value) !== '') {
            $decoded = json_decode($value, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    private function templateDataWithGuestName(mixed $value, string $guestName): ?array
    {
        $templateData = $this->normalizeTemplateObject($value) ?? [];

        if ($guestName !== '') {
            $templateData['guest_name'] = $guestName;
        }

        return $templateData === [] ? null : $templateData;
    }
}
