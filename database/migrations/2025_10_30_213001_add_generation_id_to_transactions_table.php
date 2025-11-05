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
        Schema::table('transactions', function (Blueprint $table) {
            // Add foreign key to or_number_generations table
            // This links each transaction to its OR number generation record for BIR audit trail
            $table->foreignId('generation_id')
                ->nullable()
                ->after('or_number')
                ->constrained('or_number_generations')
                ->onDelete('set null');
            
            $table->index('generation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['generation_id']);
            $table->dropColumn('generation_id');
        });
    }
};
