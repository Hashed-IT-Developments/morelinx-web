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
        Schema::table('cust_app_insp_mats', function (Blueprint $table) {
            $table->foreignId('material_item_id')
                ->nullable()
                ->after('cust_appln_inspection_id')
                ->constrained('material_items');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cust_app_insp_mats', function (Blueprint $table) {
            $table->dropForeign(['material_item_id']);
            $table->dropColumn('material_item_id');
        });
    }
};
