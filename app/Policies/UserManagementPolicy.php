<?php

namespace App\Policies;

use App\Models\User;

class UserManagementPolicy
{
    /**
     * Determine if the user can assign roles to other users.
     */
    public function assignRole(User $user, User $targetUser, string $role): bool
    {
        // Administrators can assign any role
        if ($user->isAdministrator()) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can assign stores to other users.
     */
    public function assignStore(User $user, User $targetUser): bool
    {
        // Only administrators and division leaders can assign stores
        return $user->isAdministrator() || $user->isDivisionLeader();
    }

    /**
     * Determine if the user can manage other users.
     */
    public function manageUser(User $user, User $targetUser): bool
    {
        // Administrators can manage all users
        if ($user->isAdministrator()) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can view the user management interface.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdministrator() || $user->isDivisionLeader();
    }

    /**
     * Determine if the user can delete the target user.
     */
    public function delete(User $user, User $targetUser): bool
    {
        // Administrator can delete any user except themselves
        if ($user->isAdministrator()) {
            return $user->id !== $targetUser->id;
        }

        return false;
    }
}
