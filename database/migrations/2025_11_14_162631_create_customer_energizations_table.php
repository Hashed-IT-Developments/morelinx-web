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
        Schema::create('customer_energizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained()->nullOnDelete();
            $table->string('status')->default('pending');
            $table->foreignId('team_assigned')->nullable()->constrained('users')->nullOnDelete();
            $table->string('service_connection')->nullable();
            $table->string('action_taken')->nullable();
            $table->string('remarks')->nullable();
            $table->dateTime('time_of_arrival')->nullable();
            $table->dateTime('date_installed')->nullable();
            $table->string('transformer_owned')->nullable();
            $table->string('transformer_rating')->nullable();
            $table->string('ct_serial_number')->nullable();
            $table->string('ct_brand_name')->nullable();
            $table->string('ct_ratio')->nullable();
            $table->string('pt_serial_number')->nullable();
            $table->string('pt_brand_name')->nullable();
            $table->string('pt_ratio')->nullable();
            $table->foreignId('team_executed')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('archive')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_energizations');
    }
};
