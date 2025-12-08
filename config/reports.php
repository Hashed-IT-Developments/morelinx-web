<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Report Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for automated report generation and
    | distribution throughout the system.
    |
    */

    'ageing_timeline' => [
        /*
        |--------------------------------------------------------------------------
        | Default Recipients
        |--------------------------------------------------------------------------
        |
        | Email addresses that will receive the aging timeline report by default.
        | These can be overridden using command options.
        |
        */
        'recipients' => [
            'admin@morelinx.com',
            // Add more default recipients here
        ],

        /*
        |--------------------------------------------------------------------------
        | Schedule Configuration
        |--------------------------------------------------------------------------
        |
        | Configure when reports should be sent automatically.
        |
        */
        'schedule' => [
            'daily' => [
                'enabled' => true,
                'time' => '08:00', // 24-hour format
            ],
            'weekly' => [
                'enabled' => false,
                'day' => 'monday',
                'time' => '08:00',
            ],
            'monthly' => [
                'enabled' => false,
                'day' => 1, // Day of the month
                'time' => '08:00',
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | Report Thresholds
        |--------------------------------------------------------------------------
        |
        | Configure thresholds for highlighting critical applications.
        |
        */
        'thresholds' => [
            'critical_days' => 90,
            'warning_days' => 30,
            'max_critical_display' => 20,
        ],
    ],

];
