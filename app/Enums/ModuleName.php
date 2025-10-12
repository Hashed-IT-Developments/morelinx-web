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
    const CUSTOMER_INSPECTION = 'inspection';
}
