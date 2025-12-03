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
        Schema::create('application_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained()->onDelete('restrict');
            $table->string('du_tag')->nullable();
            $table->string('deposit_receipt')->nullable();
            $table->string('type')->nullable(); 
            $table->date('entered_date')->nullable();
            $table->string('done_at')->nullable();
            $table->string('by_personnel')->nullable();
            $table->string('by_personnel_position')->nullable();
            $table->string('id_no_1')->nullable();
            $table->string('issued_by_1')->nullable();
            $table->date('valid_until_1')->nullable();
            $table->string('building_owner')->nullable();
            $table->string('id_no_2')->nullable();
            $table->string('issued_by_2')->nullable();
            $table->date('valid_until_2')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_contracts');
    }
};
