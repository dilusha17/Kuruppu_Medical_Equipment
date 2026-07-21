<?php

namespace App\Http\Controllers;

use App\Models\BusinessEntity;
use Illuminate\Http\Request;

class BusinessEntityController extends Controller
{
    public function all()
    {
        return response()->json(BusinessEntity::query()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255|unique:business_entities,name',
            'address'            => 'nullable|string',
            'phone'              => 'nullable|string|max:20',
            'email'              => 'nullable|email|max:255',
            'is_vat_registered'  => 'boolean',
            'vat_no'             => 'nullable|string|max:50',
            'place_of_supply'    => 'nullable|string|max:255',
            'logo'               => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('logos', 'public');
        }
        unset($validated['logo']);

        if (!($validated['is_vat_registered'] ?? false)) {
            $validated['vat_no'] = null;
            $validated['place_of_supply'] = null;
        }

        return response()->json(BusinessEntity::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $entity = BusinessEntity::findOrFail($id);

        $validated = $request->validate([
            'name'               => 'required|string|max:255|unique:business_entities,name,' . $id,
            'address'            => 'nullable|string',
            'phone'              => 'nullable|string|max:20',
            'email'              => 'nullable|email|max:255',
            'is_vat_registered'  => 'boolean',
            'vat_no'             => 'nullable|string|max:50',
            'place_of_supply'    => 'nullable|string|max:255',
            'logo'               => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('logos', 'public');
        }
        unset($validated['logo']);

        if (!($validated['is_vat_registered'] ?? false)) {
            $validated['vat_no'] = null;
            $validated['place_of_supply'] = null;
        }

        $entity->update($validated);
        return response()->json($entity);
    }

    public function delete($id)
    {
        $entity = BusinessEntity::findOrFail($id);
        $entity->delete();
        return response()->json(['message' => 'Business entity deleted']);
    }
}
