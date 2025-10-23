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
        Schema::create('credit_balance_definitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('credit_balance_id')->constrained('credit_balances')->onDelete('cascade');
            $table->decimal('amount', 10, 2); // Can be positive or negative
            $table->decimal('last_balance', 10, 2);
            $table->string('source')->nullable(); // e.g., 'overpayment', 'refund', 'adjustment', 'usage'
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('credit_balance_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_balance_definitions');
    }
};
