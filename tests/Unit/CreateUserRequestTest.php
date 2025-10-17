<?php

namespace Tests\Unit;

use App\Http\Requests\RBAC\CreateUserRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CreateUserRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\InitRolesAndPermissions::class);
    }

    #[Test]
    public function validation_passes_with_valid_data()
    {
        $role = Role::first();
        $permission = Permission::first();

        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => [$role->id],
            'permission_ids' => [$permission->id],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    #[Test]
    public function validation_requires_name()
    {
        $data = [
            'name' => '',
            'email' => 'john@example.com',
            'role_ids' => [],
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    #[Test]
    public function validation_requires_valid_email()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'role_ids' => [],
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('email'));
    }

    #[Test]
    public function validation_requires_unique_email()
    {
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);

        $data = [
            'name' => 'John Doe',
            'email' => 'existing@example.com',
            'role_ids' => [],
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('email'));
    }

    #[Test]
    public function validation_allows_empty_role_ids()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => [],
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    #[Test]
    public function validation_allows_empty_permission_ids()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => [],
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    #[Test]
    public function validation_requires_existing_role_ids()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => [999999], // Non-existent role ID
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('role_ids.0'));
    }

    #[Test]
    public function validation_requires_existing_permission_ids()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => [],
            'permission_ids' => [999999], // Non-existent permission ID
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('permission_ids.0'));
    }

    #[Test]
    public function validation_accepts_multiple_valid_role_ids()
    {
        $roles = Role::take(2)->get();

        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => $roles->pluck('id')->toArray(),
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    #[Test]
    public function validation_accepts_multiple_valid_permission_ids()
    {
        $permissions = Permission::take(3)->get();

        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => [],
            'permission_ids' => $permissions->pluck('id')->toArray(),
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    #[Test]
    public function validation_rejects_non_integer_role_ids()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => ['invalid'],
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('role_ids.0'));
    }

    #[Test]
    public function validation_rejects_non_integer_permission_ids()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role_ids' => [],
            'permission_ids' => ['invalid'],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('permission_ids.0'));
    }

    #[Test]
    public function validation_limits_name_length()
    {
        $data = [
            'name' => str_repeat('a', 256), // Exceeds typical name length limit
            'email' => 'john@example.com',
            'role_ids' => [],
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    #[Test]
    public function validation_limits_email_length()
    {
        $longEmail = str_repeat('a', 250) . '@example.com'; // Very long email

        $data = [
            'name' => 'John Doe',
            'email' => $longEmail,
            'role_ids' => [],
            'permission_ids' => [],
        ];

        $request = new CreateUserRequest();
        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('email'));
    }
}