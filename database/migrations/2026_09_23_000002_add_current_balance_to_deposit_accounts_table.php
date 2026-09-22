<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Starts every account at 0 — historical receivable/payable/expense attribution
     * to a deposit account has been inconsistent, so it's not backfilled. Each
     * account's real current balance should be entered once via Settings after this
     * ships; the app keeps it accurate automatically from that point on.
     */
    public function up(): void
    {
        Schema::table('deposit_accounts', function (Blueprint $table) {
            $table->decimal('current_balance', 15, 2)->default(0)->after('account_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deposit_accounts', function (Blueprint $table) {
            $table->dropColumn('current_balance');
        });
    }
};
