<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DepositAccount extends Model
{
    protected $fillable = [
        'name',
        'type',
        'bank_name',
        'account_number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function receivables(): HasMany
    {
        return $this->hasMany(Receivable::class, 'deposit_account_id');
    }
}
