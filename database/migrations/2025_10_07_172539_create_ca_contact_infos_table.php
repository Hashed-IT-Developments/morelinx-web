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
        Schema::create('ca_contact_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained()->onDelete('cascade');
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('relation');
            $table->string('email');
            $table->string('tel_no_1');
            $table->string('tel_no_2');
            $table->string('mobile_1');
            $table->string('mobile_2');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ca_contact_infos');
    }
};
