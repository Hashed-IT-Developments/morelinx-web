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
        Schema::create('credit_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained('customer_applications')->onDelete('cascade');
            $table->string('account_number')->nullable();
            $table->decimal('credit_balance', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique('customer_application_id');
            $table->index('account_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_balances');
    }
};
