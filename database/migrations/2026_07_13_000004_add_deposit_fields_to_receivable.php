<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('receivable', function (Blueprint $table) {
            $table->string('reference_no')->nullable()->after('note');
            $table->unsignedBigInteger('deposit_account_id')->nullable()->after('reference_no');

            $table->foreign('deposit_account_id')
                ->references('id')->on('deposit_accounts')
                ->onDelete('set null');

            $table->index('deposit_account_id');
        });
    }

    public function down(): void
    {
        Schema::table('receivable', function (Blueprint $table) {
            $table->dropForeign(['deposit_account_id']);
            $table->dropColumn(['reference_no', 'deposit_account_id']);
        });
    }
};
