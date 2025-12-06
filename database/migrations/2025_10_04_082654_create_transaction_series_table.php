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
        Schema::create('transaction_series', function (Blueprint $table) {
            $table->id();
            $table->string('series_name')->comment('Name/description of this series (e.g., "Cashier 1 Series")');
            $table->string('prefix')->nullable()->comment('Optional prefix for OR numbers (e.g., "CR", "OR")');
            $table->unsignedBigInteger('current_number')->default(0)->comment('Current counter value');
            $table->unsignedBigInteger('start_number')->default(1)->comment('Starting number for this series');
            $table->unsignedBigInteger('end_number')->nullable()->comment('Ending number for this series (BIR allocated range)');
            $table->string('format')->default('{PREFIX}{NUMBER:10}')->comment('Format template: {PREFIX}{NUMBER:10} = CR0000000001, {PREFIX}{NUMBER:12} = CR000000000001');
            $table->boolean('is_active')->default(false)->comment('Whether this series is active (only one can be active at a time)');
            $table->date('effective_from')->comment('Date when this series becomes active');
            $table->date('effective_to')->nullable()->comment('Date when this series ends (nullable for current series)');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable()->comment('Additional notes about this series');
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('is_active');
            $table->index('effective_from');
            $table->index(['effective_from', 'effective_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_series');
    }
};
