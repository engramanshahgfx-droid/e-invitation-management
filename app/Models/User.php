<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

#[Fillable([
    'name',
    'email',
    'phone',
    'password',
    'account_type',
    'subscription_status',
    'subscription_plan',
    'subscription_expiry',
    'subscription_payment_method',
    'payment_receipt_path',
    'payment_reference',
    'payment_note',
    'payment_submitted_at',
    'payment_reviewed_at',
    'payment_reviewed_by',
    'payment_review_note',
    'subscription_approved_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public function canAccessPanel(Panel $panel): bool
    {
        return in_array($this->account_type, ['admin', 'superadmin']);
    }

    public function isAdmin(): bool
    {
        return in_array($this->account_type, ['admin', 'superadmin'], true);
    }

    public function canManageEventFeatures(): bool
    {
        return $this->isAdmin() || $this->subscription_status === 'active';
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'subscription_expiry' => 'datetime',
            'payment_submitted_at' => 'datetime',
            'payment_reviewed_at' => 'datetime',
            'subscription_approved_at' => 'datetime',
        ];
    }
}
