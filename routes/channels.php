<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// Authorize private notification channel for users
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel for store performance updates
Broadcast::channel('store.{store}', function ($user) {
    return $user->isDivisionLeader() || $user->isTeamLeader();
});

// Channel for area management updates
Broadcast::channel('area.{area}', function ($user, $area) {
    if ($user->isTeamLeader()) {
        return $user->managedAreas()->where('area', $area)->exists();
    }
    return $user->isLoanSpecialist() && $user->managedAreas()->where('area', $area)->exists();
});