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
        Schema::create('amendment_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('amendment_request_id')->constrained()->onDelete('cascade');
            $table->string('field');
            $table->string('current_data')->nullable();
            $table->string('new_data');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('amendment_request_items');
    }
};
