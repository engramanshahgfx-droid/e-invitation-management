<?php

namespace App\Filament\Widgets;

use App\Models\CheckIn;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PlatformStatsWidget extends BaseWidget
{
    protected static ?int $sort = 0;

    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', User::count())
                ->description(User::where('account_type', 'pro')->count() . ' Pro · ' . User::where('account_type', 'free')->count() . ' Free')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Total Events', Event::count())
                ->description(Event::where('status', 'active')->count() . ' active')
                ->descriptionIcon('heroicon-m-calendar')
                ->color('success'),

            Stat::make('Guests', Guest::count())
                ->description('Across all events')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('info'),

            Stat::make('Check-ins', CheckIn::count())
                ->description('Today: ' . CheckIn::whereDate('created_at', today())->count())
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('warning'),

            Stat::make('Invitations', Invitation::count())
                ->description('Sent invitations')
                ->descriptionIcon('heroicon-m-envelope')
                ->color('gray'),

            Stat::make('New Users Today', User::whereDate('created_at', today())->count())
                ->description('Registered today')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),
        ];
    }
}
