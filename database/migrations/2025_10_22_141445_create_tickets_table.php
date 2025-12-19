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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_no')->unique();
            $table->string('submission_type');
            $table->string('account_number')->nullable();
            $table->foreignId('assign_by_id')->constrained('users')->onDelete('cascade');
            $table->bigInteger('resolved_by_id')->unsigned()->nullable();
            $table->bigInteger('assign_department_id')->unsigned()->nullable();
            $table->string('severity')->default('low');
            $table->string('status')->default('pending');
            $table->text('attachments')->nullable();
            $table->datetime('date_arrival')->nullable();
            $table->datetime('date_accomplished')->nullable();
            $table->datetime('date_dispatched')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
