<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->unsignedBigInteger('deposit_account_id')->nullable()->after('user_id');
            $table->foreign('deposit_account_id')->references('id')->on('deposit_accounts')->onDelete('set null');
        });

        Schema::table('payable', function (Blueprint $table) {
            $table->unsignedBigInteger('deposit_account_id')->nullable()->after('note');
            $table->foreign('deposit_account_id')->references('id')->on('deposit_accounts')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['deposit_account_id']);
            $table->dropColumn('deposit_account_id');
        });

        Schema::table('payable', function (Blueprint $table) {
            $table->dropForeign(['deposit_account_id']);
            $table->dropColumn('deposit_account_id');
        });
    }
};
