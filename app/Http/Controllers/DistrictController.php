<?php

namespace App\Http\Controllers;

use App\Models\District;
use Illuminate\Http\Request;

class DistrictController extends Controller
{


    public function getApi() {
        $data = District::orderBy('name')
            ->get()->map(function($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->name
                ];
            });

        return response()->json($data);
    }
}
