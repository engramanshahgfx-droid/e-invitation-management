<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Resources\Resource;
use Filament\Forms;
use Filament\Schemas\Schema;
use BackedEnum;
use Filament\Actions;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Users';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $form): Schema
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255),

            Forms\Components\TextInput::make('email')
                ->email()
                ->required()
                ->unique(ignoreRecord: true)
                ->maxLength(255),

            Forms\Components\TextInput::make('phone')
                ->maxLength(30),

            Forms\Components\Select::make('account_type')
                ->options([
                    'free'       => 'Free',
                    'pro'        => 'Pro',
                    'admin'      => 'Admin',
                    'superadmin' => 'Super Admin',
                ])
                ->required()
                ->default('free'),

            Forms\Components\Select::make('subscription_status')
                ->options([
                    'trial'          => 'Trial',
                    'pending_review' => 'Pending Review',
                    'active'         => 'Active',
                    'rejected'       => 'Rejected',
                    'expired'        => 'Expired',
                    'cancelled'      => 'Cancelled',
                ])
                ->nullable(),

            Forms\Components\DateTimePicker::make('subscription_expiry')
                ->nullable(),

            Forms\Components\TextInput::make('password')
                ->password()
                ->revealable()
                ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                ->dehydrated(fn ($state) => filled($state))
                ->required(fn (string $context): bool => $context === 'create')
                ->label('Password (leave blank to keep current)'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('account_type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pro'        => 'info',
                        'admin'      => 'warning',
                        'superadmin' => 'danger',
                        default      => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('subscription_status')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'active'         => 'success',
                        'trial'          => 'warning',
                        'pending_review' => 'info',
                        'rejected'       => 'danger',
                        'expired'        => 'danger',
                        'cancelled'      => 'danger',
                        default          => 'gray',
                    }),

                Tables\Columns\TextColumn::make('events_count')
                    ->counts('events')
                    ->label('Events')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('account_type')
                    ->options([
                        'free'       => 'Free',
                        'pro'        => 'Pro',
                        'admin'      => 'Admin',
                        'superadmin' => 'Super Admin',
                    ]),

                Tables\Filters\SelectFilter::make('subscription_status')
                    ->options([
                        'trial'          => 'Trial',
                        'pending_review' => 'Pending Review',
                        'active'         => 'Active',
                        'rejected'       => 'Rejected',
                        'expired'        => 'Expired',
                        'cancelled'      => 'Cancelled',
                    ]),
            ])
            ->actions([
                Actions\EditAction::make(),
                Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Actions\BulkActionGroup::make([
                    Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }
}
