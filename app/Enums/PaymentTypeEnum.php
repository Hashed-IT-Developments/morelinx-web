<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static CASH()
 * @method static static CHECK()
 * @method static static BANK_TRANSFER()
 * @method static static ONLINE_BANKING()
 * @method static static CREDIT_CARD()
 * @method static static DEBIT_CARD()
 * @method static static GCASH()
 * @method static static PAYMAYA()
 * @method static static PAYPAL()
 * @method static static MONEY_ORDER()
 * @method static static BANK_DRAFT()
 * @method static static INSTALLMENT()
 */
final class PaymentTypeEnum extends Enum
{
    const CASH = 'cash';
    const CHECK = 'check';
    const BANK_TRANSFER = 'bank_transfer';
    const ONLINE_BANKING = 'online_banking';
    const CREDIT_CARD = 'credit_card';
    const DEBIT_CARD = 'debit_card';
    const GCASH = 'gcash';
    const PAYMAYA = 'paymaya';
    const PAYPAL = 'paypal';
    const MONEY_ORDER = 'money_order';
    const BANK_DRAFT = 'bank_draft';
    const INSTALLMENT = 'installment';
}