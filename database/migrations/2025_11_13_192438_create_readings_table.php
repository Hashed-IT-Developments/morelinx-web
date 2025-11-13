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
        Schema::create('readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_account_id')->constrained('customer_accounts');
            $table->date('bill_month');
            $table->decimal('previous_reading');
            $table->decimal('present_reading')->nullable();
            $table->decimal('kwh_consumption')->nullable();
            $table->decimal('demand_previous_reading')->nullable();
            $table->decimal('demand_present_reading')->nullable();
            $table->decimal('demand_kwh_consumption')->nullable();
            $table->decimal('solar_previous_reading')->nullable();
            $table->decimal('solar_present_reading')->nullable();
            $table->decimal('solar_kwh_generated')->nullable();
            $table->bigInteger('user_id')->nullable();
            $table->string('field_findings')->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('readings');
    }
};
