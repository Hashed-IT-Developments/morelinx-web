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
            $table->foreignId('transaction_series_id')->nullable()->constrained('transaction_series')->nullOnDelete();
            $table->boolean('is_manual_or_number')->default(false)->comment('Whether OR number was manually entered');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['transaction_series_id']);
            $table->dropColumn(['transaction_series_id', 'is_manual_or_number']);
        });
    }
};
