<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReadingScheduleController extends Controller
{
    public function index() {
        return inertia('mrb/reading-schedule/index');
    }
}
