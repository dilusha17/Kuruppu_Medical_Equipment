<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adds 'return' and 'cancelled' to credit_note_items.reason — both
     * auto-restock stock, like shortage.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE credit_note_items MODIFY reason ENUM('shortage', 'damage', 'excess', 'return', 'cancelled') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE credit_note_items MODIFY reason ENUM('shortage', 'damage', 'excess') NOT NULL");
    }
};
