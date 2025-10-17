<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'password_setup_email_sent_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_setup_email_sent_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if the user can receive a new password setup email (5 minute cooldown)
     */
    public function canResendPasswordSetupEmail(): bool
    {
        // If user is already verified, they can't resend
        if ($this->hasVerifiedEmail()) {
            return false;
        }

        if (!$this->password_setup_email_sent_at) {
            return true;
        }

        return $this->password_setup_email_sent_at->diffInMinutes(now()) >= 5;
    }

    /**
     * Check if the user can receive an email (password setup or reset) with 5 minute cooldown for both verified and unverified users
     */
    public function canSendEmail(): bool
    {
        if (!$this->password_setup_email_sent_at) {
            return true;
        }

        return $this->password_setup_email_sent_at->diffInMinutes(now()) >= 5;
    }

    /**
     * Get the time remaining before the user can resend password setup email
     */
    public function getPasswordSetupEmailCooldownMinutes(): int
    {
        if (!$this->password_setup_email_sent_at) {
            return 0;
        }

        $minutesPassed = $this->password_setup_email_sent_at->diffInMinutes(now());
        return max(0, 5 - $minutesPassed);
    }

    /**
     * Get the time remaining before the user can send any email (setup or reset)
     */
    public function getEmailCooldownMinutes(): int
    {
        if (!$this->password_setup_email_sent_at) {
            return 0;
        }

        $minutesPassed = $this->password_setup_email_sent_at->diffInMinutes(now());
        return max(0, 5 - $minutesPassed);
    }
}
