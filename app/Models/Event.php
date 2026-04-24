<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'event_date',
        'event_time',
        'location',
        'theme',
        'template_id',
        'template_data',
        'template_customization',
        'status',
        'guest_count',
        'budget',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'budget' => 'decimal:2',
            'template_data' => 'json',
            'template_customization' => 'json',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class);
    }
}
