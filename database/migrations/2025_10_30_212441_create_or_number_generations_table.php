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
        Schema::create('or_number_generations', function (Blueprint $table) {
            $table->id();
            
            // Links to the transaction series this OR belongs to
            $table->foreignId('transaction_series_id')
                ->constrained('transaction_series')
                ->onDelete('cascade');
            
            // The formatted OR number (e.g., "CR0000000123")
            $table->string('or_number')->unique();
            
            // The actual numeric value (e.g., 123)
            $table->bigInteger('actual_number');
            
            // Who generated this OR number
            $table->foreignId('generated_by_user_id')
                ->constrained('users')
                ->onDelete('restrict');
            
            // When it was generated
            $table->timestamp('generated_at');
            
            // How it was generated: 'auto', 'manual', 'jumped'
            // - auto: First-time auto-assigned offset
            // - manual: User set their own offset
            // - jumped: Auto-jumped due to conflict
            $table->enum('generation_method', ['auto', 'manual', 'jumped']);
            
            // OR Status: 'generated', 'used', 'voided', 'cancelled', 'expired'
            // - generated: OR number assigned but not yet used in a transaction
            // - used: OR number used in a transaction
            // - voided: OR number was voided (transaction cancelled)
            // - cancelled: OR number manually cancelled/skipped
            // - expired: OR number expired (unused for too long)
            $table->enum('status', ['generated', 'used', 'voided', 'cancelled', 'expired'])
                ->default('generated');
            
            // Links to the transaction if OR is used
            $table->foreignId('transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->onDelete('set null');
            
            // When the OR was used
            $table->timestamp('used_at')->nullable();
            
            // Voiding information
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');
            $table->string('void_reason')->nullable();
            
            // Additional notes (for BIR documentation)
            $table->text('notes')->nullable();
            
            // Metadata for additional information (JSON)
            // Can store: conflict_details, jump_reason, original_counter_value, etc.
            $table->jsonb('metadata')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['transaction_series_id', 'actual_number']);
            $table->index('generated_by_user_id');
            $table->index('status');
            $table->index('generated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('or_number_generations');
    }
};
