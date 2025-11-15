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
        Schema::create('meters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained()->nullOnDelete();
            $table->string('meter_serial_number')->unique()->nullable();
            $table->string('meter_brand')->nullable();
            $table->string('seal_number')->nullable();
            $table->string('erc_seal')->nullable();
            $table->string('more_seal')->nullable();
            $table->decimal('multiplier')->nullable();
            $table->decimal('voltage')->nullable();
            $table->decimal('initial_reading')->nullable();
            $table->string('type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meters');
    }
};
