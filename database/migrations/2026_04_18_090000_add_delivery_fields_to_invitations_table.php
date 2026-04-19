<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->string('delivery_channel')->nullable()->after('invitation_code');
            $table->string('delivery_status')->default('not_sent')->after('delivery_channel');
            $table->string('delivery_phone')->nullable()->after('delivery_status');
            $table->string('delivery_message_id')->nullable()->after('delivery_phone');
            $table->text('delivery_error')->nullable()->after('delivery_message_id');
            $table->timestamp('delivery_last_attempt_at')->nullable()->after('delivery_error');
            $table->timestamp('delivery_sent_at')->nullable()->after('delivery_last_attempt_at');
            $table->timestamp('last_shared_at')->nullable()->after('delivery_sent_at');

            $table->index(['event_id', 'delivery_status']);
        });
    }

    public function down(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->dropIndex(['event_id', 'delivery_status']);
            $table->dropColumn([
                'delivery_channel',
                'delivery_status',
                'delivery_phone',
                'delivery_message_id',
                'delivery_error',
                'delivery_last_attempt_at',
                'delivery_sent_at',
                'last_shared_at',
            ]);
        });
    }
};