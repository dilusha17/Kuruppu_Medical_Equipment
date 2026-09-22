<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds 'excess' to credit_note_items.reason and 'deducted' to
     * credit_note_items.restock_action, so shortage can now deduct stock,
     * excess can restock, and damage keeps its Restock/Write-off choice.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE credit_note_items MODIFY reason ENUM('shortage', 'damage', 'excess') NOT NULL");
        DB::statement("ALTER TABLE credit_note_items MODIFY restock_action ENUM('restocked', 'written_off', 'deducted') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE credit_note_items MODIFY reason ENUM('shortage', 'damage') NOT NULL");
        DB::statement("ALTER TABLE credit_note_items MODIFY restock_action ENUM('restocked', 'written_off') NULL");
    }
};
