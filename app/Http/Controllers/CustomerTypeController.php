<?php

namespace App\Http\Controllers;

use App\Models\CustomerType;
use Illuminate\Http\Request;

class CustomerTypeController extends Controller
{
    public function index()
    {
        //
    }

   
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

   
    public function show(CustomerType $customerType)
    {
        //
    }

   
    public function edit(CustomerType $customerType)
    {
        //
    }

   
    public function update(Request $request, CustomerType $customerType)
    {
        //
    }

    
    public function destroy(CustomerType $customerType)
    {
        //
    }

    public function getApi() {
        $data = CustomerType::orderBy('customer_type')
            ->get()->map(function($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->customer_type . " | " . $row->rate_class
                ];
            });

        return response()->json($data);
    }
}
