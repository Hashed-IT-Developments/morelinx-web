<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;


final class TicketModuleTypeEnum extends Enum
{
    const CSF       = 'csf';
    const CRM_APPLICATION       = 'crm_application';
    const CRM_ACCOUNT       = 'crm_account';
  
}
