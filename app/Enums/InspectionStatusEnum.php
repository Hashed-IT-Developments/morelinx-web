<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static FOR_INSPECTION()
 * @method static static APPROVED()
 * @method static static DISAPPROVED()
 */
final class InspectionStatusEnum extends Enum
{
    const FOR_INSPECTION = 'for_inspection';
    const APPROVED = 'approved';
    const DISAPPROVED = 'disapproved';
}
