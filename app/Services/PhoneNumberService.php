<?php

namespace App\Services;

class PhoneNumberService
{
    public function normalize(?string $rawPhone): ?string
    {
        if (! $rawPhone) {
            return null;
        }

        $clean = trim($rawPhone);
        if ($clean === '') {
            return null;
        }

        $clean = preg_replace('/(ext|extension)\s*\d+$/i', '', $clean) ?? $clean;
        $clean = preg_replace('/[^\d+]/', '', $clean) ?? '';

        if ($clean === '') {
            return null;
        }

        if (str_starts_with($clean, '00')) {
            $clean = '+'.substr($clean, 2);
        }

        if (str_starts_with($clean, '+')) {
            return preg_match('/^\+\d{8,15}$/', $clean) ? $clean : null;
        }

        $digits = ltrim($clean, '0');
        $defaultCountryCode = (string) config('services.phone.default_country_code', '');
        $defaultCountryCode = preg_replace('/[^\d+]/', '', $defaultCountryCode) ?? '';

        if ($digits === '' || $defaultCountryCode === '' || ! str_starts_with($defaultCountryCode, '+')) {
            return null;
        }

        $normalized = $defaultCountryCode.$digits;

        return preg_match('/^\+\d{8,15}$/', $normalized) ? $normalized : null;
    }

    public function toWhatsAppAddress(?string $phone): ?string
    {
        $normalized = $this->normalize($phone);

        return $normalized ? 'whatsapp:'.$normalized : null;
    }
}