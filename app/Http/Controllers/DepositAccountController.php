<?php

namespace App\Http\Controllers;

use App\Models\DepositAccount;
use Illuminate\Http\Request;

class DepositAccountController extends Controller
{
    public function all()
    {
        return response()->json(DepositAccount::where('status', true)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'type'            => 'required|in:cash,bank',
            'bank_name'       => 'nullable|string|max:255',
            'account_number'  => 'nullable|string|max:50',
            'current_balance' => 'nullable|numeric',
        ]);

        if ($validated['type'] === 'cash') {
            $validated['bank_name'] = null;
            $validated['account_number'] = null;
        }

        return response()->json(DepositAccount::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $account = DepositAccount::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'type'            => 'required|in:cash,bank',
            'bank_name'       => 'nullable|string|max:255',
            'account_number'  => 'nullable|string|max:50',
            'current_balance' => 'nullable|numeric',
        ]);

        if ($validated['type'] === 'cash') {
            $validated['bank_name'] = null;
            $validated['account_number'] = null;
        }

        $account->update($validated);
        return response()->json($account);
    }

    public function delete($id)
    {
        $account = DepositAccount::findOrFail($id);
        $account->update(['status' => false]);
        return response()->json(['message' => 'Account deactivated']);
    }
}
