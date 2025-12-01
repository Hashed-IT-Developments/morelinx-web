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
        Schema::create('reading_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->nullOnDelete();
            $table->integer('reading_date');
            $table->integer('active_accounts');
            $table->integer('disconnected_accounts');
            $table->integer('total_accounts');
            $table->foreignId('meter_reader_id')->constrained('users')->nullOnDelete();
            $table->string('billing_month');
            $table->timestamps();

            $table->unique(['route_id', 'billing_month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reading_schedules');
    }
};
