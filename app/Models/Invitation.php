<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'status',
        'invitation_code',
        'delivery_channel',
        'delivery_status',
        'delivery_phone',
        'delivery_message_id',
        'delivery_error',
        'delivery_last_attempt_at',
        'delivery_sent_at',
        'last_shared_at',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'delivery_last_attempt_at' => 'datetime',
            'delivery_sent_at' => 'datetime',
            'last_shared_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
