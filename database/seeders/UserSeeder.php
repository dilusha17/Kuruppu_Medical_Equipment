<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create first owner account
        User::create([
            'name'        => 'Chamila Kuruppu',
            'email'       => 'info@kuruppusafety.com',
            'user_name'   => 'chamila',
            'password'    => Hash::make('kuruppu@321'),
            'mobile'      => '0711234455',
            'address'     => 'Colombo',
            'designation' => 'CEO',
            'nic'         => '123456789V',
            'role'        => 'owner',
            'status'      => 1,
        ]);
    }
}
