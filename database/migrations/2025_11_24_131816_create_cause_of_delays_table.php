<?php

use App\Models\CustomerApplication;
use App\Models\User;
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
        Schema::create('cause_of_delays', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(CustomerApplication::class)->constrained()->cascadeOnDelete();
            $table->string('delay_source');
            $table->string('process');
            $table->text('remarks')->nullable();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cause_of_delays');
    }
};
