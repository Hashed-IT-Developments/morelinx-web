<?php

namespace App\Http\Controllers\Tests;

use App\Enums\AcccountEnergizationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\CustApplnInspection;
use App\Models\CustomerEnergization;
use App\Models\User;
use Illuminate\Http\Request;

class MobileTestController extends Controller
{
    public function createInspection()
    {
        return inertia('mobile-tests/create-inspection-test', [
            'inspectors' => function () {
                $inspectors = User::whereHas('roles', function($query) {
                    $query->where('name', 'inspector');
                })->get();

                return $inspectors;
            }, 
            'statuses' => fn () => 
                InspectionStatusEnum::getValues(),

                'inspections' => fn() => CustApplnInspection::with('inspector', 'customerApplication.account')->get(),
        ]);
    }

    public function createEnergization()
    {
        return inertia('mobile-tests/create-energization-test', [
            'teams' => function () {
                $teams = User::whereHas('roles', function ($query) {
                    $query->where('name', 'field-team');
                })->get();

                return $teams;
            },
            'linemans' => function () {
                $linemans = User::whereHas('roles', function ($query) {
                    $query->where('name', 'lineman');
                })->get();

                return $linemans;
            },
            'statuses' => function () {
                $statuses = AcccountEnergizationStatusEnum::getValues();
                return $statuses;
            },
            'energizations' => function () {
                $energizations = CustomerEnergization::with('customerApplication', 'teamAssigned', 'teamExecuted')->get();
                return $energizations;
            }
        ]);
    }
}
