<?php

use App\Enums\ApplicationStatusEnum;
use Illuminate\Console\Application;
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
        Schema::create('customer_applications', function (Blueprint $table) {
            $table->id();
            $table->string('account_number', 50)->default(0000);
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('nationality')->nullable();
            $table->string('gender',6)->nullable();
            $table->string('marital_status',50)->nullable();
            $table->foreignId('barangay_id')->constrained()->onDelete('restrict');
            $table->string('landmark')->nullable();
            $table->string('sitio')->nullable();
            $table->string('unit_no')->nullable();
            $table->string('building')->nullable();
            $table->string('street')->nullable();
            $table->string('subdivision')->nullable();
            $table->foreignId('district_id')->nullable()->constrained()->onDelete('restrict');
            $table->string('block')->nullable();
            $table->string('route')->nullable();
            $table->foreignId('customer_type_id')->constrained()->onDelete('restrict');
            $table->decimal('connected_load',10,2);
            $table->string('id_type_1');
            $table->string('id_type_2')->nullable();
            $table->string('id_number_1');
            $table->string('id_number_2')->nullable();
            $table->boolean('is_sc')->default(false);
            $table->date('sc_from')->nullable();
            $table->string('sc_number')->nullable();
            $table->string('property_ownership')->default('owned');
            $table->string('cp_last_name');
            $table->string('cp_first_name');
            $table->string('cp_middle_name')->nullable();
            $table->string('cp_relation');
            $table->string('email_address')->nullable();
            $table->string('tel_no_1')->nullable();
            $table->string('tel_no_2')->nullable();
            $table->string('mobile_1')->nullable();
            $table->string('mobile_2')->nullable();
            $table->string('sketch_lat_long')->nullable();
            $table->string('status');
            $table->string('account_name')->nullable();
            $table->string('trade_name')->nullable();
            $table->string('c_peza_registered_activity')->nullable();
            $table->string('cor_number')->nullable();
            $table->string('tin_number')->nullable();
            $table->boolean('cg_vat_zero_tag')->nullable();
            $table->boolean('is_isnap')->default(false);
            $table->datetime('date_installed')->nullable();
            $table->string('remarks')->nullable();
            $table->string('id_type_1')->nullable()->change();
            $table->string('id_number_1')->nullable()->change();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_applications');
    }
};
