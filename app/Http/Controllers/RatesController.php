<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RatesController extends Controller
{
    public function index() {
        return inertia('cesra/allrates');
    }
    public function upload() {
        return inertia('cesra/rates-upload');
    }
    public function approvals() {
        return 'approvals.page';
    }
}
