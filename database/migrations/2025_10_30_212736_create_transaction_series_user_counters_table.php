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
        Schema::create('transaction_series_user_counters', function (Blueprint $table) {
            $table->id();
            
            // Links to the transaction series
            $table->foreignId('transaction_series_id')
                ->constrained('transaction_series')
                ->onDelete('cascade');
            
            // The cashier/user this counter belongs to
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
            
            // The starting offset for this cashier within the series
            // E.g., Cashier 1 starts at 1, Cashier 2 starts at 100, Cashier 3 starts at 200
            $table->bigInteger('start_offset');
            
            // How many ORs this cashier has generated (starts at 0)
            // Actual OR number = start_offset + current_number
            $table->bigInteger('current_number')->default(0);
            
            // The last OR number that was actually generated (for tracking)
            $table->bigInteger('last_generated_number')->nullable();
            
            // Whether this offset was auto-assigned or manually set by the cashier
            $table->boolean('is_auto_assigned')->default(false);

            $table->timestamp('offset_changed_at')->nullable();
            $table->integer('generations_at_current_offset')->default(0);
            
            $table->timestamps();
            
            // Ensure one counter per user per series
            $table->unique(['transaction_series_id', 'user_id']);
            
            // Indexes for performance
            $table->index('transaction_series_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_series_user_counters');
    }
};
