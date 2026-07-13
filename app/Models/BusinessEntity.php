<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessEntity extends Model
{
    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'vat_no',
        'place_of_supply',
        'logo_path',
        'is_active',
        'is_vat_registered',
    ];

    protected $casts = [
        'is_active'          => 'boolean',
        'is_vat_registered'  => 'boolean',
    ];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'business_entity_id');
    }
}
