<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drop the transaction_series_user_counters table as part of stateless offset refactor.
     */
    public function up(): void
    {
        Schema::dropIfExists('transaction_series_user_counters');
    }

    /**
     * Reverse the migrations.
     * Recreate the table if needed to rollback.
     */
    public function down(): void
    {
        Schema::create('transaction_series_user_counters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_series_id')->constrained('transaction_series')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('start_offset')->comment('Starting OR number for this cashier');
            $table->integer('current_number')->default(0)->comment('Count of ORs generated');
            $table->integer('last_generated_number')->nullable()->comment('Last actual OR number generated');
            $table->integer('generations_at_current_offset')->default(0)->comment('Count since last offset change');
            $table->boolean('is_auto_assigned')->default(false)->comment('Whether offset was auto-assigned');
            $table->timestamps();
            
            // Unique constraint: one counter per user per series
            $table->unique(['transaction_series_id', 'user_id'], 'unique_user_series_counter');
            
            // Indexes
            $table->index('user_id');
            $table->index('start_offset');
        });
    }
};
