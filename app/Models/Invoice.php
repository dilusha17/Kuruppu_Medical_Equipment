<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Receivable;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_number',
        'business_entity_id',
        'po_number',
        'customer_id',
        'user_id',
        'invoice_date',
        'sub_total',
        'discount',
        'vat_percentage',
        'grand_total',
        'paid_amount',
        'payment_method',
        'status',
        'is_vat_invoice_issued',
    ];

    public function items(): HasMany {
        return $this->hasMany(InvoiceItems::class, 'invoice_id');
    }

    public function customer(): BelongsTo {
        return $this->belongsTo(Customers::class, 'customer_id');
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function receivables(): HasMany {
        return $this->hasMany(Receivable::class, 'invoice_id');
    }

    public function creditNotes(): HasMany {
        return $this->hasMany(CreditNote::class, 'invoice_id');
    }

    public function businessEntity(): BelongsTo {
        return $this->belongsTo(BusinessEntity::class, 'business_entity_id');
    }

    public function paymentMethod(): BelongsTo {
        return $this->belongsTo(PaymentMethod::class, 'payment_method');
    }

    /**
     * Recompute and persist this invoice's payment status from actual cash
     * received (receivables) net of any credit notes issued against it.
     * A credit note reduces what is owed; it is never counted as cash received.
     */
    public function syncPaymentStatus(): void
    {
        $collected = $this->receivables()->sum('amount');
        $credited  = $this->creditNotes()->sum('grand_total');
        $netDue    = max(0, $this->grand_total - $credited);

        if ($collected >= $netDue) {
            $status = 'paid';
        } elseif ($collected > 0) {
            $status = 'partial';
        } else {
            $status = 'unpaid';
        }

        $this->update(['status' => $status]);
    }
}
