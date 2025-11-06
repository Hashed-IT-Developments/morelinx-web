<?php

namespace App\Imports;

use App\Models\UmsRate;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Exception;

class RatesSheetImport implements ToCollection, WithHeadingRow
{
    protected $billingMonth;
    protected $townId;

    public function __construct($billingMonth, $sheetName)
    {
        $this->billingMonth = $billingMonth;

        // Accept formats: "(1) Tubigon" or "1 - Tubigon"
        if (preg_match('/\((\d+)\)/', $sheetName, $matches) ||
            preg_match('/^(\d+)\s*[-]/', $sheetName, $matches)
        ) {
            $this->townId = (int) $matches[1];
        } else {
            throw new Exception("Invalid sheet name format: {$sheetName}. Expect '(1) Name' or '1 - Name'");
        }
    }

    public function collection(Collection $rows)
    {
        $duTag = config('app.du_tag');
        $data = [];

        foreach ($rows as $row) {
            if (empty($row['acct_label'])) continue;

            $data[] = [
                'town_id' => $this->townId,
                'acct_label' => $row['acct_label'],
                'generation' => $row['gen_charge'] ?? null,
                'transmission' => $row['trans_charge'] ?? null,
                'systems_loss' => $row['sys_loss_charge'] ?? null,
                'distribution' => $row['dist_charge'] ?? null,
                'dist_demand' => $row['dist_demand'] ?? null,
                'supply_charge' => $row['sup_charge'] ?? null,
                'supply_charge_mo' => $row['sup_charge_mo'] ?? null,
                'metering_charge' => $row['mtrg_charge'] ?? null,
                'ret_mtrg_charge' => $row['ret_mtrg_charge'] ?? null,
                'frsc' => $row['rfsc'] ?? null,
                'lifeline' => $row['lifeline'] ?? null,
                'senior' => $row['senior'] ?? null,
                'franchise' => $row['franchise'] ?? null,
                'rpt' => $row['rpt'] ?? null,
                'vat_gen' => $row['vat_gen'] ?? null,
                'vat_trans' => $row['vat_trans'] ?? null,
                'vat_sl' => $row['vat_sl'] ?? null,
                'vat_dsm' => $row['vat_dsm'] ?? null,
                'vat_others' => $row['vat_others'] ?? null,
                'uc_sd' => $row['uc_sd'] ?? null,
                'ucme' => $row['ucme'] ?? null,
                'ucme_redci' => $row['ucme_redci'] ?? null,
                'fit' => $row['fit'] ?? null,
                'pwr_act' => $row['power_act'] ?? null,
                'ilp_rect' => $row['ilp_rec'] ?? null,
                'trans_kw_charge' => $row['trans_kw_charge'] ?? null,
                'env_charge' => $row['env_charge'] ?? null,
                'average_rate' => $row['average_rate'] ?? null,
                'du_tag' => $duTag,
                'billing_month' => $this->billingMonth,
            ];
        }

        if (!empty($data)) {
            DB::beginTransaction();
            try {
                UmsRate::insert($data);
                DB::commit();
            } catch (Exception $e) {
                DB::rollBack();
                throw new Exception("Failed to import for town {$this->townId}: " . $e->getMessage());
            }
        }
    }
}
