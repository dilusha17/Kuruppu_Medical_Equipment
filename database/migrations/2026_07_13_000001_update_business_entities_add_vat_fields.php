<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_entities', function (Blueprint $table) {
            $table->boolean('is_vat_registered')->default(false)->after('is_active');
            $table->string('place_of_supply')->nullable()->after('vat_no');
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('business_entities', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->dropColumn(['is_vat_registered', 'place_of_supply']);
        });
    }
};
