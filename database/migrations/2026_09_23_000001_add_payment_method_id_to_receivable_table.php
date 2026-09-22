<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Receivable::$fillable and ReceivableController::batchPayment() already write
     * payment_method_id, but no migration ever added the column — every Batch
     * Settlement attempt has been failing with "Unknown column 'payment_method_id'".
     */
    public function up(): void
    {
        Schema::table('receivable', function (Blueprint $table) {
            $table->foreignId('payment_method_id')->nullable()->after('note')
                ->constrained('payment_methods')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receivable', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_method_id');
        });
    }
};
