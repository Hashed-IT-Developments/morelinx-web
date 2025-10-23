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
        Schema::create('customer_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_application_id')->constrained()->onDelete('restrict');
            $table->string('account_number', 50)->unique();
            $table->string('account_name')->nullable();
            $table->foreignId('barangay_id')->constrained()->onDelete('restrict');
            $table->foreignId('district_id')->nullable()->constrained()->onDelete('restrict');
            $table->foreignId('route_id')->nullable()->constrained()->onDelete('restrict');
            $table->string('block')->nullable(); //temporary type
            $table->foreignId('customer_type_id')->constrained()->onDelete('restrict');
            $table->string('account_status')->nullable(); //temporary type
            $table->string('contact_number')->nullable();
            $table->string('email_address')->nullable();
            $table->bigInteger('customer_id')->nullable(); //temporary type
            $table->string('pole_number')->nullable(); //temporary type
            $table->string('sequence_code')->nullable(); //temporary type
            $table->string('feeder')->nullable(); //temporary type
            $table->string('compute_type')->nullable(); //temporary type
            $table->string('organization')->nullable(); //temporary type
            $table->string('org_parent_account')->nullable(); //temporary type
            $table->string('meter_loc')->nullable(); //temporary type
            $table->string('old_account_no')->nullable(); //temporary type
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('restrict');
            $table->string('group_code')->nullable(); //temporary type
            $table->string('multiplier')->nullable(); //temporary type
            $table->string('core_loss')->nullable(); //temporary type
            $table->boolean('evat_5_pct')->nullable();
            $table->boolean('evat_2_pct')->nullable();
            $table->date('connection_date')->nullable();
            $table->date('latest_reading_date')->nullable();
            $table->date('date_disconnected')->nullable();
            $table->date('date_transfered')->nullable();
            $table->string('acct_pmt_type')->nullable(); //temporary type
            $table->boolean('contestable')->nullable();
            $table->boolean('net_metered')->nullable();
            $table->string('notes')->nullable(); //temporary type
            $table->string('migrated')->nullable(); //temporary type
            $table->boolean('life-liner')->nullable();
            $table->date('life_liner_date_applied')->nullable();
            $table->date('life_liner_date_expire')->nullable();
            $table->boolean('is_sc')->nullable();
            $table->date('sc_date_applied')->nullable();
            $table->date('sc_date_expired')->nullable();
            $table->string('house_number')->nullable(); //temporary type
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_accounts');
    }
};
