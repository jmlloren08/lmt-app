<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'roles',
        'store',
    ];
    
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Role checker methods
    public function isAdministrator(): bool
    {
        return $this->roles === 'administrator';
    }

    public function isDivisionLeader(): bool
    {
        return $this->roles === 'division_leader';
    }

    public function isTeamLeader(): bool
    {
        return $this->roles === 'team_leader';
    }

    public function isLoanSpecialist(): bool
    {
        return $this->roles === 'loan_specialist';
    }

}
