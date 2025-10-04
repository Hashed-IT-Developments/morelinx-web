<?php

namespace App\Enums;

enum CustomerApplicationStatus: string
{
    case IN_PROCESS                 = 'in_process';
    case FOR_CCD_APPROVAL           = 'for_ccd_approval';
    case FOR_INSPECTION             = 'for_inspection';
    case FOR_VERIFICATION           = 'for_verification';
    case FOR_COLLECTION             = 'for_collection';
    case FOR_SIGNING                = 'for_signing';
    case FOR_INSTALLATION_APPROVAL  = 'for_installation_approval';
    case ACTIVE                     = 'active';
}
