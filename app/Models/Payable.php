<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payable extends Model
{
    public $timestamps = false;

    protected $table = 'payable';

    // dateTime is a DATETIME column but only ever displayed as a date; this keeps
    // every JSON response (payment history, GRN detail, cash flow) date-only.
    protected $casts = [
        'dateTime' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'grns_id',
        'amount',
        'dateTime',
        'note',
        'deposit_account_id',
    ];

    public function grn(): BelongsTo
    {
        return $this->belongsTo(Grn::class, 'grns_id');
    }

    public function depositAccount(): BelongsTo
    {
        return $this->belongsTo(DepositAccount::class, 'deposit_account_id');
    }
}
