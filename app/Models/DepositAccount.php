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
        'status',
        'current_balance',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function receivables(): HasMany
    {
        return $this->hasMany(Receivable::class, 'deposit_account_id');
    }

    public function payables(): HasMany
    {
        return $this->hasMany(Payable::class, 'deposit_account_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'deposit_account_id');
    }
}
