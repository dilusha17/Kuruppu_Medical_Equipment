<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

abstract class Controller
{
    protected function authorizeRoleId(int $requiredRoleId, ?User $user = null): void
    {
        $user = $user ?? Auth::user();

        if (! $user || (int) $user->role_id !== $requiredRoleId) {
            abort(Response::HTTP_FORBIDDEN, 'You are not authorized to perform this action.');
        }
    }

    protected function authorizeAnyRole(array $allowedRoleIds, ?User $user = null): void
    {
        $user = $user ?? Auth::user();

        if (! $user || ! in_array((int) $user->role_id, $allowedRoleIds, true)) {
            abort(Response::HTTP_FORBIDDEN, 'You are not authorized to perform this action.');
        }
    }
}
