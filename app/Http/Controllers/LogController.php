<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(){
      return inertia('miscellaneous/logs/index', [
        'logs' => Inertia::defer(function () {

          $logs  = Log::with('user')->paginate(10);
          return $logs;
        })
      ]);
    }
}
