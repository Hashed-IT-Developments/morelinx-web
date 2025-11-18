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
        Schema::create('payables_definitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payable_id')->constrained()->onDelete('cascade');
            $table->date('billing_month')->nullable();
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
        Schema::dropIfExists('payables_definitions');
    }
};
