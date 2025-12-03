<?php

use App\Enums\RolesEnum;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('or-numbers', function ($user) {
    return $user->hasRole(RolesEnum::TREASURY_STAFF);
});
