<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule Aging Timeline Reports
$dailyConfig = config('reports.ageing_timeline.schedule.daily');
if ($dailyConfig['enabled']) {
    Schedule::command('report:send-ageing-timeline --frequency=daily')
        ->dailyAt($dailyConfig['time'])
        ->timezone(config('app.timezone'));
}

$weeklyConfig = config('reports.ageing_timeline.schedule.weekly');
if ($weeklyConfig['enabled']) {
    Schedule::command('report:send-ageing-timeline --frequency=weekly')
        ->weekly()
        ->days($weeklyConfig['day'])
        ->at($weeklyConfig['time'])
        ->timezone(config('app.timezone'));
}

$monthlyConfig = config('reports.ageing_timeline.schedule.monthly');
if ($monthlyConfig['enabled']) {
    Schedule::command('report:send-ageing-timeline --frequency=monthly')
        ->monthlyOn($monthlyConfig['day'], $monthlyConfig['time'])
        ->timezone(config('app.timezone'));
}
