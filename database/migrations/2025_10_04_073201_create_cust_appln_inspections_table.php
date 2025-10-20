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
            $table->string('status')->default('for inspection');
            $table->string('house_loc')->nullable();//latitude, longitude format
            $table->string('meter_loc')->nullable();//latitude, longitude format
            $table->date('schedule_date')->nullable();
            $table->string('sketch_loc')->nullable();
            $table->string('near_meter_serial_1')->nullable();
            $table->string('near_meter_serial_2')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('restrict');
            $table->timestamp('inspection_time')->nullable();
            $table->decimal('bill_deposit', 8,2)->nullable();
            $table->decimal('labor_cost', 8,2)->nullable();
            $table->string('feeder')->nullable();
            $table->string('meter_type')->nullable();
            $table->string('service_drop_size')->nullable();
            $table->string('protection')->nullable();
            $table->string('meter_class')->nullable();
            $table->string('connected_load')->nullable();
            $table->string('transformer_size')->nullable();
            $table->binary('signature')->nullable();
            $table->string('remarks')->nullable();
            $table->softDeletes();
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
