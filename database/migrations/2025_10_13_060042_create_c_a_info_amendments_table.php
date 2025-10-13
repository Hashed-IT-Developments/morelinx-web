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
        Schema::create('c_a_info_amendments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->timestamp('admitted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('nationality')->nullable();
            $table->string('gender')->nullable();
            $table->string('marital_status')->nullable();
            $table->foreignId('barangay_id')->nullable()->constrained()->onDelete('restrict');
            $table->string('landmark')->nullable();
            $table->string('sitio')->nullable();
            $table->string('unit_no')->nullable();
            $table->string('building')->nullable();
            $table->string('street')->nullable();
            $table->string('subdivision')->nullable();
            $table->string('district_id')->nullable();
            $table->string('block')->nullable();
            $table->string('route')->nullable();
            $table->string('id_type_1')->nullable();
            $table->string('id_type_2')->nullable();
            $table->string('id_number_1')->nullable();
            $table->string('id_number_2')->nullable();
            $table->string('is_sc')->nullable();
            $table->date('sc_from')->nullable();
            $table->string('sc_number')->nullable();
            $table->string('cp_last_name');
            $table->string('cp_first_name');
            $table->string('cp_middle_name')->nullable();
            $table->string('cp_relation');
            $table->string('email_address')->nullable();
            $table->string('tel_no_1')->nullable();
            $table->string('tel_no_2')->nullable();
            $table->string('mobile_1')->nullable();
            $table->string('mobile_2')->nullable();
            $table->string('sketch_lat_long')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('c_a_info_amendments');
    }
};
