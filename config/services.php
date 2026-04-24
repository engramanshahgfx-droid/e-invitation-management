<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'bank_transfer' => [
        'account_name' => env('BANK_TRANSFER_ACCOUNT_NAME', 'Marasim Events LLC'),
        'bank_name' => env('BANK_TRANSFER_BANK_NAME', 'Demo Bank'),
        'account_number' => env('BANK_TRANSFER_ACCOUNT_NUMBER', '000123456789'),
        'iban' => env('BANK_TRANSFER_IBAN', 'DEMOIBAN1234567890'),
        'currency' => env('BANK_TRANSFER_CURRENCY', 'USD'),
    ],

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_AUTH_TOKEN'),
        'whatsapp_from' => env('TWILIO_WHATSAPP_FROM'),
        'whatsapp_content_sid' => env('TWILIO_WHATSAPP_CONTENT_SID'),
    ],

    'phone' => [
        'default_country_code' => env('DEFAULT_PHONE_COUNTRY_CODE'),
    ],

];
