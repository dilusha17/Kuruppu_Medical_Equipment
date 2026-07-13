<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use App\Models\Vat;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SettingsController extends Controller
{
    public function all()
    {
        $settings = Settings::get();
        return response()->json($settings);
    }

    public function change_theme(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'required|in:0,1',
        ]);

        $setting = Settings::first();

        if ($setting) {
            $setting->update([
                'theme' => $validated['theme'],
            ]);
        }

        return response()->json($setting, 200);
    }

    public function update_vat_settings(Request $request)
    {
        $validated = $request->validate([
            'vat_percentage'  => 'required|numeric|min:0|max:100',
            'effective_date'  => 'required|date',
        ]);

        $effectiveDate = Carbon::parse($validated['effective_date']);

        $current = Vat::whereNull('to_date')->orderBy('from_date', 'desc')->first();
        if ($current) {
            $current->update([
                'to_date' => $effectiveDate->copy()->subDay()->toDateString(),
            ]);
        }

        $newVat = Vat::create([
            'vat_percentage' => $validated['vat_percentage'],
            'from_date'      => $effectiveDate->toDateString(),
            'to_date'        => null,
        ]);

        return response()->json($newVat, 201);
    }
}
