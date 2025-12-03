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
        Schema::create('ticket_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('ticket_type_id')->constrained('ticket_types')->onDelete('cascade');
            $table->foreignId('concern_type_id')->constrained('ticket_types')->onDelete('cascade');
            $table->foreignId('channel_id')->constrained('ticket_types')->onDelete('cascade');
            $table->text('concern')->nullable();
            $table->text('reason')->nullable();
            $table->text('remarks')->nullable();
            $table->bigInteger('actual_findings_id')->unsigned()->nullable();
            $table->text('action_plan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_details');
    }
};
