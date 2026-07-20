<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'quotation_number',
        'customer_id',
        'user_id',
        'business_entity_id',
        'po_number',
        'quotation_date',
        'sub_total',
        'discount',
        'vat_percentage',
        'grand_total',
        'status',
        'notes',
        'invoice_id',
    ];

    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customers::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function businessEntity()
    {
        return $this->belongsTo(BusinessEntity::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
