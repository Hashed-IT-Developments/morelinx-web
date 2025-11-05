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
            $table->string('ticket_no');
            $table->foreignId('assign_by_id')->constrained('users')->onDelete('cascade');
            $table->bigInteger('executed_by_id')->unsigned()->nullable();
            $table->foreignId('assign_department_id')->constrained('roles')->onDelete('cascade');
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
