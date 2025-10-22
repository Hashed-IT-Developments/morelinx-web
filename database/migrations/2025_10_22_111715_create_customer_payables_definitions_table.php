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
        Schema::create('customer_payables_definitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_payable_id')->constrained()->onDelete('cascade');
            $table->string('transaction_name');
            $table->string('transaction_code');
            $table->date('billing_month');
            $table->integer('quantity');
            $table->string('unit')->nullable();
            $table->decimal('amount', 15, 2)->nullable();
            $table->decimal('total_amount', 15, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_payables_definitions');
    }
};
