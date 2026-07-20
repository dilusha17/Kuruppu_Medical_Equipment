<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_number')->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('user_id')->constrained('users');
            $table->unsignedBigInteger('business_entity_id')->nullable();
            $table->string('po_number')->nullable();
            $table->date('quotation_date');
            $table->decimal('sub_total', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('vat_percentage', 5, 2)->default(0);
            $table->decimal('grand_total', 12, 2);
            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected', 'invoiced'])->default('draft');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('business_entity_id')->references('id')->on('business_entities');
            $table->foreign('invoice_id')->references('id')->on('invoices');
        });

        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained('quotations')->cascadeOnDelete();
            $table->unsignedBigInteger('product_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
        Schema::dropIfExists('quotations');
    }
};
