<?php

namespace Tests\Feature\Controllers;

use App\Enums\PermissionsEnum;
use App\Enums\RolesEnum;
use App\Models\User;
use App\Notifications\UserPasswordSetupNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RbacControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $user;
    protected Role $adminRole;
    protected Role $userRole;
    protected Permission $permission1;
    protected Permission $permission2;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\InitRolesAndPermissions::class);

        // Create admin user with proper permissions
        $this->admin = User::factory()->create();
        $this->admin->assignRole(RolesEnum::ADMIN);
        $this->admin->givePermissionTo(PermissionsEnum::MANAGE_ROLES);

        // Create regular user for testing
        $this->user = User::factory()->create();
        $this->user->assignRole(RolesEnum::USER);

        // Get roles and permissions for testing
        $this->adminRole = Role::where('name', RolesEnum::ADMIN)->first();
        $this->userRole = Role::where('name', RolesEnum::USER)->first();
        $this->permission1 = Permission::first();
        $this->permission2 = Permission::skip(1)->first();
    }

    #[Test]
    public function admin_can_access_rbac_index_page()
    {
        $this->actingAs($this->admin)
            ->get(route('rbac.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('rbac/index')
                ->has('roles')
                ->has('permissions')
                ->has('users')
            );
    }

    #[Test]
    public function regular_user_cannot_access_rbac_index_page()
    {
        $this->actingAs($this->user)
            ->get(route('rbac.index'))
            ->assertStatus(403);
    }

    #[Test]
    public function admin_can_create_user_with_roles_and_permissions()
    {
        Notification::fake();

        $userData = [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'role_ids' => [$this->userRole->id],
            'permission_ids' => [$this->permission1->id, $this->permission2->id],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $response->assertRedirect()
            ->assertSessionHas('success', "User 'Test User' has been created successfully. A password setup email has been sent to testuser@example.com.");

        // Assert user was created
        $createdUser = User::where('email', 'testuser@example.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals('Test User', $createdUser->name);
        $this->assertNotNull($createdUser->password_setup_email_sent_at);

        // Assert roles and permissions were assigned
        $this->assertTrue($createdUser->hasRole($this->userRole->name));
        $this->assertTrue($createdUser->hasPermissionTo($this->permission1->name));
        $this->assertTrue($createdUser->hasPermissionTo($this->permission2->name));

        // Assert email notification was sent
        Notification::assertSentTo($createdUser, UserPasswordSetupNotification::class);
    }

    #[Test]
    public function admin_can_create_user_with_only_roles()
    {
        Notification::fake();

        $userData = [
            'name' => 'Role User',
            'email' => 'roleuser@example.com',
            'role_ids' => [$this->adminRole->id],
            'permission_ids' => [],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $response->assertRedirect()
            ->assertSessionHas('success');

        $createdUser = User::where('email', 'roleuser@example.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertTrue($createdUser->hasRole($this->adminRole->name));
    }

    #[Test]
    public function admin_can_create_user_with_only_permissions()
    {
        Notification::fake();

        $userData = [
            'name' => 'Permission User',
            'email' => 'permissionuser@example.com',
            'role_ids' => [],
            'permission_ids' => [$this->permission1->id],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $response->assertRedirect()
            ->assertSessionHas('success');

        $createdUser = User::where('email', 'permissionuser@example.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertTrue($createdUser->hasPermissionTo($this->permission1->name));
    }

    #[Test]
    public function user_creation_requires_valid_email()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'role_ids' => [$this->userRole->id],
            'permission_ids' => [],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $response->assertSessionHasErrors(['email']);
    }

    #[Test]
    public function user_creation_requires_unique_email()
    {
        $userData = [
            'name' => 'Test User',
            'email' => $this->user->email, // Use existing user's email
            'role_ids' => [$this->userRole->id],
            'permission_ids' => [],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $response->assertSessionHasErrors(['email']);
    }

    #[Test]
    public function user_creation_requires_name()
    {
        $userData = [
            'name' => '',
            'email' => 'test@example.com',
            'role_ids' => [$this->userRole->id],
            'permission_ids' => [],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $response->assertSessionHasErrors(['name']);
    }

    #[Test]
    public function regular_user_cannot_create_users()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role_ids' => [$this->userRole->id],
            'permission_ids' => [],
        ];

        $response = $this->actingAs($this->user)
            ->post(route('rbac.create-user'), $userData);

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_resend_password_setup_email()
    {
        Notification::fake();

        // Create a user that needs password setup
        $unverifiedUser = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(10), // Old enough to resend
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.resend-password-setup', $unverifiedUser));

        $response->assertRedirect()
            ->assertSessionHas('success', "Password setup email has been resent to {$unverifiedUser->email}.");

        // Assert email was sent
        Notification::assertSentTo($unverifiedUser, UserPasswordSetupNotification::class);

        // Assert timestamp was updated
        $unverifiedUser->refresh();
        $this->assertTrue($unverifiedUser->password_setup_email_sent_at->greaterThan(now()->subMinute()));
    }

    #[Test]
    public function resend_email_respects_cooldown_period()
    {
        Notification::fake();

        // Create a user with recent email send
        $unverifiedUser = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(2), // Within 5-minute cooldown
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.resend-password-setup', $unverifiedUser));

        $response->assertRedirect()
            ->assertSessionHas('error');

        // Assert no email was sent
        Notification::assertNotSentTo($unverifiedUser, UserPasswordSetupNotification::class);
    }

    #[Test]
    public function verified_user_receives_password_reset_email()
    {
        Notification::fake();

        // Create a verified user
        $verifiedUser = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.resend-password-setup', $verifiedUser));

        $response->assertRedirect()
            ->assertSessionHas('success', "Password reset link has been sent to {$verifiedUser->email}.");

        // Assert password reset notification was sent (Laravel's Password::sendResetLink uses notifications)
        Notification::assertSentTo($verifiedUser, \Illuminate\Auth\Notifications\ResetPassword::class);

        // Assert no UserPasswordSetupNotification was sent (this is only for unverified users)
        Notification::assertNotSentTo($verifiedUser, UserPasswordSetupNotification::class);
        
        // Assert timestamp was updated
        $verifiedUser->refresh();
        $this->assertTrue($verifiedUser->password_setup_email_sent_at->greaterThan(now()->subMinute()));
    }

    #[Test]
    public function verified_user_respects_cooldown_period()
    {
        Notification::fake();

        // Create a verified user with recent email send
        $verifiedUser = User::factory()->create([
            'email_verified_at' => now(),
            'password_setup_email_sent_at' => now()->subMinutes(2), // Within 5-minute cooldown
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('rbac.resend-password-setup', $verifiedUser));

        $response->assertRedirect()
            ->assertSessionHas('error');

        // Assert no email was sent (neither password reset nor password setup)
        Notification::assertNotSentTo($verifiedUser, \Illuminate\Auth\Notifications\ResetPassword::class);
        Notification::assertNotSentTo($verifiedUser, UserPasswordSetupNotification::class);
    }

    #[Test]
    public function regular_user_cannot_resend_password_setup_emails()
    {
        $unverifiedUser = User::factory()->unverified()->create();

        $response = $this->actingAs($this->user)
            ->post(route('rbac.resend-password-setup', $unverifiedUser));

        $response->assertStatus(403);
    }

    #[Test]
    public function user_model_correctly_calculates_cooldown_methods()
    {
        // Test user that can resend (no previous email or old email)
        $userCanResend = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => null,
        ]);
        $this->assertTrue($userCanResend->canResendPasswordSetupEmail());

        // Test user that cannot resend (recent email)
        $userCannotResend = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(2),
        ]);
        $this->assertFalse($userCannotResend->canResendPasswordSetupEmail());
        $this->assertGreaterThanOrEqual(2, $userCannotResend->getPasswordSetupEmailCooldownMinutes());
        $this->assertLessThanOrEqual(3, $userCannotResend->getPasswordSetupEmailCooldownMinutes());

        // Test user with old email can resend
        $userWithOldEmail = User::factory()->unverified()->create([
            'password_setup_email_sent_at' => now()->subMinutes(10),
        ]);
        $this->assertTrue($userWithOldEmail->canResendPasswordSetupEmail());

        // Test new canSendEmail() method for unverified users
        $this->assertTrue($userCanResend->canSendEmail());
        $this->assertFalse($userCannotResend->canSendEmail());
        $this->assertTrue($userWithOldEmail->canSendEmail());

        // Test new getEmailCooldownMinutes() method
        $this->assertEquals(0, $userCanResend->getEmailCooldownMinutes());
        $this->assertGreaterThanOrEqual(2, $userCannotResend->getEmailCooldownMinutes());
        $this->assertLessThanOrEqual(3, $userCannotResend->getEmailCooldownMinutes());
        $this->assertEquals(0, $userWithOldEmail->getEmailCooldownMinutes());

        // Test verified users with new methods
        $verifiedUserCanSend = User::factory()->create([
            'email_verified_at' => now(),
            'password_setup_email_sent_at' => null,
        ]);
        $this->assertTrue($verifiedUserCanSend->canSendEmail());
        $this->assertEquals(0, $verifiedUserCanSend->getEmailCooldownMinutes());

        $verifiedUserCannotSend = User::factory()->create([
            'email_verified_at' => now(),
            'password_setup_email_sent_at' => now()->subMinutes(3),
        ]);
        $this->assertFalse($verifiedUserCannotSend->canSendEmail());
        $this->assertGreaterThanOrEqual(1, $verifiedUserCannotSend->getEmailCooldownMinutes());
        $this->assertLessThanOrEqual(2, $verifiedUserCannotSend->getEmailCooldownMinutes());
    }

    #[Test]
    public function created_user_has_correct_initial_state()
    {
        Notification::fake();

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'role_ids' => [$this->userRole->id],
            'permission_ids' => [],
        ];

        $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $createdUser = User::where('email', 'newuser@example.com')->first();

        // Assert initial state
        $this->assertNull($createdUser->email_verified_at);
        $this->assertNotNull($createdUser->password_setup_email_sent_at);
        $this->assertNotNull($createdUser->password);
        $this->assertFalse($createdUser->hasVerifiedEmail());
    }

    #[Test]
    public function email_notification_contains_correct_data()
    {
        Notification::fake();

        $userData = [
            'name' => 'Email Test User',
            'email' => 'emailtest@example.com',
            'role_ids' => [],
            'permission_ids' => [],
        ];

        $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $createdUser = User::where('email', 'emailtest@example.com')->first();

        Notification::assertSentTo($createdUser, UserPasswordSetupNotification::class, function ($notification, $channels) use ($createdUser) {
            $mailData = $notification->toMail($createdUser);
            
            // Check that email has correct greeting
            $this->assertEquals('Welcome to ' . config('app.name') . '!', $mailData->greeting);
            
            // Check that action URL is present
            $this->assertNotEmpty($mailData->actionUrl);
            
            // Check that subject contains app name
            $this->assertStringContainsString(config('app.name'), $mailData->subject);
            
            return true;
        });
    }

    #[Test]
    public function bulk_role_and_permission_assignment_works()
    {
        Notification::fake();

        // Get multiple roles and permissions
        $roles = Role::take(2)->get();
        $permissions = Permission::take(3)->get();

        $userData = [
            'name' => 'Bulk Assignment User',
            'email' => 'bulkuser@example.com',
            'role_ids' => $roles->pluck('id')->toArray(),
            'permission_ids' => $permissions->pluck('id')->toArray(),
        ];

        $this->actingAs($this->admin)
            ->post(route('rbac.create-user'), $userData);

        $createdUser = User::where('email', 'bulkuser@example.com')->first();

        // Assert all roles were assigned
        foreach ($roles as $role) {
            $this->assertTrue($createdUser->hasRole($role->name));
        }

        // Assert all permissions were assigned
        foreach ($permissions as $permission) {
            $this->assertTrue($createdUser->hasPermissionTo($permission->name));
        }
    }

    #[Test]
    public function forgot_password_route_exists_and_accessible()
    {
        // Test that the forgot password route exists and is accessible
        $response = $this->get(route('password.request'));
        
        $response->assertStatus(200);
        
        // Verify it returns the forgot password view/component
        $response->assertInertia(fn ($page) => $page
            ->component('auth/forgot-password')
        );
    }
}