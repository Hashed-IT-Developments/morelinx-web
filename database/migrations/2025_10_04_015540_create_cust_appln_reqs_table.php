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
        Schema::create('cust_appln_reqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requirement_repo_id')->constrained()->onDelete('restrict');
            $table->foreignId('customer_application_id')->constrained()->onDelete('cascade');
            $table->string('filepath')->nullable();
            $table->timestamp('complied_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cust_appln_reqs');
    }
};
