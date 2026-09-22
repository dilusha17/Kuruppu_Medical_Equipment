<?php

use App\Models\Invoice;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Data fix: re-sync invoices.status for every invoice that has at least one
     * credit note. Previously, issuing a credit note with no cash received could
     * incorrectly flip an invoice from 'unpaid' to 'partial' (the credit note was
     * being counted as money received). This recomputes status from actual
     * receivables net of credit notes for every affected invoice.
     */
    public function up(): void
    {
        Invoice::whereHas('creditNotes')->each(function (Invoice $invoice) {
            $invoice->syncPaymentStatus();
        });
    }

    public function down(): void
    {
        // Not reversible: the previous (incorrect) status is not recoverable.
    }
};
