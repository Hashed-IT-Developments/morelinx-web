<?php

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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('transactionable');
            $table->string('or_number')->unique();
            $table->foreignId('generation_id')->nullable()->constrained('or_number_generations')->onDelete('set null');
            $table->datetime('or_date');
            $table->decimal('total_amount', 10, 2);
            $table->decimal('amount_paid', 18, 2)->default(0)->after('total_amount')->comment('Actual cash/check/card payment collected');
            $table->decimal('credit_applied', 18, 2)->default(0)->after('amount_paid')->comment('Credit balance used in this transaction');
            $table->decimal('change_amount', 18, 2)->default(0)->after('credit_applied')->comment('Overpayment added back to credit balance');
            $table->decimal('net_collection', 18, 2)->default(0)->after('change_amount')->comment('Net collection: amount_paid - change_amount');
            $table->string('description')->nullable();

            $table->foreignIdFor(User::class);

            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('meter_number')->nullable();
            $table->string('meter_status')->nullable();
            $table->string('address')->nullable();
            $table->decimal('ewt', 10, 2)->default(0);
            $table->string('ewt_type')->nullable()->comment('2.5% or 5%');
            $table->decimal('ft', 10, 2)->default(0);
            $table->decimal('quantity', 10, 2)->nullable();
            $table->string('payment_mode');
            $table->string('payment_area');
            $table->string('status')->nullable();

            $table->foreignId('transaction_series_id')->nullable()->constrained('transaction_series')->nullOnDelete();
            $table->boolean('is_manual_or_number')->default(false)->comment('Whether OR number was manually entered');
          
            $table->timestamps();
            $table->softDeletes();
        });


        Schema::table('or_number_generations', function (Blueprint $table) {
            $table->foreignId('transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->onDelete('set null');
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
