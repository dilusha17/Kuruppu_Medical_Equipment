<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vat;
use App\Models\Customers;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CustomerSeeder::class,
            VatPercentageSeeder::class,
            PaymentMethodSeeder::class,
            DepositAccountSeeder::class,
        ]);
    }
}
