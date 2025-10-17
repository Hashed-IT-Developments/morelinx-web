<?php

namespace Tests\Unit;

use App\Models\User;
use App\Notifications\UserPasswordSetupNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserPasswordSetupNotificationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function notification_has_correct_channels()
    {
        $user = User::factory()->create();
        $notification = new UserPasswordSetupNotification();

        $channels = $notification->via($user);

        $this->assertEquals(['mail'], $channels);
    }

    #[Test]
    public function mail_message_has_correct_structure()
    {
        // Force root URL to avoid localhost issues in tests
        URL::forceRootUrl(config('app.url'));

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $notification = new UserPasswordSetupNotification();
        $mailMessage = $notification->toMail($user);

        // Check basic structure
        $this->assertEquals('Welcome! Set up your password - ' . config('app.name'), $mailMessage->subject);
        $this->assertEquals('Welcome to ' . config('app.name') . '!', $mailMessage->greeting);
        $this->assertEquals('Set Up Password', $mailMessage->actionText);
        $this->assertNotEmpty($mailMessage->actionUrl);

        // Check that action URL contains password reset route
        $this->assertStringContainsString('/reset-password/', $mailMessage->actionUrl);
    }

    #[Test]
    public function notification_generates_valid_password_reset_token()
    {
        $user = User::factory()->create();
        $notification = new UserPasswordSetupNotification();

        // Call toMail to trigger token generation
        $mailMessage = $notification->toMail($user);

        // Extract token from URL
        $actionUrl = $mailMessage->actionUrl;
        $urlParts = parse_url($actionUrl);
        parse_str($urlParts['query'], $queryParams);

        $this->assertArrayHasKey('email', $queryParams);
        $this->assertEquals($user->email, $queryParams['email']);

        // Check that the URL path contains a token
        $pathParts = explode('/', $urlParts['path']);
        $token = end($pathParts);
        $this->assertNotEmpty($token);
        $this->assertGreaterThan(10, strlen($token)); // Token should be reasonably long
    }

    #[Test]
    public function mail_message_contains_helpful_content()
    {
        $user = User::factory()->create(['name' => 'John Doe']);
        $notification = new UserPasswordSetupNotification();
        $mailMessage = $notification->toMail($user);

        // Check that the mail contains helpful information
        $this->assertStringContainsString('account has been created', $mailMessage->introLines[0]);
        $this->assertStringContainsString('create your password', $mailMessage->introLines[1]);
        $this->assertStringContainsString('expire in', $mailMessage->outroLines[0]);
    }

    #[Test]
    public function notification_uses_proper_domain_in_action_url()
    {
        // Set a specific URL for testing
        $testDomain = 'https://example.com';
        $originalUrl = config('app.url');
        
        config(['app.url' => $testDomain]);
        URL::forceRootUrl($testDomain);

        $user = User::factory()->create();
        $notification = new UserPasswordSetupNotification();
        $mailMessage = $notification->toMail($user);

        $this->assertStringStartsWith($testDomain, $mailMessage->actionUrl);

        // Reset URL for other tests
        config(['app.url' => $originalUrl]);
        URL::forceRootUrl($originalUrl);
    }

    #[Test]
    public function notification_handles_special_characters_in_user_name()
    {
        $user = User::factory()->create(['name' => 'José María O\'Connor']);
        $notification = new UserPasswordSetupNotification();
        $mailMessage = $notification->toMail($user);

        // The greeting doesn't contain the user name, so just check it's properly formatted
        $this->assertEquals('Welcome to ' . config('app.name') . '!', $mailMessage->greeting);
        $this->assertStringContainsString('account has been created', $mailMessage->introLines[0]);
    }

    #[Test]
    public function notification_generates_different_tokens_for_different_users()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $notification1 = new UserPasswordSetupNotification();
        $notification2 = new UserPasswordSetupNotification();

        $mailMessage1 = $notification1->toMail($user1);
        $mailMessage2 = $notification2->toMail($user2);

        $this->assertNotEquals($mailMessage1->actionUrl, $mailMessage2->actionUrl);
    }
}