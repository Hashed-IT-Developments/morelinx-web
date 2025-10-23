<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Philippine Banks Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the list of Philippine banks that are supported
    | for payment processing (checks, cards, and other banking transactions).
    |
    */

    'philippine_banks' => [
        'BDO' => 'Banco de Oro Universal Bank',
        'BPI' => 'Bank of the Philippine Islands',
        'METROBANK' => 'Metropolitan Bank & Trust Company',
        'LANDBANK' => 'Land Bank of the Philippines',
        'PNB' => 'Philippine National Bank',
        'DBP' => 'Development Bank of the Philippines',
        'SECURITY_BANK' => 'Security Bank Corporation',
        'CHINA_BANK' => 'China Banking Corporation',
        'RCBC' => 'Rizal Commercial Banking Corporation',
        'EASTWEST' => 'EastWest Banking Corporation',
        'UNIONBANK' => 'Union Bank of the Philippines',
        'PSB' => 'Philippine Savings Bank',
        'ROBINSONS' => 'Robinsons Bank Corporation',
        'MAYBANK' => 'Maybank Philippines Inc.',
        'CITI' => 'Citibank N.A. Philippines',
        'HSBC' => 'HSBC Philippines',
        'STANDARD_CHARTERED' => 'Standard Chartered Philippines',
        'ASIA_UNITED' => 'Asia United Bank Corporation',
    ],

    /*
    |--------------------------------------------------------------------------
    | Bank Display Format
    |--------------------------------------------------------------------------
    |
    | This determines how banks are displayed in frontend components.
    | Options: 'code_only', 'name_only', 'code_with_name'
    |
    */

    'display_format' => 'code_with_name',

    /*
    |--------------------------------------------------------------------------
    | Default Bank
    |--------------------------------------------------------------------------
    |
    | Default bank to be selected in payment forms (optional).
    |
    */

    'default_bank' => null,

    /*
    |--------------------------------------------------------------------------
    | Bank Categories
    |--------------------------------------------------------------------------
    |
    | Categorize banks for better organization in UI components.
    |
    */

    'categories' => [
        'universal' => ['BDO', 'BPI', 'METROBANK'],
        'commercial' => ['PNB', 'SECURITY_BANK', 'CHINA_BANK', 'RCBC', 'EASTWEST', 'UNIONBANK'],
        'government' => ['LANDBANK', 'DBP'],
        'thrift' => ['PSB', 'ROBINSONS'],
        'foreign' => ['MAYBANK', 'CITI', 'HSBC', 'STANDARD_CHARTERED'],
        'others' => ['ASIA_UNITED'],
    ],
];