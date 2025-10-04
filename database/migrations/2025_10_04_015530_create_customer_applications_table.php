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
        Schema::create('customer_applications', function (Blueprint $table) {
            $table->id();
            $table->string('account_number', 50);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birth_date');
            $table->string('nationality');
            $table->string('gender',6);
            $table->string('marital_status',50);
            $table->foreignId('barangay_id')->constrained()->onDelete('restrict');
            $table->string('sitio')->nullable();
            $table->string('house_number')->nullable();
            $table->string('building')->nullable();
            $table->string('street')->nullable();
            $table->string('subdivision')->nullable();
            $table->integer('district'); //might be redundant. District can be found in barangay->town->district
            $table->string('block')->nullable();
            $table->string('route')->nullable();
            $table->foreignId('customer_type_id')->constrained()->onDelete('restrict');
            $table->decimal('connected_load',10,2);
            $table->string('email_address')->nullable();
            $table->string('contact_numbers')->nullable();
            $table->string('telephone_numbers')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_applications');
    }
};
