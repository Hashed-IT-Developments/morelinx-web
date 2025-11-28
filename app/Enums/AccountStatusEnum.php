<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;


final class AccountStatusEnum extends Enum
{

    const PENDING = 'pending';

    const ACTIVE = 'active';

    const SUSPENDED = 'suspended';

    const DISCONNECTED = 'disconnected';

}
