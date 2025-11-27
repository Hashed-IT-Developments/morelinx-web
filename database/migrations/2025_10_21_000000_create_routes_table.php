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
        /**
         * This field set is temporary. To be filled in later.
         * This is only created now as this table is required
         * as a foreign relation to customer_accounts
         *
         */
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('reading_day_of_month');
            $table->foreignId('meter_reader_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('barangay_id')->constrained('barangays')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
