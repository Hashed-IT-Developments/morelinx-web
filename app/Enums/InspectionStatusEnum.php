<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static FOR_INSPECTION()
 * @method static static FOR_INSPECTION_APPROVAL()
 * @method static static FOR_APPROVAL()
 * @method static static APPROVED()
 * @method static static DISAPPROVED()
 */
final class InspectionStatusEnum extends Enum
{
    const FOR_INSPECTION = 'for_inspection';
    const FOR_INSPECTION_APPROVAL = 'for_inspection_approval';
    const FOR_APPROVAL = 'for_approval';
    const APPROVED = 'approved';
    const DISAPPROVED = 'disapproved';
}
