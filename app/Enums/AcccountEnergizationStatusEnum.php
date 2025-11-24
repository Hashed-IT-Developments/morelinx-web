<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

final class AcccountEnergizationStatusEnum extends Enum
{

    const PENDING = 'pending';
    const ASSIGNED = 'assigned';   
    const INSTALLED = 'installed';
    const COMPLETED = 'completed';

}
