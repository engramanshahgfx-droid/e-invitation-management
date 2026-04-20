<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed organization first
        $this->call(OrganizationSeeder::class);
        
        // Get or create the default organization
        $organization = Organization::where('name', 'Marasim')->first();
        
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'organization_id' => $organization?->id,
                'account_type' => 'admin',
                'subscription_status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'organization_id' => $organization?->id,
                'account_type' => 'superadmin',
                'subscription_status' => 'active',
            ]
        );
    }
}
