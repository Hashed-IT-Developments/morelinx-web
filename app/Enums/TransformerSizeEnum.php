<?php

namespace App\Enums;

enum TransformerSizeEnum: string
{
    case FIVE = "5kva";
    case TEN = "10kva";
    case FIFTEEN = "15kva";
    case TWENTY = "20kva";
    case TWENTY_FIVE = "25kva";
    case THIRTY_SEVEN_POINT_FIVE = "37.5kva";
    case SEVENTY_FIVE = "75kva";
    case ONE_HUNDRED = "100kva";
}
