<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ums_rates', function (Blueprint $table) {
            $table->id();
            $table->string('acct_label');
            $table->decimal('generation', 14, 6)->nullable();
            $table->decimal('transmission', 14, 6)->nullable();
            $table->decimal('systems_loss', 14, 6)->nullable();
            $table->decimal('distribution', 14, 6)->nullable();
            $table->decimal('dist_demand', 14, 6)->nullable();
            $table->decimal('supply_charge', 14, 6)->nullable();
            $table->decimal('supply_charge_mo', 14, 6)->nullable();
            $table->decimal('metering_charge', 14, 6)->nullable();
            $table->decimal('ret_mtrg_charge', 14, 6)->nullable();
            $table->decimal('frsc', 14, 6)->nullable();
            $table->decimal('lifeline', 14, 6)->nullable();
            $table->decimal('senior', 14, 6)->nullable();
            $table->decimal('franchise', 14, 6)->nullable();
            $table->decimal('rpt', 14, 6)->nullable();
            $table->decimal('vat_gen', 14, 6)->nullable();
            $table->decimal('vat_trans', 14, 6)->nullable();
            $table->decimal('vat_sl', 14, 6)->nullable();
            $table->decimal('vat_dsm', 14, 6)->nullable();
            $table->decimal('vat_others', 14, 6)->nullable();
            $table->decimal('uc_sd', 14, 6)->nullable();
            $table->decimal('ucme', 14, 6)->nullable();
            $table->decimal('ucme_redci', 14, 6)->nullable();
            $table->decimal('fit', 14, 6)->nullable();
            $table->decimal('pwr_act', 14, 6)->nullable();
            $table->decimal('ilp_rect', 14, 6)->nullable();
            $table->decimal('trans_kw_charge', 14, 6)->nullable();
            $table->decimal('env_charge', 14, 6)->nullable();
            $table->decimal('average_rate', 14, 6)->nullable();
            $table->string('du_tag');
            $table->char('billing_month', 7); // format YYYY-MM, e.g., 2025-10
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ums_rates');
    }
};
