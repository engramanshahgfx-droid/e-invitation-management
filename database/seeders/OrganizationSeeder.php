<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Organization::updateOrCreate(
            ['name' => 'Marasim'],
            [
                'whatsapp_number' => env('ORGANIZATION_WHATSAPP_NUMBER', '+966551981751'),
                'whatsapp_contact_name' => 'Marasim',
                'email' => env('MAIL_FROM_ADDRESS', 'noreply@marasim.digital'),
                'is_active' => true,
            ]
        );
    }
}
