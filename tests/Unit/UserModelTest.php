<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function can_resend_password_setup_email_returns_true_when_no_previous_email_sent()
    {
        $user = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => null,
        ]);

        $this->assertTrue($user->canResendPasswordSetupEmail());
    }

    #[Test]
    public function can_resend_password_setup_email_returns_false_within_cooldown_period()
    {
        $user = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(3), // Within 5-minute cooldown
        ]);

        $this->assertFalse($user->canResendPasswordSetupEmail());
    }

    #[Test]
    public function can_resend_password_setup_email_returns_true_after_cooldown_period()
    {
        $user = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(6), // After 5-minute cooldown
        ]);

        $this->assertTrue($user->canResendPasswordSetupEmail());
    }

    #[Test]
    public function get_password_setup_email_cooldown_minutes_calculates_correctly()
    {
        // Test user with 2 minutes ago (should have 3 minutes remaining)
        $user = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(2),
        ]);

        $cooldownMinutes = $user->getPasswordSetupEmailCooldownMinutes();
        $this->assertGreaterThanOrEqual(2, $cooldownMinutes);
        $this->assertLessThanOrEqual(3, $cooldownMinutes);
    }

    #[Test]
    public function get_password_setup_email_cooldown_minutes_returns_zero_when_cooldown_expired()
    {
        $user = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(10),
        ]);

        $cooldownMinutes = $user->getPasswordSetupEmailCooldownMinutes();
        $this->assertEquals(0, $cooldownMinutes);
    }

    #[Test]
    public function get_password_setup_email_cooldown_minutes_returns_zero_when_no_email_sent()
    {
        $user = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => null,
        ]);

        $cooldownMinutes = $user->getPasswordSetupEmailCooldownMinutes();
        $this->assertEquals(0, $cooldownMinutes);
    }

    #[Test]
    public function user_implements_must_verify_email_contract()
    {
        $user = User::factory()->unverified()->create();

        $this->assertFalse($user->hasVerifiedEmail());

        $user->email_verified_at = now();
        $user->save();

        $this->assertTrue($user->hasVerifiedEmail());
    }

    #[Test]
    public function password_setup_email_cooldown_edge_cases()
    {
        // Test exactly at 5-minute mark
        $userAtFiveMinutes = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(5),
        ]);
        $this->assertTrue($userAtFiveMinutes->canResendPasswordSetupEmail());

        // Test just under 5 minutes
        $userUnderFiveMinutes = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(5)->addSeconds(10),
        ]);
        $this->assertFalse($userUnderFiveMinutes->canResendPasswordSetupEmail());
    }

    #[Test]
    public function cooldown_calculation_handles_fractional_minutes()
    {
        // Test with 2.5 minutes ago
        $user = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(2)->subSeconds(30),
        ]);

        $cooldownMinutes = $user->getPasswordSetupEmailCooldownMinutes();
        $this->assertGreaterThanOrEqual(2, $cooldownMinutes);
        $this->assertLessThanOrEqual(3, $cooldownMinutes);
    }

    #[Test]
    public function verified_user_cannot_resend_password_setup_email()
    {
        $verifiedUser = User::factory()->create([
            'email_verified_at' => now(),
            'password_setup_email_sent_at' => null,
        ]);

        $this->assertFalse($verifiedUser->canResendPasswordSetupEmail());
    }
}