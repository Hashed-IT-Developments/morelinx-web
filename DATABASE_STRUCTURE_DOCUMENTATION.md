# MoreLinx Database Structure Documentation

**Generated on**: November 7, 2025  
**Source**: Laravel Migration Files Analysis  
**Total Tables**: 50+ tables

---

## Table of Contents
1. [Core System Tables](#core-system-tables)
2. [Permission & Role Management](#permission--role-management)
3. [Geographic/Location Tables](#geographiclocation-tables)
4. [Customer Management](#customer-management)
5. [Transaction System](#transaction-system)
6. [Ticketing System](#ticketing-system)
7. [Application Contracts & Inspections](#application-contracts--inspections)
8. [Approval & Workflow System](#approval--workflow-system)
9. [Utility Management](#utility-management)
10. [Database Relationships](#database-relationships)
11. [Indexes & Performance](#indexes--performance)

---

## Core System Tables

### `users`
**Purpose**: User authentication and management  
**Columns**:
- `id` - Primary key (bigint, auto-increment)
- `name` - Full name (string)
- `email` - Email address (string, unique)
- `email_verified_at` - Email verification timestamp (timestamp, nullable)
- `password` - Encrypted password (string)
- `remember_token` - Remember me token (string, nullable)
- `created_at`, `updated_at` - Laravel timestamps
- `deleted_at` - Soft delete timestamp

**Features**: 
- Soft deletes enabled
- Email uniqueness enforced
- Integration with Laravel authentication

### `password_reset_tokens`
**Purpose**: Password reset functionality  
**Columns**:
- `email` - Primary key (string)
- `token` - Reset token (string)
- `created_at` - Token creation time

### `sessions`
**Purpose**: User session management  
**Columns**:
- `id` - Session ID (string, primary)
- `user_id` - Foreign key to users (nullable, indexed)
- `ip_address` - Client IP (string, nullable, max 45 chars)
- `user_agent` - Browser user agent (text, nullable)
- `payload` - Session data (longtext)
- `last_activity` - Last activity timestamp (integer, indexed)

### `cache` & `cache_locks`
**Purpose**: Application caching system  
**Cache Table**:
- `key` - Cache key (string, primary)
- `value` - Cached value (mediumtext)
- `expiration` - Expiration timestamp (integer)

**Cache Locks Table**:
- `key` - Lock key (string, primary)
- `owner` - Lock owner (string)
- `expiration` - Lock expiration (integer)

### `jobs`, `job_batches`, `failed_jobs`
**Purpose**: Laravel queue system  
**Jobs Table**:
- `id` - Primary key
- `queue` - Queue name (string, indexed)
- `payload` - Job data (longtext)
- `attempts` - Retry attempts (tinyint)
- `reserved_at`, `available_at`, `created_at` - Timing fields

**Job Batches Table**:
- `id` - Batch ID (string, primary)
- `name` - Batch name
- Job counting and status fields
- Batch options and timing

**Failed Jobs Table**:
- `id` - Primary key
- `uuid` - Unique identifier
- Connection, queue, payload, exception details
- `failed_at` - Failure timestamp

---

## Permission & Role Management

### `permissions`
**Purpose**: System permissions (Spatie Laravel Permission)  
**Columns**:
- `id` - Primary key (bigint)
- `name` - Permission name (string)
- `guard_name` - Guard context (string)
- `created_at`, `updated_at` - Timestamps

**Constraints**: Unique combination of name and guard_name

### `roles`
**Purpose**: User roles  
**Columns**:
- `id` - Primary key (bigint)
- `team_foreign_key` - Team reference (nullable, indexed)
- `name` - Role name (string)
- `guard_name` - Guard context (string)
- `created_at`, `updated_at` - Timestamps

**Constraints**: Unique combination considering team context

### `model_has_permissions`
**Purpose**: Direct permission assignments to models  
**Columns**:
- `permission_id` - Foreign key to permissions
- `model_type` - Polymorphic type (string)
- `model_id` - Polymorphic ID (bigint)
- `team_foreign_key` - Team context (nullable)

**Features**: Polymorphic relationship, composite primary keys

### `model_has_roles`
**Purpose**: Role assignments to models  
**Columns**:
- `role_id` - Foreign key to roles
- `model_type` - Polymorphic type
- `model_id` - Polymorphic ID
- `team_foreign_key` - Team context (nullable)

### `role_has_permissions`
**Purpose**: Permission assignments to roles  
**Columns**:
- `permission_id` - Foreign key to permissions
- `role_id` - Foreign key to roles

**Constraints**: Composite primary key, cascade deletes

---

## Geographic/Location Tables

### `districts`
**Purpose**: Administrative districts  
**Columns**:
- `id` - Primary key
- `district_no` - District number (integer, nullable)
- `name` - District name (string)
- `du_tag` - Distribution utility tag (string, nullable)
- `created_at`, `updated_at` - Timestamps

### `towns`
**Purpose**: Towns/municipalities  
**Columns**:
- `id` - Primary key
- `name` - Town name (string)
- `district` - District reference (integer, nullable)
- `feeder` - Electrical feeder (string)
- `du_tag` - Distribution utility tag (string, nullable)

### `barangays`
**Purpose**: Barangays (villages/neighborhoods)  
**Columns**:
- `id` - Primary key
- `name` - Barangay name (string)
- `town_id` - Foreign key to towns (cascade delete)

**Relationships**: Many barangays belong to one town

### `routes`
**Purpose**: Service routes (future expansion)  
**Columns**:
- `id` - Primary key
- `name` - Route name (string)
- `created_at`, `updated_at` - Timestamps

---

## Customer Management

### `customer_types`
**Purpose**: Customer classification  
**Columns**:
- `id` - Primary key
- `rate_class` - Rate classification (string)
- `customer_type` - Customer type description (string)

### `customer_applications`
**Purpose**: Customer application records  
**Columns**:
- `id` - Primary key
- `account_number` - Account number (string, max 50, default 0000)

**Personal Information**:
- `first_name`, `last_name`, `middle_name`, `suffix` - Name components
- `birth_date` - Date of birth
- `nationality`, `gender`, `marital_status` - Personal details

**Address Information**:
- `barangay_id` - Foreign key to barangays (restrict delete)
- `district_id` - Foreign key to districts (nullable, restrict delete)
- `landmark`, `sitio`, `unit_no`, `building`, `street`, `subdivision` - Address components
- `block`, `route` - Service location details

**Service Information**:
- `customer_type_id` - Foreign key to customer types
- `connected_load` - Electrical load (decimal 10,2)

**Identification**:
- `id_type_1`, `id_type_2` - ID types
- `id_number_1`, `id_number_2` - ID numbers

**Special Classifications**:
- `is_sc` - Senior citizen flag (boolean, default false)
- `sc_from`, `sc_number` - Senior citizen details
- `property_ownership` - Property ownership status (default 'owned')

**Contact Person**:
- `cp_last_name`, `cp_first_name`, `cp_middle_name` - Contact person name
- `cp_relation` - Relationship to applicant

**Contact Information**:
- `email_address`, `tel_no_1`, `tel_no_2`, `mobile_1`, `mobile_2` - Contact details

**Business Information** (for commercial customers):
- `account_name`, `trade_name` - Business names
- `c_peza_registered_activity` - PEZA registration
- `cor_number`, `tin_number` - Business registration numbers
- `cg_vat_zero_tag` - VAT classification

**System Fields**:
- `sketch_lat_long` - GPS coordinates
- `status` - Application status
- `is_isnap` - ISNAP program flag
- `created_at`, `updated_at`, `deleted_at` - System timestamps

**Features**: Soft deletes enabled

### `customer_relationships`
**Purpose**: Family/household member relationships  
**Columns**:
- `id` - Primary key
- `customer_application_id` - Foreign key (cascade delete)
- `name` - Relationship member name
- `relationship` - Relationship type

### `customer_accounts`
**Purpose**: Active customer accounts (post-approval)  
**Columns**:
- `id` - Primary key
- `customer_application_id` - Foreign key to applications (restrict delete)
- `account_number` - Unique account number (string, max 50)
- `account_name` - Account holder name

**Location References**:
- `barangay_id`, `district_id`, `route_id` - Geographic references
- `block` - Service block
- `customer_type_id` - Customer classification

**Account Management**:
- `account_status` - Current status
- `contact_number`, `email_address` - Updated contact info
- `customer_id` - Legacy customer reference
- `user_id` - Associated system user

**Technical Details**:
- `pole_number`, `sequence_code` - Infrastructure references
- `feeder`, `compute_type` - Electrical system details
- `meter_loc` - Meter location
- `multiplier`, `core_loss` - Metering parameters

**Business Logic**:
- `organization`, `org_parent_account` - Organizational accounts
- `evat_5_pct`, `evat_2_pct` - VAT classifications
- `contestable`, `net_metered` - Service type flags
- `acct_pmt_type` - Payment type

**Dates & History**:
- `connection_date`, `latest_reading_date`
- `date_disconnected`, `date_transfered`
- `life_liner_date_applied`, `life_liner_date_expire` - Lifeline subsidy
- `sc_date_applied`, `sc_date_expired` - Senior citizen discount

**Special Programs**:
- `life-liner` - Lifeline rate flag
- `is_sc` - Senior citizen flag
- `is_isnap` - ISNAP program participation

### `payables`
**Purpose**: Customer payment obligations  
**Columns**:
- `id` - Primary key
- `customer_account_id` - Foreign key to customer accounts
- `customer_payable` - Payable description
- `type` - Payable type (connection_fee, meter_deposit, monthly_bill)
- `bill_month` - Billing period (format: YYYYMM)
- `total_amount_due` - Original amount (decimal 18,2)
- `status` - Payment status (default 'unpaid')
- `amount_paid` - Amount received (decimal 18,2)
- `balance` - Remaining balance (decimal 18,2)
- `created_at`, `updated_at`, `deleted_at` - System timestamps

**Features**: Soft deletes enabled

---

## Transaction System

### `transactions`
**Purpose**: Financial transaction records  
**Columns**:
- `id` - Primary key
- `transactionable_type`, `transactionable_id` - Polymorphic relationship
- `or_number` - Official Receipt number (unique)
- `or_date` - Transaction date
- `total_amount` - Total transaction value (decimal 10,2)

**Payment Tracking**:
- `amount_paid` - Cash/check/card collected (decimal 18,2)
- `credit_applied` - Credit balance used (decimal 18,2)
- `change_amount` - Overpayment returned (decimal 18,2)
- `net_collection` - Net cash collected (decimal 18,2)

**Customer Information**:
- `account_number`, `account_name` - Customer details
- `meter_number`, `meter_status` - Meter information
- `address` - Service address

**Tax & Fees**:
- `ewt` - Expanded Withholding Tax (decimal 10,2)
- `ewt_type` - Tax rate (2.5% or 5%)
- `ft` - Franchise Tax (decimal 10,2)

**Transaction Details**:
- `description` - Transaction description
- `quantity` - Service quantity
- `user_id` - Cashier/processor
- `payment_mode` - Payment method
- `payment_area` - Payment location
- `status` - Transaction status

**Features**: Soft deletes, polymorphic relationships

### `transaction_details`
**Purpose**: Line items for transactions  
**Columns**:
- `id` - Primary key
- `transaction_id` - Foreign key to transactions
- `transaction` - Line item description
- `amount` - Unit amount (decimal 10,2)
- `unit` - Unit of measurement
- `quantity` - Quantity (decimal 10,2)
- `total_amount` - Line total (decimal 10,2)
- `gl_code` - General ledger code
- `transaction_code` - Internal transaction code
- `bill_month` - Billing period
- `ewt`, `ewt_type`, `ft` - Tax details per line

**Features**: Soft deletes

### `payment_types`
**Purpose**: Payment method details  
**Columns**:
- `id` - Primary key
- `transaction_id` - Foreign key to transactions
- `payment_type` - Method (cash, check, card, etc.)
- `amount` - Payment amount (decimal 10,2)

**Check Details**:
- `bank` - Issuing bank
- `check_number` - Check number
- `check_issue_date`, `check_expiration_date` - Check dates

**Electronic Payment**:
- `bank_transaction_number` - Electronic transaction reference

**Features**: Soft deletes

### `transaction_series`
**Purpose**: OR number generation system  
**Columns**:
- `id` - Primary key
- `series_name` - Series description
- `prefix` - OR number prefix (optional)
- `current_number` - Current counter (default 0)
- `start_number` - Series start (default 1)
- `end_number` - Series end (nullable, BIR allocated)
- `format` - Number format template
- `is_active` - Active series flag (boolean)
- `effective_from`, `effective_to` - Series validity dates
- `created_by` - Foreign key to users
- `notes` - Additional notes

**Indexes**: Performance indexes on active status and dates  
**Features**: Soft deletes

### `or_number_generations`
**Purpose**: OR number generation tracking  
*(Details to be determined from migration analysis)*

---

## Ticketing System

### `tickets`
**Purpose**: Service request/complaint tickets  
**Columns**:
- `id` - Primary key
- `ticket_no` - Ticket number
- `assign_by_id` - Foreign key to users (ticket creator)
- `executed_by_id` - Assigned technician (nullable)
- `assign_department_id` - Foreign key to roles (department)
- `severity` - Ticket priority (default 'low')
- `status` - Ticket status (default 'pending')
- `attachments` - Attachment information (text)

**Workflow Dates**:
- `date_arrival` - Customer arrival/request time
- `date_accomplished` - Completion time
- `date_dispatched` - Assignment time

### `ticket_types`
**Purpose**: Ticket categorization  
**Columns**:
- `id` - Primary key
- `name` - Type name
- `type` - Type classification

### `ticket_cust_information`
**Purpose**: Customer information for tickets  
**Columns**:
- `id` - Primary key
- `ticket_id` - Foreign key to tickets (cascade delete)
- `account_id` - Customer account reference (nullable)
- `consumer_name` - Customer name

**Location Information**:
- `landmark`, `sitio` - Location details
- `town_id` - Foreign key to towns (cascade delete)
- `barangay_id` - Foreign key to barangays (cascade delete)

### `ticket_details`
**Purpose**: Detailed ticket information  
**Columns**:
- `id` - Primary key
- `ticket_id` - Foreign key to tickets (cascade delete)
- `ticket_type_id` - Foreign key to ticket types
- `concern_type_id` - Foreign key to ticket types (concern classification)

**Problem Details**:
- `concern` - Customer concern (text)
- `reason` - Root cause (text)
- `remarks` - Additional notes (text)

**Resolution**:
- `actual_findings_id` - Findings reference (nullable)
- `action_plan` - Resolution plan (text)

### `ticket_users`
**Purpose**: Ticket user assignments  
*(Structure to be determined from migration analysis)*

### `ticket_materials`
**Purpose**: Materials used in ticket resolution  
*(Structure to be determined from migration analysis)*

---

## Application Contracts & Inspections

### `application_contracts`
**Purpose**: Contract execution records  
**Columns**:
- `id` - Primary key
- `customer_application_id` - Foreign key (restrict delete)
- `du_tag` - Distribution utility tag
- `deposit_receipt` - Receipt reference
- `type` - Contract type (New Connection, Change of Service)

**Execution Details**:
- `entered_date` - Contract date
- `done_at` - Execution location
- `by_personnel` - Executing personnel
- `by_personnel_position` - Personnel position

**Documentation**:
- `id_no_1`, `issued_by_1`, `valid_until_1` - Primary ID details
- `building_owner` - Building owner (if different)
- `id_no_2`, `issued_by_2`, `valid_until_2` - Secondary ID details

### `amendment_requests`
**Purpose**: Application amendment tracking  
**Columns**:
- `id` - Primary key
- `user_id` - Requesting user (restrict delete)
- `customer_application_id` - Target application (cascade delete)
- `approved_at` - Approval timestamp (nullable)
- `rejected_at` - Rejection timestamp (nullable)

### `amendment_request_items`
**Purpose**: Specific amendment details  
*(Structure to be determined)*

### `cust_appln_inspections`
**Purpose**: Application inspection records  
**Columns**:
- `id` - Primary key
- `customer_application_id` - Foreign key (cascade delete)
- `inspector_id` - Foreign key to users (nullable, set null on delete)
- `status` - Inspection status (default 'for inspection')

**Location Details**:
- `house_loc` - House coordinates (lat, long)
- `meter_loc` - Meter coordinates (lat, long)
- `sketch_loc` - Sketch location

**Scheduling**:
- `schedule_date` - Inspection date
- `user_id` - Scheduling user
- `inspection_time` - Actual inspection time

**Technical Findings**:
- `near_meter_serial_1`, `near_meter_serial_2` - Adjacent meters
- `feeder` - Electrical feeder
- `meter_type`, `meter_class` - Meter specifications
- `service_drop_size` - Service connection size
- `protection` - Protection equipment
- `connected_load` - Actual load
- `transformer_size` - Transformer capacity

**Financial Assessment**:
- `bill_deposit` - Billing deposit amount (decimal 8,2)
- `material_deposit` - Material deposit (decimal 8,2)
- `total_labor_costs` - Total labor (decimal 8,2)
- `labor_cost` - Labor cost breakdown (decimal 8,2)

**Documentation**:
- `signature` - Inspector signature (binary)
- `remarks` - Inspection notes

**Features**: Soft deletes

### `cust_app_insp_mats`
**Purpose**: Materials for inspection/installation  
*(Structure to be determined)*

### `ca_bill_infos`
**Purpose**: Contract billing information  
*(Structure to be determined)*

### `ca_attachments`
**Purpose**: Contract attachments  
*(Structure to be determined)*

---

## Approval & Workflow System

### `approval_flows`
**Purpose**: Approval process definitions  
**Columns**:
- `id` - Primary key
- `name` - Flow name
- `module` - Associated module
- `description` - Flow description (text)
- `department_id` - Department reference (nullable)
- `created_by` - Creator user ID

### `approval_flow_steps`
**Purpose**: Individual approval steps  
**Columns**:
- `id` - Primary key
- `approval_flow_id` - Foreign key (cascade delete)
- `order` - Step sequence (integer)
- `role_id` - Required role (nullable)
- `user_id` - Specific user (nullable)

### `approval_states`
**Purpose**: Current approval status  
**Columns**:
- `id` - Primary key
- `approvable_type`, `approvable_id` - Polymorphic reference
- `approval_flow_id` - Foreign key (cascade delete)
- `current_order` - Current step (default 0)
- `status` - Overall status (default 'pending')

### `approval_records`
**Purpose**: Approval action history  
**Columns**:
- `id` - Primary key
- `approvable_type`, `approvable_id` - Polymorphic reference
- `approval_flow_step_id` - Foreign key (cascade delete)
- `approved_by` - Foreign key to users (cascade delete)
- `status` - Action status
- `remarks` - Action comments (text)
- `approved_at` - Action timestamp

---

## Utility Management

### `credit_balances`
**Purpose**: Customer credit balance tracking  
**Columns**:
- `id` - Primary key
- `customer_account_id` - Foreign key (cascade delete, unique)
- `account_number` - Account reference (indexed)
- `credit_balance` - Current balance (decimal 10,2, default 0)

**Features**: Soft deletes, unique constraint on customer_account_id

### `credit_balance_definitions`
**Purpose**: Credit balance rules and definitions  
*(Structure to be determined)*

### `material_items`
**Purpose**: Material/inventory catalog  
*(Structure to be determined)*

### `requirement_repos`
**Purpose**: Document/requirement repository  
*(Structure to be determined)*

### `ums_rates`
**Purpose**: Utility Management System rates  
*(Structure to be determined)*

---

## System Management

### `notifications`
**Purpose**: System notifications  
**Columns**:
- `id` - Primary key
- `user_id` - Foreign key to users (cascade delete)
- `title` - Notification title
- `description` - Notification content (text)
- `link` - Action link (nullable)
- `type` - Notification type (default 'default')
- `is_read` - Read status (boolean, default false)

### `logs`
**Purpose**: System activity logging  
*(Structure to be determined)*

### `personal_access_tokens`
**Purpose**: API authentication tokens  
*(Standard Laravel Sanctum table)*

---

## Database Relationships

### Primary Relationships

1. **Geographic Hierarchy**:
   - `districts` ← `towns` ← `barangays`
   - `customer_applications.barangay_id` → `barangays.id`
   - `customer_applications.district_id` → `districts.id`

2. **Customer Lifecycle**:
   - `customer_applications` → `customer_accounts` (1:1)
   - `customer_applications` → `customer_relationships` (1:many)
   - `customer_applications` → `cust_appln_inspections` (1:1)
   - `customer_applications` → `application_contracts` (1:1)

3. **Financial Flow**:
   - `customer_accounts` → `payables` (1:many)
   - `customer_accounts` → `credit_balances` (1:1)
   - `payables` ← `transactions` (polymorphic)
   - `transactions` → `transaction_details` (1:many)
   - `transactions` → `payment_types` (1:many)

4. **Permission System**:
   - `users` ← `model_has_roles` → `roles`
   - `users` ← `model_has_permissions` → `permissions`
   - `roles` ← `role_has_permissions` → `permissions`

5. **Ticketing Workflow**:
   - `tickets` → `ticket_details` (1:1)
   - `tickets` → `ticket_cust_information` (1:1)
   - `tickets` → `ticket_users` (1:many)
   - `tickets` → `ticket_materials` (1:many)

6. **Approval System**:
   - `approval_flows` → `approval_flow_steps` (1:many)
   - Any model ← `approval_states` (polymorphic)
   - Any model ← `approval_records` (polymorphic)

### Foreign Key Constraints

- **Restrict Deletes**: Used for core business relationships to prevent accidental data loss
- **Cascade Deletes**: Used for dependent records that should be removed when parent is deleted
- **Set Null**: Used for optional references that can exist without the referenced record

---

## Indexes & Performance

### Primary Indexes
- All tables have auto-incrementing primary keys
- Foreign key columns are automatically indexed

### Custom Indexes
- `sessions.user_id` - Session lookup by user
- `sessions.last_activity` - Session cleanup
- `jobs.queue` - Queue processing
- `credit_balances.account_number` - Account lookup
- `transaction_series.is_active` - Active series lookup
- `transaction_series.effective_from` - Date-based queries

### Unique Constraints
- `users.email` - Email uniqueness
- `customer_accounts.account_number` - Account number uniqueness
- `transactions.or_number` - OR number uniqueness
- `credit_balances.customer_account_id` - One credit balance per account
- `permissions` (name, guard_name) - Permission uniqueness per guard

---

## Database Features

### Laravel Features
- **Eloquent ORM**: All tables designed for Eloquent models
- **Soft Deletes**: Enabled on critical business tables
- **Timestamps**: Automatic `created_at` and `updated_at` on most tables
- **Polymorphic Relationships**: Used for transactions and approvals
- **Migration System**: All changes tracked through Laravel migrations

### Business Logic Features
- **Multi-tenant Permissions**: Team-based permission system
- **Audit Trail**: Comprehensive logging and approval records  
- **Financial Controls**: EWT, franchise tax, credit balance management
- **Workflow Management**: Configurable approval processes
- **Geographic Organization**: Hierarchical location management

### Data Integrity
- Foreign key constraints prevent orphaned records
- Unique constraints ensure data consistency
- Soft deletes preserve audit trails
- Indexed columns optimize query performance

---

## Notes for Development

1. **Migration Order**: Tables are created in dependency order to satisfy foreign key constraints

2. **Soft Deletes**: Critical for audit trails and data recovery - never hard delete customer or financial records

3. **Decimal Precision**: Financial amounts use appropriate decimal precision (typically 18,2 for currency)

4. **Polymorphic Relationships**: Used strategically for flexible associations (transactions, approvals)

5. **Performance Considerations**: Large tables should have appropriate indexes for common query patterns

6. **Data Validation**: Laravel validation rules should complement database constraints

7. **API Considerations**: Personal access tokens table supports API authentication

8. **Queue System**: Full Laravel queue infrastructure for background processing

---

*This documentation is based on Laravel migration file analysis and may need updates as the system evolves.*
