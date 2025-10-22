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
        Schema::create('customer_payables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained();
            $table->string('customer_payable');
            $table->decimal('total_amount_due', 18, 2)->default(0);
            $table->string('status')->default('unpaid');
            $table->decimal('amount_paid', 18, 2)->default(0);
            $table->decimal('balance', 18, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_payables');
    }
};
