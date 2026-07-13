<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grns', function (Blueprint $table) {
            $table->foreignId('deposit_account_id')
                  ->nullable()
                  ->after('payment_method_id')
                  ->constrained('deposit_accounts')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('grns', function (Blueprint $table) {
            $table->dropForeign(['deposit_account_id']);
            $table->dropColumn('deposit_account_id');
        });
    }
};
