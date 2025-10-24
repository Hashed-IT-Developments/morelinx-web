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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('transactionable');
            $table->string('or_number');
            $table->datetime('or_date');
            $table->decimal('total_amount', 10, 2);
            // Actual payment collected (cash/check/card)
            $table->decimal('amount_paid', 18, 2)->default(0)->after('total_amount')
                ->comment('Actual cash/check/card payment collected');
            // Credit balance applied to this transaction
            $table->decimal('credit_applied', 18, 2)->default(0)->after('amount_paid')
                ->comment('Credit balance used in this transaction');
            // Overpayment that gets added back to credit balance
            $table->decimal('change_amount', 18, 2)->default(0)->after('credit_applied')
                ->comment('Overpayment added back to credit balance');
            // Net collection (amount_paid - change_amount)
            $table->decimal('net_collection', 18, 2)->default(0)->after('change_amount')
                ->comment('Net collection: amount_paid - change_amount');
            $table->string('description')->nullable();
            $table->string('cashier')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('meter_number')->nullable();
            $table->string('meter_status')->nullable();
            $table->string('address')->nullable();
            $table->decimal('ewt', 10, 2)->default(0);
            $table->string('ewt_type')->nullable()->comment('government or commercial');
            $table->decimal('ft', 10, 2)->default(0);
            $table->decimal('quantity', 10, 2)->nullable();
            $table->string('payment_mode');
            $table->string('payment_area');
            $table->string('status')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
