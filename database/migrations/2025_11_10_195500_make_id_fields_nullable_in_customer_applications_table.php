<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Make ID fields nullable to support city government applications
     * where IDs are optional.
     */
    public function up(): void
    {
        Schema::table('customer_applications', function (Blueprint $table) {
            $table->string('id_type_1')->nullable()->change();
            $table->string('id_number_1')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_applications', function (Blueprint $table) {
            // Note: This might fail if there are NULL values in the database
            $table->string('id_type_1')->nullable(false)->change();
            $table->string('id_number_1')->nullable(false)->change();
        });
    }
};
