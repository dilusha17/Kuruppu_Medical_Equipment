<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DepositAccount;

class DepositAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $initialDepositAccounts = [
            [
                'id' => 1,
                'name' => 'Petty Cash',
                'type' => 'CASH',
                'bank_name' => 'Cash',
                'account_number' => 'CASH-001',
                'status' => 1,
            ],
            [
                'id' => 2,
                'name' => 'Bank Account',
                'type' => 'BANK',
                'bank_name' => 'ABC Bank',
                'account_number' => 'BANK-001',
                'status' => 1,
            ],
        ];

        foreach ($initialDepositAccounts as $account) {
            DepositAccount::create($account);
        }
    }
}
