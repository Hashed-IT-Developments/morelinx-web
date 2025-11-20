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
        Schema::table('application_contracts', function (Blueprint $table) {
            $table->text('signature_data')->nullable()->after('building_owner');
            $table->timestamp('signed_at')->nullable()->after('signature_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('application_contracts', function (Blueprint $table) {
            $table->dropColumn('signature_data');
            $table->dropColumn('signed_at');
        });
    }
};
