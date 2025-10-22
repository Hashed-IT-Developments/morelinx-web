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
        Schema::create('customer_staggered_payables', function (Blueprint $table) {
            $table->id();
            $table->string('module_name');
            $table->unsignedBigInteger('module_id');
            $table->decimal('base_amount', 15, 2)->nullable();
            $table->decimal('interest_amount', 15, 2)->nullable();
            $table->date('billing_month');
            $table->decimal('amount_payable', 15, 2)->nullable();
            $table->string('status')->default('unpaid');
            $table->string('or_number')->nullable();
            $table->date('or_date');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_staggered_payables');
    }
};
