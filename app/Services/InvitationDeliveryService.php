<?php

namespace App\Services;

use App\Models\Invitation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class InvitationDeliveryService
{
    public function __construct(private readonly PhoneNumberService $phoneNumberService)
    {
    }

    public function publicUrl(Invitation $invitation): string
    {
        $base = rtrim(config('app.url') ?? URL::to('/'), '/');

        return $base.'/invitation/'.$invitation->invitation_code;
    }

    public function sendWhatsApp(Invitation $invitation): array
    {
        $invitation->loadMissing('event.user.organization');
        $phone = $this->phoneNumberService->normalize($invitation->guest_phone);

        if (! $phone) {
            return $this->recordResult($invitation, [
                'attempted' => false,
                'sent' => false,
                'to' => null,
                'reason' => 'missing_or_invalid_phone',
                'status' => 'skipped',
            ]);
        }

        $accountSid = (string) config('services.twilio.account_sid');
        $authToken = (string) config('services.twilio.auth_token');
        $from = (string) config('services.twilio.whatsapp_from');
        $fromLooksPlaceholder = str_contains(strtolower($from), 'your_approved_twilio_sender');

        if ($accountSid === '' || $authToken === '' || $from === '' || $fromLooksPlaceholder) {
            return $this->recordResult($invitation, [
                'attempted' => false,
                'sent' => false,
                'to' => $phone,
                'reason' => 'twilio_not_configured',
                'status' => 'skipped',
            ]);
        }

        $to = 'whatsapp:'.$phone;
        $fromAddress = str_starts_with($from, 'whatsapp:') ? $from : 'whatsapp:'.$from;
        $publicUrl = $this->publicUrl($invitation);
        $organizerName = $invitation->event?->user?->name ?: 'Event Organizer';
        
        // Use organization's WhatsApp number instead of user's phone
        $organization = $invitation->event?->user?->organization;
        $organizationPhone = $organization ? $this->phoneNumberService->normalize($organization->whatsapp_number) : null;
        $organizationContact = $organization?->whatsapp_contact_name ?: $organizerName;
        
        $messageBody = "Hello {$invitation->guest_name}, you're invited by {$organizerName}!\n"
            ."Open your invitation: {$publicUrl}\n";

        if ($organizationPhone) {
            $messageBody .= "Organizer WhatsApp: {$organizationPhone} ({$organizationContact})\n";
        }

        $messageBody .= 'Reply on the invitation page to confirm your attendance.';

        try {
            $response = Http::asForm()
                ->withBasicAuth($accountSid, $authToken)
                ->withoutVerifying()  // Disable SSL verification for local development
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                    'From' => $fromAddress,
                    'To' => $to,
                    'Body' => $messageBody,
                ]);

            if ($response->failed()) {
                $twilioCode = (string) ($response->json('code') ?? '');
                $httpStatus = $response->status();
                $reason = 'twilio_api_error';

                if ($httpStatus === 401 || $twilioCode === '20003') {
                    $reason = 'twilio_auth_failed';
                }

                if ($twilioCode === '63007') {
                    $reason = 'twilio_sender_not_ready';
                }

                Log::warning('Twilio WhatsApp invitation send failed.', [
                    'invitation_id' => $invitation->id,
                    'to' => $to,
                    'status' => $httpStatus,
                    'twilio_code' => $twilioCode,
                    'response' => $response->json(),
                ]);

                return $this->recordResult($invitation, [
                    'attempted' => true,
                    'sent' => false,
                    'to' => $phone,
                    'reason' => $reason,
                    'status' => 'failed',
                ]);
            }

            return $this->recordResult($invitation, [
                'attempted' => true,
                'sent' => true,
                'to' => $phone,
                'message_id' => $response->json('sid'),
                'status' => 'sent',
            ]);
        } catch (\Throwable $exception) {
            Log::error('Twilio WhatsApp invitation exception.', [
                'invitation_id' => $invitation->id,
                'to' => $to,
                'error' => $exception->getMessage(),
            ]);

            return $this->recordResult($invitation, [
                'attempted' => true,
                'sent' => false,
                'to' => $phone,
                'reason' => 'twilio_exception',
                'status' => 'failed',
            ]);
        }
    }

    public function markShared(Invitation $invitation): void
    {
        $invitation->forceFill([
            'last_shared_at' => now(),
        ])->save();
    }

    private function recordResult(Invitation $invitation, array $result): array
    {
        $invitation->forceFill([
            'delivery_channel' => 'whatsapp',
            'delivery_status' => $result['status'],
            'delivery_phone' => $result['to'] ?? null,
            'delivery_message_id' => $result['message_id'] ?? null,
            'delivery_error' => $result['reason'] ?? null,
            'delivery_last_attempt_at' => now(),
            'delivery_sent_at' => ($result['sent'] ?? false) ? now() : null,
            'last_shared_at' => now(),
        ])->save();

        return $result;
    }
}