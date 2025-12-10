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
        Schema::create('ca_bill_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained()->onDelete('cascade');

            $table->foreignId('barangay_id')->constrained()->onDelete('restrict');
            $table->string('subdivision')->nullable();
            $table->string('street')->nullable();
            $table->string('unit_no')->nullable();
            $table->string('building')->nullable();
            $table->string('landmark')->nullable();

            $table->foreignId('facility_barangay_id')->nullable()->constrained('barangays')->onDelete('restrict');
            $table->string('facility_subdivision')->nullable();
            $table->string('facility_street')->nullable();
            $table->string('facility_unit_no')->nullable();
            $table->string('facility_building')->nullable();
            $table->string('facility_landmark')->nullable();

            $table->json('delivery_mode')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ca_bill_infos');
    }
};
