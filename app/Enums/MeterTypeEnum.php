<?php

namespace App\Enums;

enum MeterTypeEnum: string
{
    case CL1 = "CL1";
    case LINE_SYNC = "Line-Sync";
    case THREE_PHASE = "3-Phase";
}
