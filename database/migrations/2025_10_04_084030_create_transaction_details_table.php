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
        Schema::create('transaction_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions');
            $table->string('transaction');
            $table->decimal('amount', 10, 2);
            $table->string('unit')->nullable();
            $table->decimal('quantity', 10, 2)->nullable();
            $table->decimal('total_amount', 10, 2);
            $table->string('gl_code')->nullable();
            $table->string('transaction_code')->nullable();
            $table->string('bill_month')->nullable();
            $table->decimal('ewt', 10, 2)->default(0);
            $table->string('ewt_type')->nullable()->comment('2.5% or 5%');
            $table->decimal('ft', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_details');
    }
};
