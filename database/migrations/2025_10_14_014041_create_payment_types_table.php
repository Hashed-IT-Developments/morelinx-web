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
        Schema::create('payment_types', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id');
            $table->string('payment_type');
            $table->decimal('amount', 10, 2);
            $table->string('bank')->nullable();
            $table->string('check_number')->nullable();
            $table->date('check_expiration_date')->nullable();
            $table->string('bank_transaction_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_types');
    }
};
