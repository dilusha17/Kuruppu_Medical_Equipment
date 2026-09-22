<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->decimal('paid_amount', 15, 2)->default(0)->after('amount');
            $table->decimal('balance', 15, 2)->default(0)->after('paid_amount');
        });

        // Backfill: existing expenses were treated as fully paid everywhere they were read,
        // so keep that behaviour — paid_amount = amount, balance = 0.
        DB::table('expenses')->update([
            'paid_amount' => DB::raw('amount'),
            'balance'     => 0,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['paid_amount', 'balance']);
        });
    }
};
