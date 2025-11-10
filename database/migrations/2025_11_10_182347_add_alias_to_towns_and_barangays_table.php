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
        Schema::table('towns', function (Blueprint $table) {
            $table->string('alias', 3)->unique()->nullable()->after('name');
        });

        Schema::table('barangays', function (Blueprint $table) {
            $table->string('alias', 3)->unique()->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('towns', function (Blueprint $table) {
            $table->dropUnique(['alias']);
            $table->dropColumn('alias');
        });

        Schema::table('barangays', function (Blueprint $table) {
            $table->dropUnique(['alias']);
            $table->dropColumn('alias');
        });
    }
};
