<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditNoteItem extends Model
{
    protected $fillable = [
        'credit_note_id',
        'invoice_item_id',
        'stock_batch_id',
        'quantity',
        'unit_price',
        'reason',
        'restock_action',
    ];

    public function creditNote(): BelongsTo {
        return $this->belongsTo(CreditNote::class, 'credit_note_id');
    }

    public function invoiceItem(): BelongsTo {
        return $this->belongsTo(InvoiceItems::class, 'invoice_item_id');
    }

    public function stockBatch(): BelongsTo {
        return $this->belongsTo(StockBatches::class, 'stock_batch_id');
    }
}
