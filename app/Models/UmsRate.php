<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UmsRate extends Model
{
    use HasFactory;

    protected $table = 'ums_rates';

    public $timestamps = false;

    protected $fillable = [
        'town_id',
        'acct_label',
        'generation',
        'transmission',
        'systems_loss',
        'distribution',
        'dist_demand',
        'supply_charge',
        'supply_charge_mo',
        'metering_charge',
        'ret_mtrg_charge',
        'frsc',
        'lifeline',
        'senior',
        'franchise',
        'rpt',
        'vat_gen',
        'vat_trans',
        'vat_sl',
        'vat_dsm',
        'vat_others',
        'uc_sd',
        'ucme',
        'ucme_redci',
        'fit',
        'pwr_act',
        'ilp_rect',
        'trans_kw_charge',
        'env_charge',
        'average_rate',
        'du_tag',
        'billing_month'
    ];

    public function town() {
        return $this->belongsTo(Town::class);
    }
}
