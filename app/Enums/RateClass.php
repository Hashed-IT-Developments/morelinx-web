<?php

namespace App\Enums;

enum RateClass: string
{
    case RESIDENTIAL = 'residential';
    case COMMERCIAL = 'commercial';
    case GOVERNMENT = 'government';
    case STREETLIGHT = 'streetlight';
}
