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
            $table->string('status')->default('pending');
            $table->string('house_loc')->nullable();//latitude, longitude format
            $table->string('meter_loc')->nullable();//latitude, longitude format
            $table->decimal('bill_deposit', 8,2);
            $table->decimal('material_deposit', 8,2);
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
