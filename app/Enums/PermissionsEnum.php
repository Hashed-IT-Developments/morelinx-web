<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static MANAGE_USERS()
 * @method static static MANAGE_ROLES()
 * @method static static MANAGE_PERMISSIONS()
 * @method static static MANAGE_PAYMENTS()
 * @method static static CREATE_CUSTOMER_APPLICATIONS()
 * @method static static REQUEST_CUSTOMER_INFO_AMENDMENTS()
 * @method static static REQUEST_CONTACT_INFO_AMENDMENTS()
 * @method static static APPROVE_CUSTOMER_INFO_AMENDMENTS()
 * @method static static APPROVE_CONTACT_INFO_AMENDMENTS()
 * @method static static APPROVE_INSPECTION()
 * @method static static DISAPPROVE_INSPECTION()
 * @method static static ASSIGN_INSPECTOR()
 * @method static static VERIFY_INSPECTION_APPROVAL()
 * @method static static VIEW_TRANSACTIONS()
 * @method static static VIEW_INSPECTIONS()
 */
final class PermissionsEnum extends Enum
{
    // General management permissions
    const MANAGE_USERS = 'manage users';
    const MANAGE_ROLES = 'manage roles';
    const MANAGE_PERMISSIONS = 'manage permissions';
    const MANAGE_PAYMENTS = 'manage payments';

    // Customer application permissions
    const CREATE_CUSTOMER_APPLICATIONS = 'create customer applications';
    const REQUEST_CUSTOMER_INFO_AMENDMENTS = 'request customer info amendments';
    const REQUEST_BILL_INFO_AMENDMENTS = 'request bill info amendments';
    const APPROVE_BILL_INFO_AMENDMENTS = 'approve bill info amendments';
    const APPROVE_CUSTOMER_INFO_AMENDMENTS = 'approve customer info amendments';

    // Inspection permissions
    const APPROVE_INSPECTION = 'approve inspection';
    const DISAPPROVE_INSPECTION = 'disapprove inspection';
    const ASSIGN_INSPECTOR = 'assign inspector';
    const VERIFY_INSPECTION_APPROVAL = 'verify inspection approval';
    const VIEW_INSPECTIONS = 'view inspections';

    // Transaction permissions
    const VIEW_TRANSACTIONS = 'view transactions';
}
