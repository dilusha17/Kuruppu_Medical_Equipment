<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'        => 'Chamila Kuruppu',
                'email'       => 'info@kuruppusafety.com',
                'user_name'   => 'chamila',
                'password'    => Hash::make('chamila@321'),
                'mobile'      => '0711234455',
                'address'     => 'Colombo',
                'designation' => 'CEO',
                'nic'         => '123456789V',
                'role_id'     => 1,
                'status'      => 1,
            ],
            [
                'name'        => 'Pushpa Kumara',
                'email'       => 'kumara@kuruppusafety.com',
                'user_name'   => 'kumara',
                'password'    => Hash::make('kumara@321'),
                'mobile'      => '0723764811',
                'address'     => 'Colombo',
                'designation' => 'Admin',
                'nic'         => '213456789V',
                'role_id'     => 2,
                'status'      => 1,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
