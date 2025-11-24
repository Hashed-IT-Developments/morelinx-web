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
        Schema::disableForeignKeyConstraints();

        Schema::create('bill_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_account_id')->constrained('customer_accounts');
            $table->date('bill_month');
            $table->bigInteger('bill_number');
            $table->foreignId('reading_id')->constrained('readings');
            $table->foreignId('customer_type_id')->constrained('customer_types');
            $table->decimal('kwh_consumption');
            $table->string('status');
            $table->decimal('generation');
            $table->decimal('transmission');
            $table->decimal('distribution');
            $table->decimal('system_loss');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_details');
    }
};
