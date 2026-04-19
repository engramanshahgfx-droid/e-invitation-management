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
        Schema::table('users', function (Blueprint $table): void {
            $table->string('subscription_payment_method')->nullable()->after('subscription_expiry');
            $table->string('payment_receipt_path')->nullable()->after('subscription_payment_method');
            $table->string('payment_reference')->nullable()->after('payment_receipt_path');
            $table->text('payment_note')->nullable()->after('payment_reference');
            $table->timestamp('payment_submitted_at')->nullable()->after('payment_note');
            $table->timestamp('payment_reviewed_at')->nullable()->after('payment_submitted_at');
            $table->foreignId('payment_reviewed_by')->nullable()->after('payment_reviewed_at')->constrained('users')->nullOnDelete();
            $table->text('payment_review_note')->nullable()->after('payment_reviewed_by');
            $table->timestamp('subscription_approved_at')->nullable()->after('payment_review_note');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('payment_reviewed_by');
            $table->dropColumn([
                'subscription_payment_method',
                'payment_receipt_path',
                'payment_reference',
                'payment_note',
                'payment_submitted_at',
                'payment_reviewed_at',
                'payment_review_note',
                'subscription_approved_at',
            ]);
        });
    }
};
