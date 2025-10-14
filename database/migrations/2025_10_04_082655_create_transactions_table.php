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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->morphs('transactionable'); // This creates transactionable_type and transactionable_id
            $table->string('or_number');
            $table->datetime('or_date');
            $table->decimal('total_amount', 10, 2);
            $table->string('description')->nullable();
            $table->string('cashier')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('meter_number')->nullable();
            $table->string('meter_status')->nullable();
            $table->string('address')->nullable();
            $table->decimal('ewt', 10, 2)->default(0);
            $table->decimal('ft', 10, 2)->default(0);
            $table->decimal('quantity', 10, 2)->nullable();
            $table->string('payment_mode');
            $table->string('payment_area');
            $table->string('status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
