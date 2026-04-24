<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table): void {
            $table->string('template_id')->nullable()->after('theme');
            $table->json('template_data')->nullable()->after('template_id');
            $table->json('template_customization')->nullable()->after('template_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table): void {
            $table->dropColumn(['template_id', 'template_data', 'template_customization']);
        });
    }
};
