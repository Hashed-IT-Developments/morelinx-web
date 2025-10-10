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
        Schema::create('cust_appln_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained()->onDelete('cascade');
            $table->foreignId('inspector_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('status')->default('pending');
            $table->string('house_loc')->nullable();//latitude, longitude format
            $table->string('meter_loc')->nullable();//latitude, longitude format
            $table->decimal('bill_deposit', 8,2);
            $table->decimal('material_deposit', 8,2);
            $table->date('schedule_date')->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_application_inspections');
    }
};
