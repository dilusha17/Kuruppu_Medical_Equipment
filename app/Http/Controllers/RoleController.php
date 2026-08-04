<?php

namespace App\Http\Controllers;

use App\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        $this->authorizeRoleId(1, auth()->user());

        return response()->json(Role::all(['id', 'name', 'label', 'permissions']));
    }
}
