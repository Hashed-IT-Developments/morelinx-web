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
            $table->string('account_number', 50)->default(0000);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birth_date');
            $table->string('nationality');
            $table->string('gender',6);
            $table->string('marital_status',50);
            $table->foreignId('barangay_id')->constrained()->onDelete('restrict');
            $table->string('landmark')->nullable();
            $table->string('sitio')->nullable();
            $table->string('unit_no')->nullable();
            $table->string('building')->nullable();
            $table->string('street')->nullable();
            $table->string('subdivision')->nullable();
            $table->integer('district')->nullable(); //might be redundant. District can be found in barangay->town->district
            $table->string('block')->nullable();
            $table->string('route')->nullable();
            $table->foreignId('customer_type_id')->constrained()->onDelete('restrict');
            $table->decimal('connected_load',10,2);
            $table->string('email_address')->nullable();
            $table->string('tel_no_1')->nullable();
            $table->string('tel_no_2')->nullable();
            $table->string('mobile_1')->nullable();
            $table->string('mobile_2')->nullable();
            $table->string('id_type_1');
            $table->string('id_type_2')->nullable();
            $table->string('id_number_1');
            $table->string('id_number_2')->nullable();
            $table->boolean('is_sc')->default(0);
            $table->date('sc_from')->nullable();
            $table->string('sc_number')->nullable();
            $table->string('property_ownership')->default('owned');
            $table->string('sketch_lat_long')->nullable();
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
