<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create approval_flows table
        Schema::create('approval_flows', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Name of the approval flow');
            $table->string('module')->comment('The module this approval flow belongs to');
            $table->text('description')->nullable()->comment('Description of the approval flow');
            $table->unsignedBigInteger('department_id')->nullable()->comment('Department associated with the approval flow');
            $table->unsignedBigInteger('created_by')->comment('User who created the approval flow');
            $table->timestamps();
        });

        // Create approval_flow_steps table
        Schema::create('approval_flow_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('approval_flow_id')->comment('Reference to the approval flow');
            $table->integer('order')->comment('Order of the step in the approval flow');
            $table->unsignedBigInteger('role_id')->nullable()->comment('Role responsible for this step');
            $table->unsignedBigInteger('user_id')->nullable()->comment('Specific user responsible for this step, if any');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('approval_flow_id')->references('id')->on('approval_flows')->onDelete('cascade');
        });

        // Create approval_states table
        Schema::create('approval_states', function (Blueprint $table) {
            $table->id();
            $table->morphs('approvable'); // e.g. Application
            $table->foreignId('approval_flow_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('current_order')->default(0);
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->timestamps();
        });

        // Create approval_records table
        Schema::create('approval_records', function (Blueprint $table) {
            $table->id();
            $table->morphs('approvable'); // e.g. Application
            $table->foreignId('approval_flow_step_id')->constrained()->onDelete('cascade');
            $table->foreignId('approved_by')->constrained('users')->onDelete('cascade');
            $table->string('status');
            $table->text('remarks')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order to handle foreign key constraints
        Schema::dropIfExists('approval_records');
        Schema::dropIfExists('approval_states');
        Schema::dropIfExists('approval_flow_steps');
        Schema::dropIfExists('approval_flows');
    }
};
