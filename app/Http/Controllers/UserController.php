<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeRoleId(1, $request->user());

        $users = User::query()
            ->with('role:id,name')
            ->select('id', 'name', 'user_name', 'role_id', 'designation', 'mobile', 'address', 'nic', 'status', 'hiring_date')
            ->latest()
            ->get();

        return response()->json($this->transform($users));
    }

    public function store(Request $request)
    {
        $this->authorizeRoleId(1, $request->user());

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'user_name'   => 'required|string|max:255|unique:users,user_name',
            'password'    => 'required|string|min:6|confirmed',
            'mobile'      => 'required|string|max:20',
            'address'     => 'required|string',
            'designation' => 'nullable|string|max:255',
            'nic'         => 'required|string|max:50',
            'hiring_date' => 'nullable|date',
            'role'        => 'required|in:owner,admin,cashier',
            'status'      => 'required|boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role_id']  = $this->roleIdForName($validated['role']);
        unset($validated['role']);

        $user = User::create($validated);
        $user->load('role:id,name');

        return response()->json($this->transform($user), 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeRoleId(1, $request->user());

        $user = User::with('role:id,name')->findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'user_name'   => ['required', 'string', 'max:255', Rule::unique('users', 'user_name')->ignore($user->id)],
            'password'    => 'nullable|string|min:6|confirmed',
            'mobile'      => 'required|string|max:20',
            'address'     => 'required|string',
            'designation' => 'nullable|string|max:255',
            'nic'         => 'required|string|max:50',
            'hiring_date' => 'nullable|date',
            'role'        => 'required|in:owner,admin,cashier',
            'status'      => 'required|boolean',
        ]);

        if (($validated['role'] !== 'owner' || !$validated['status']) && $this->wouldRemoveLastOwner($user)) {
            return response()->json(['message' => 'Cannot change the last remaining owner\'s role or deactivate them.'], 422);
        }

        $validated['role_id'] = $this->roleIdForName($validated['role']);
        unset($validated['role']);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        $user->load('role:id,name');

        return response()->json($this->transform($user));
    }

    public function delete(Request $request, $id)
    {
        $this->authorizeRoleId(1, $request->user());

        $user = User::with('role:id,name')->findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        if ($this->wouldRemoveLastOwner($user)) {
            return response()->json(['message' => 'Cannot delete the last remaining owner.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function toggleStatus(Request $request, $id)
    {
        $this->authorizeRoleId(1, $request->user());

        $user = User::with('role:id,name')->findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 422);
        }

        if ($user->status && $this->wouldRemoveLastOwner($user)) {
            return response()->json(['message' => 'Cannot deactivate the last remaining owner.'], 422);
        }

        $user->update(['status' => $user->status ? 0 : 1]);
        $user->load('role:id,name');

        return response()->json($this->transform($user));
    }

    /**
     * Whether removing/demoting/deactivating $user would leave the business
     * with zero active owners.
     */
    private function wouldRemoveLastOwner(User $user): bool
    {
        if ($user->role?->name !== 'owner' || !$user->status) {
            return false;
        }

        $activeOwners = User::whereHas('role', fn ($q) => $q->where('name', 'owner'))
            ->where('status', 1)
            ->count();

        return $activeOwners <= 1;
    }

    private function roleIdForName(string $name): int
    {
        return Role::where('name', $name)->value('id')
            ?? abort(422, "Unknown role: {$name}");
    }

    /**
     * Flatten the role relation into a plain 'role' string on the response,
     * matching the frontend's existing string-based role contract.
     */
    private function flattenRole(User $user): User
    {
        $user->setAttribute('role', $user->role?->name);
        $user->makeHidden('role_id')->unsetRelation('role');
        return $user;
    }

    private function transform(User|\Illuminate\Support\Collection $users)
    {
        return $users instanceof User
            ? $this->flattenRole($users)
            : $users->map(fn (User $u) => $this->flattenRole($u))->values();
    }
}
