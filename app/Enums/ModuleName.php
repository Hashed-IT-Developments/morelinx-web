<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static CUSTOMER_APPLICATION()
 * @method static static CUSTOMER_INSPECTION()
 */
final class ModuleName extends Enum
{
    const CUSTOMER_APPLICATION = 'customer_application';
    const FOR_INSPECTION_APPROVAL = 'for_inspection_approval';
}
