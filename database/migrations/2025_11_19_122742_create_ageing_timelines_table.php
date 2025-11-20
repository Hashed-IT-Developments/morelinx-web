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
        Schema::create('ageing_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->unique()->constrained()->nullOnDelete();
            $table->timestamp('during_application')->nullable();
            $table->timestamp('forwarded_to_inspector')->nullable();
            $table->timestamp('inspection_date')->nullable();
            $table->timestamp('inspection_uploaded_to_system')->nullable();
            $table->timestamp('paid_to_cashier')->nullable();
            $table->timestamp('contract_signed')->nullable();
            $table->timestamp('assigned_to_lineman')->nullable();
            $table->timestamp('downloaded_to_lineman')->nullable();
            $table->timestamp('installed_date')->nullable();
            $table->timestamp('activated')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ageing_timelines');
    }
};
