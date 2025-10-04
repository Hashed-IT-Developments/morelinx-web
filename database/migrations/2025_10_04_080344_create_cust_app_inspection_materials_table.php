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
        Schema::create('cust_app_inspection_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_inspection_id')->constrained()->onDelete('cascade');
            $table->string('material_name');
            $table->string('unit');
            $table->float('quantity');
            $table->decimal('amount',8,2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cust_app_inspection_materials');
    }
};
