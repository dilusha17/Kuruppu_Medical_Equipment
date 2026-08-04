<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'id'    => 1,
                'name'  => 'owner',
                'label' => 'Owner',
                'permissions' => [
                    'Dashboard',
                    'Invoice (POS)', 'Invoice History',
                    'Credit Notes', 'Credit Note History',
                    'Quotation', 'Quotation History',
                    'Customers',
                    'GRN', 'GRN History',
                    'Products', 'Stock',
                    'Suppliers',
                    'Tax Invoices',
                    'Receivables', 'Payables',
                    'Reports', 'Cash Flow',
                    'Settings',
                    'Manage Users',
                    'Roles & Permissions',
                ],
            ],
            [
                'id'    => 2,
                'name'  => 'admin',
                'label' => 'Admin',
                'permissions' => [
                    'Dashboard',
                    'Invoice (POS)', 'Invoice History',
                    'Credit Notes', 'Credit Note History',
                    'Quotation', 'Quotation History',
                    'Customers',
                    'GRN', 'GRN History',
                    'Products', 'Stock',
                    'Suppliers',
                    'Tax Invoices',
                    'Receivables', 'Payables',
                    'Reports', 'Cash Flow',
                    'Settings',
                ],
            ],
            [
                'id'    => 3,
                'name'  => 'cashier',
                'label' => 'Cashier',
                'permissions' => [
                    'Dashboard',
                    'Invoice (POS)', 'Invoice History',
                    'Credit Notes', 'Credit Note History',
                    'Quotation', 'Quotation History',
                    'Customers',
                ],
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
}
