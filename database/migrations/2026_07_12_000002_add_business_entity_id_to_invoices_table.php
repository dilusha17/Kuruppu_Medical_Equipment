<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->unsignedBigInteger('business_entity_id')->nullable()->after('id');
            $table->foreign('business_entity_id')->references('id')->on('business_entities')->onDelete('set null');
            $table->index('business_entity_id');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['business_entity_id']);
            $table->dropIndex(['business_entity_id']);
            $table->dropColumn('business_entity_id');
        });
    }
};
