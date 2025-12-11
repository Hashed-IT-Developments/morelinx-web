# MoreLinx Database Entity Relationship Diagram (ERD)

**Generated on**: November 10, 2025  
**Database**: MoreLinx Utility Management System  
**Total Tables**: 50+ tables

---

## Table of Contents
1. [ERD Overview](#erd-overview)
2. [Geographic Hierarchy](#geographic-hierarchy)
3. [Customer Management](#customer-management)
4. [Transaction System](#transaction-system)
5. [Ticketing System](#ticketing-system)
6. [Approval & Workflow System](#approval--workflow-system)
7. [Permission & Role Management](#permission--role-management)
8. [System Tables](#system-tables)
9. [Utility & Reference Data](#utility--reference-data)
10. [Relationship Types](#relationship-types)
11. [Main Business Flows](#main-business-flows)

---

## ERD Overview

This ERD represents the MoreLinx database structure, a comprehensive utility management system that handles:
- Customer applications and account management
- Billing and payment processing
- Service ticket management
- Multi-level approval workflows
- Role-based access control
- Geographic organization

---

## Geographic Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    GEOGRAPHIC HIERARCHY                      │
└─────────────────────────────────────────────────────────────┘

                    DISTRICTS
                        │
                        │ 1:M
                        ▼
                     TOWNS
                        │
                        │ 1:M
                        ▼
                    BARANGAYS
                        │
                        │
                        ├─────────────────┐
                        │                 │
                        ▼                 ▼
            CUSTOMER_APPLICATIONS    TICKET_CUST_INFORMATION
```

### Relationships:
- **Districts (1) → Towns (M)**: One district contains many towns
- **Towns (1) → Barangays (M)**: One town contains many barangays
- **Barangays (M) ← Customer Applications**: Applications reference barangays for address
- **Barangays (M) ← Ticket Customer Information**: Tickets reference barangays for location

### Key Fields:
- **Districts**: `id`, `district_no`, `name`, `du_tag`
- **Towns**: `id`, `name`, `district` (FK), `feeder`, `du_tag`
- **Barangays**: `id`, `name`, `town_id` (FK)

---

## Customer Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER MANAGEMENT                               │
└─────────────────────────────────────────────────────────────────────────┘

    CUSTOMER_TYPES ──┐
                     │ M:1
                     ▼
        CUSTOMER_APPLICATIONS ──────┬───────────────────────────────┐
                 │                  │                               │
                 │ 1:M              │ 1:1                          │ 1:1
                 ▼                  ▼                               ▼
    CUSTOMER_RELATIONSHIPS   CUST_APPLN_INSPECTIONS    APPLICATION_CONTRACTS
                                    │                               │
                                    │ 1:M                          │ 1:M
                                    ▼                               ├─► CA_ATTACHMENTS
                          CUST_APP_INSP_MATS                        │
                                    │                               └─► CA_BILL_INFOS
                                    │ M:1
                                    ▼
                                  USERS
                               (inspector)

        CUSTOMER_APPLICATIONS ──────┬───────────────────────────────┐
                                    │ 1:M                          │ 1:1
                                    ▼                               ▼
                         AMENDMENT_REQUESTS              CUSTOMER_ACCOUNTS
                                    │                               │
                                    │ 1:M                          ├── 1:M ─► PAYABLES
                                    ▼                               │
                       AMENDMENT_REQUEST_ITEMS                      └── 1:1 ─► CREDIT_BALANCES
                                                                     │
                                                                     └── M:1 ─► ROUTES

    BARANGAYS ──┐
                │ M:1
                ├─────► CUSTOMER_APPLICATIONS
                │
    DISTRICTS ──┘
```

### Key Entities:

#### CUSTOMER_APPLICATIONS
**Purpose**: Initial customer application records  
**Key Relationships**:
- **1:1 → Customer Accounts**: Approved applications become accounts
- **1:M → Customer Relationships**: Family/household members
- **1:1 → Inspections**: Technical inspection records
- **1:1 → Application Contracts**: Contract execution
- **1:M → Amendment Requests**: Application modifications
- **M:1 → Barangays, Districts**: Geographic location
- **M:1 → Customer Types**: Customer classification

#### CUSTOMER_ACCOUNTS
**Purpose**: Active customer accounts (post-approval)  
**Key Relationships**:
- **1:M → Payables**: Payment obligations (bills, fees, deposits)
- **1:1 → Credit Balances**: Overpayment/credit tracking
- **M:1 → Routes**: Service route assignment
- **M:1 → Customer Types**: Account classification
- **M:1 → Barangays, Districts**: Service location
- **M:1 → Users**: Account manager/owner

#### PAYABLES
**Purpose**: Customer payment obligations  
**Types**: Connection fees, meter deposits, monthly bills  
**Key Relationships**:
- **M:1 → Customer Accounts**: Belongs to one account
- **Polymorphic ← Transactions**: Can be paid via transactions

---

## Transaction System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TRANSACTION SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────┘

    TRANSACTION_SERIES ──────┐
           │                 │ 1:M
           │ 1:M             ▼
           ▼          OR_NUMBER_GENERATIONS
    TRANSACTIONS                    │
    (polymorphic)                   │ 1:1
           │                        │
           ├────────────────────────┘
           │
           ├─── 1:M ───► TRANSACTION_DETAILS
           │
           ├─── 1:M ───► PAYMENT_TYPES
           │
           ├─── M:1 ───► USERS (cashier/processor)
           │
           └─── Polymorphic Links to:
                   │
                   ├──► PAYABLES
                   │
                   └──► (Other transactionable entities)

    CUSTOMER_ACCOUNTS ──► account_number reference ──► TRANSACTIONS
```

### Key Entities:

#### TRANSACTION_SERIES
**Purpose**: OR number generation and series management  
**Features**:
- Prefix/suffix support
- Number range allocation
- Active series tracking
- Effective date ranges
- BIR compliance

**Key Fields**: `series_name`, `prefix`, `current_number`, `start_number`, `end_number`, `format`, `is_active`

#### TRANSACTIONS
**Purpose**: Financial transaction records (payments, receipts)  
**Key Relationships**:
- **Polymorphic → Transactionable**: Can link to Payables, etc.
- **1:M → Transaction Details**: Line items
- **1:M → Payment Types**: Payment methods (cash, check, card)
- **M:1 → Users**: Cashier/processor
- **1:1 → OR Number Generations**: OR number tracking

**Key Fields**: `or_number`, `or_date`, `total_amount`, `amount_paid`, `credit_applied`, `change_amount`, `net_collection`

#### TRANSACTION_DETAILS
**Purpose**: Line items for transactions  
**Key Fields**: `transaction`, `amount`, `quantity`, `total_amount`, `gl_code`, `bill_month`, `ewt`, `ft`

#### PAYMENT_TYPES
**Purpose**: Payment method details  
**Supported Types**: Cash, Check, Card, Electronic  
**Key Fields**: `payment_type`, `amount`, `bank`, `check_number`, `bank_transaction_number`

---

## Ticketing System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TICKETING SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────┘

    TICKET_TYPES ──┐
                   │ M:1
                   ▼
                TICKETS ──────────┬─────────────────┬──────────────────┐
                   │              │                 │                  │
                   │ 1:1          │ 1:M             │ 1:M              │ M:1
                   ▼              ▼                 ▼                  ├─► USERS (assign_by)
           TICKET_DETAILS   TICKET_USERS   TICKET_MATERIALS           │
                   │                               │                  ├─► USERS (executed_by)
                   │ M:1                           │ M:1              │
                   ├─► TICKET_TYPES                └─► MATERIAL_ITEMS └─► ROLES (department)
                   │   (concern)
                   │
                   └─► TICKET_TYPES
                       (type)

                TICKETS
                   │ 1:1
                   ▼
        TICKET_CUST_INFORMATION ──┬─► TOWNS (M:1)
                                   │
                                   ├─► BARANGAYS (M:1)
                                   │
                                   └─► CUSTOMER_ACCOUNTS (M:1, optional)
```

### Key Entities:

#### TICKETS
**Purpose**: Service requests and complaint tracking  
**Key Relationships**:
- **1:1 → Ticket Details**: Detailed ticket information
- **1:1 → Ticket Customer Information**: Customer and location data
- **1:M → Ticket Users**: Assigned personnel
- **1:M → Ticket Materials**: Materials used in resolution
- **M:1 → Users**: Assigned by, executed by
- **M:1 → Roles**: Department assignment

**Key Fields**: `ticket_no`, `severity`, `status`, `date_arrival`, `date_accomplished`, `date_dispatched`

#### TICKET_DETAILS
**Purpose**: Detailed ticket information  
**Key Relationships**:
- **M:1 → Ticket Types**: Type classification
- **M:1 → Ticket Types**: Concern classification (separate FK)

**Key Fields**: `concern`, `reason`, `remarks`, `action_plan`, `actual_findings_id`

#### TICKET_CUST_INFORMATION
**Purpose**: Customer information for tickets  
**Key Relationships**:
- **M:1 → Customer Accounts**: Optional account link
- **M:1 → Towns**: Location reference
- **M:1 → Barangays**: Location reference

**Key Fields**: `consumer_name`, `landmark`, `sitio`

---

## Approval & Workflow System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    APPROVAL & WORKFLOW SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────┘

    APPROVAL_FLOWS ────────┬─────────────────────────────┐
           │               │                             │
           │ 1:M           │ M:1                        │ M:1
           ▼               ▼                             ▼
    APPROVAL_FLOW_STEPS ──┼─► ROLES                  USERS
           │               │                        (created_by)
           │               └─► USERS
           │                   (specific approver)
           │
           ├─── Used by ───► APPROVAL_STATES (polymorphic)
           │                        │
           │                        └─► Attaches to:
           │                              ├─► CUSTOMER_APPLICATIONS
           │                              ├─► APPLICATION_INSPECTION
           │                              └─► (Any approvable entity)
           │
           └─── Referenced by ───► APPROVAL_RECORDS (polymorphic)
                                          │
                                          ├─► M:1 ─► USERS (approved_by)
                                          │
                                          └─► Attaches to same entities as APPROVAL_STATES
```

### Key Entities:

#### APPROVAL_FLOWS
**Purpose**: Define approval process templates  
**Key Relationships**:
- **1:M → Approval Flow Steps**: Sequential approval steps
- **M:1 → Users**: Flow creator
- **M:1 → Roles**: Department (optional)

**Key Fields**: `name`, `module`, `description`, `department_id`, `created_by`

#### APPROVAL_FLOW_STEPS
**Purpose**: Individual steps in approval flow  
**Key Relationships**:
- **M:1 → Approval Flows**: Belongs to flow
- **M:1 → Roles**: Required role for approval (optional)
- **M:1 → Users**: Specific approver (optional)

**Key Fields**: `order`, `role_id`, `user_id`

#### APPROVAL_STATES
**Purpose**: Current approval status for entities  
**Polymorphic Relationship**: Can attach to any approvable entity  
**Key Fields**: `approvable_type`, `approvable_id`, `current_order`, `status`

#### APPROVAL_RECORDS
**Purpose**: Audit trail of approval actions  
**Polymorphic Relationship**: Records actions on approvable entities  
**Key Relationships**:
- **M:1 → Approval Flow Steps**: Step that was approved/rejected
- **M:1 → Users**: User who performed action

**Key Fields**: `status`, `remarks`, `approved_at`

---

## Permission & Role Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  PERMISSION & ROLE MANAGEMENT                            │
│                    (Spatie Laravel Permission)                           │
└─────────────────────────────────────────────────────────────────────────┘

    PERMISSIONS ────────────────────────────────────┐
         │                                          │
         │ M:M                                      │ M:M
         ▼                                          ▼
    ROLE_HAS_PERMISSIONS ◄───────────────── MODEL_HAS_PERMISSIONS
         │                                          │
         │ M:M                                      │ Polymorphic
         ▼                                          ▼
      ROLES ──────────────────────────────► MODEL_HAS_ROLES
         │                                          │
         │ M:M                                      │ Polymorphic
         │                                          ▼
         │                                   ┌─────────────┐
         │                                   │    USERS    │
         └───────────────────────────────────┤  (and other │
                                            │   models)   │
                                            └─────────────┘

    ROLES ──► M:1 ──► TICKETS (assign_department_id)
```

### Key Entities:

#### PERMISSIONS
**Purpose**: System permissions/capabilities  
**Key Fields**: `name`, `guard_name`  
**Constraints**: Unique per guard

#### ROLES
**Purpose**: User roles grouping permissions  
**Key Fields**: `name`, `guard_name`, `team_foreign_key`  
**Features**: Team-based multi-tenancy support

#### MODEL_HAS_PERMISSIONS
**Purpose**: Direct permission assignments to models  
**Polymorphic**: Can assign permissions directly to Users or other models

#### MODEL_HAS_ROLES
**Purpose**: Role assignments to models  
**Polymorphic**: Can assign roles to Users or other models

#### ROLE_HAS_PERMISSIONS
**Purpose**: Permissions assigned to roles  
**Many-to-Many**: Links Roles and Permissions

---

## System Tables

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM TABLES                                   │
└─────────────────────────────────────────────────────────────────────────┘

    USERS ──────────────┬─── 1:M ───► SESSIONS
         │              │
         │              ├─── 1:M ───► PERSONAL_ACCESS_TOKENS
         │              │
         │              ├─── 1:M ───► NOTIFICATIONS
         │              │
         │              ├─── 1:M ───► LOGS
         │              │
         │              ├─── 1:1 ───► PASSWORD_RESET_TOKENS
         │              │
         │              ├─── Referenced by many entities:
         │              │      ├─► TRANSACTIONS (cashier)
         │              │      ├─► TICKETS (assign_by, executed_by)
         │              │      ├─► CUST_APPLN_INSPECTIONS (inspector)
         │              │      ├─► APPROVAL_FLOWS (created_by)
         │              │      ├─► APPROVAL_RECORDS (approved_by)
         │              │      ├─► CUSTOMER_ACCOUNTS (user_id)
         │              │      └─► TRANSACTION_SERIES (created_by)
         │              │
         │              └─── Polymorphic connections:
         │                     ├─► MODEL_HAS_ROLES
         │                     └─► MODEL_HAS_PERMISSIONS


    ┌─────────────────────────────────────┐
    │        QUEUE SYSTEM                 │
    ├─────────────────────────────────────┤
    │  • JOBS                             │
    │  • JOB_BATCHES                      │
    │  • FAILED_JOBS                      │
    └─────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │       CACHING SYSTEM                │
    ├─────────────────────────────────────┤
    │  • CACHE                            │
    │  • CACHE_LOCKS                      │
    └─────────────────────────────────────┘
```

### Key Entities:

#### USERS
**Purpose**: User authentication and system access  
**Central Hub**: Referenced by most operational tables  
**Key Relationships**: See diagram above

#### SESSIONS
**Purpose**: User session management  
**Key Fields**: `user_id`, `ip_address`, `user_agent`, `last_activity`

#### NOTIFICATIONS
**Purpose**: System notifications  
**Key Fields**: `user_id`, `title`, `description`, `link`, `type`, `is_read`

#### PERSONAL_ACCESS_TOKENS
**Purpose**: API authentication (Laravel Sanctum)

---

## Utility & Reference Data

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UTILITY & REFERENCE DATA                              │
└─────────────────────────────────────────────────────────────────────────┘

    CREDIT_BALANCES ◄─── 1:1 ─── CUSTOMER_ACCOUNTS
         │
         │ References
         ▼
    CREDIT_BALANCE_DEFINITIONS


    MATERIAL_ITEMS ◄─── M:1 ─── TICKET_MATERIALS
                   ◄─── M:1 ─── CUST_APP_INSP_MATS


    REQUIREMENT_REPOS
    
    
    UMS_RATES


    ROUTES ◄─── M:1 ─── CUSTOMER_ACCOUNTS
```

### Key Entities:

#### CREDIT_BALANCES
**Purpose**: Track customer credit/overpayment balances  
**Key Relationships**:
- **1:1 → Customer Accounts**: One credit balance per account
- Unique constraint on `customer_account_id`

**Key Fields**: `account_number`, `credit_balance`

#### MATERIAL_ITEMS
**Purpose**: Material/inventory catalog  
**Used By**:
- Ticket Materials (for ticket resolution)
- Inspection Materials (for installations)

#### ROUTES
**Purpose**: Service routes for field operations  
**Referenced By**: Customer Accounts for routing

---

## Relationship Types

### 1. One-to-Many (1:M)
**Description**: One parent record can have multiple child records

**Examples**:
- Districts → Towns → Barangays (geographic hierarchy)
- Customer Accounts → Payables (one account, many bills)
- Transactions → Transaction Details (one transaction, many line items)
- Approval Flows → Approval Flow Steps (one flow, many steps)
- Users → Sessions (one user, many sessions)

### 2. One-to-One (1:1)
**Description**: One parent record relates to exactly one child record

**Examples**:
- Customer Applications → Customer Accounts (application becomes account)
- Customer Applications → Application Contracts (one contract per application)
- Customer Applications → Inspections (one inspection per application)
- Customer Accounts → Credit Balances (one balance per account)
- Tickets → Ticket Details (one detail record per ticket)

### 3. Many-to-Many (M:M)
**Description**: Many records on both sides can relate to each other

**Examples**:
- Roles ↔ Permissions (via `role_has_permissions`)
- Users ↔ Roles (via `model_has_roles`)
- Users ↔ Permissions (via `model_has_permissions`)

### 4. Polymorphic Relationships
**Description**: A table can belong to multiple other tables using a type/id combination

**Examples**:

#### Transactionable (Transactions)
```
TRANSACTIONS
  ├─► transactionable_type = 'App\Models\Payable'
  └─► transactionable_id = payable_id
```

#### Approvable (Approval System)
```
APPROVAL_STATES / APPROVAL_RECORDS
  ├─► approvable_type = 'App\Models\CustomerApplication'
  ├─► approvable_type = 'App\Models\AmendmentRequest'
  └─► approvable_id = respective_id
```

#### Model (Permission System)
```
MODEL_HAS_ROLES / MODEL_HAS_PERMISSIONS
  ├─► model_type = 'App\Models\User'
  └─► model_id = user_id
```

---

## Main Business Flows

### 1. Customer Onboarding Flow

```
┌──────────────────────┐
│ CUSTOMER_APPLICATION │
│   (Initial Request)  │
└──────────┬───────────┘
           │
           ├─────────────────────────────────┐
           │                                 │
           ▼                                 ▼
┌──────────────────────┐         ┌──────────────────────┐
│   APPROVAL_STATES    │         │ CUST_APPLN_INSPECTION│
│   (Workflow Start)   │         │  (Technical Check)   │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────┐         ┌──────────────────────┐
│  APPROVAL_RECORDS    │         │APPLICATION_CONTRACTS │
│  (Approval Steps)    │         │  (Contract Signing)  │
└──────────┬───────────┘         └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  CUSTOMER_ACCOUNTS   │
│   (Active Account)   │
└──────────┬───────────┘
           │
           ├──────────────┬────────────────┐
           │              │                │
           ▼              ▼                ▼
    ┌──────────┐  ┌──────────────┐ ┌────────────────┐
    │ PAYABLES │  │CREDIT_BALANCE│ │SERVICE_TICKETS │
    └──────────┘  └──────────────┘ └────────────────┘
```

**Steps**:
1. Customer submits application (`customer_applications`)
2. Application enters approval workflow (`approval_states`)
3. Inspection scheduled and performed (`cust_appln_inspections`)
4. Contract executed (`application_contracts`)
5. Approvals collected (`approval_records`)
6. Account created (`customer_accounts`)
7. Initial payables generated (`payables`)
8. Credit balance initialized (`credit_balances`)

---

### 2. Payment Processing Flow

```
┌──────────────────────┐
│  CUSTOMER_ACCOUNTS   │
└──────────┬───────────┘
           │ has many
           ▼
┌──────────────────────┐
│      PAYABLES        │
│  (Bills/Fees/Deps)   │
└──────────┬───────────┘
           │ paid via
           │ (polymorphic)
           ▼
┌──────────────────────┐         ┌──────────────────────┐
│    TRANSACTIONS      │◄────────│ TRANSACTION_SERIES   │
│  (Payment Record)    │         │  (OR# Generation)    │
└──────────┬───────────┘         └──────────────────────┘
           │
           ├───────────────┬─────────────────┐
           │               │                 │
           ▼               ▼                 ▼
┌──────────────────┐ ┌─────────────┐ ┌─────────────────┐
│TRANSACTION_DETAILS│ │PAYMENT_TYPES│ │ CREDIT_BALANCES │
│  (Line Items)    │ │(Cash/Check) │ │  (Overpayment)  │
└──────────────────┘ └─────────────┘ └─────────────────┘
```

**Steps**:
1. Payables exist for customer account
2. Customer makes payment
3. OR number generated from transaction series
4. Transaction created with OR number
5. Transaction details capture line items
6. Payment types record payment methods
7. Payable balances updated
8. Excess payment stored in credit balance
9. Credit can be applied to future transactions

---

### 3. Service Ticket Flow

```
┌──────────────────────┐
│  CUSTOMER_ACCOUNTS   │
└──────────┬───────────┘
           │ request
           ▼
┌──────────────────────┐         ┌──────────────────────┐
│      TICKETS         │◄────────│    TICKET_TYPES      │
│  (Service Request)   │         │   (Category/Type)    │
└──────────┬───────────┘         └──────────────────────┘
           │
           ├───────────────┬─────────────────┬──────────────────┐
           │               │                 │                  │
           ▼               ▼                 ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────┐ ┌────────────────┐
│ TICKET_DETAILS  │ │ TICKET_USERS │ │TICKET_CUST_│ │TICKET_MATERIALS│
│(Problem/Action) │ │  (Assigned)  │ │INFORMATION │ │  (Used Items)  │
└─────────────────┘ └──────────────┘ └─────────────┘ └────────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │  BARANGAYS   │
                                     │    TOWNS     │
                                     └──────────────┘
```

**Steps**:
1. Ticket created (linked to customer or walk-in)
2. Ticket type and concern type assigned
3. Customer information captured
4. Ticket assigned to department/users
5. Technicians assigned via ticket_users
6. Work performed, materials logged
7. Findings and action plan documented
8. Ticket resolved and closed

---

### 4. Approval Workflow Flow

```
┌──────────────────────┐
│   APPROVAL_FLOWS     │
│  (Process Template)  │
└──────────┬───────────┘
           │ defines
           ▼
┌──────────────────────┐
│ APPROVAL_FLOW_STEPS  │
│  (Sequential Steps)  │
└──────────────────────┘
           │
           │ applied to
           ▼
┌──────────────────────┐         ┌──────────────────────┐
│   APPROVAL_STATES    │         │  Approvable Entity:  │
│  (Current Status)    │◄────────│  - Applications      │
└──────────┬───────────┘         │  - Inspections       │
           │                     │  - (Others)          │
           │ actions             └──────────────────────┘
           ▼
┌──────────────────────┐
│  APPROVAL_RECORDS    │
│  (Audit Trail)       │
└──────────────────────┘
           │
           ▼
       ┌────────┐
       │ USERS  │
       │(Approver)
       └────────┘
```

**Steps**:
1. Approval flow defined with sequential steps
2. Each step assigned to role or specific user
3. Entity requiring approval created (e.g., customer application)
4. Approval state initialized for entity
5. Current step tracked in approval_state
6. Approver reviews and takes action
7. Approval record created with status and remarks
8. Approval state progresses to next step
9. Process completes when all steps approved
10. Entity status updated accordingly

---

## Database Design Patterns

### 1. Soft Deletes Pattern
**Tables Using Soft Deletes**:
- `users`, `customer_applications`, `customer_accounts`
- `payables`, `transactions`, `transaction_details`, `payment_types`
- `cust_appln_inspections`, `transaction_series`
- `credit_balances`

**Purpose**: Preserve data integrity and audit trails

### 2. Polymorphic Pattern
**Used For**:
- **Transactions**: Can apply to various payable types
- **Approvals**: Can approve multiple entity types
- **Permissions**: Can assign to various model types

**Benefits**: Flexible, reusable relationships without multiple foreign keys

### 3. Pivot Table Pattern
**Used For**:
- `role_has_permissions`: Roles ↔ Permissions
- `model_has_roles`: Models ↔ Roles
- `model_has_permissions`: Models ↔ Permissions

**Benefits**: Clean many-to-many relationships with additional metadata

### 4. Audit Trail Pattern
**Implemented Via**:
- `created_at`, `updated_at` timestamps on most tables
- `deleted_at` for soft delete tracking
- `approval_records` for approval history
- `logs` table for system events
- User references (`created_by`, `approved_by`, etc.)

### 5. Status Tracking Pattern
**Tables With Status**:
- `customer_applications.status`
- `customer_accounts.account_status`
- `payables.status`
- `transactions.status`
- `tickets.status`
- `approval_states.status`

**Common Values**: pending, approved, rejected, active, inactive, completed, cancelled

---

## Index Strategy

### Primary Keys
All tables use auto-incrementing `id` as primary key (bigint unsigned)

### Foreign Key Indexes
Automatically indexed for performance:
- All `*_id` foreign key columns
- Polymorphic `*_type` + `*_id` combinations

### Custom Indexes
- `sessions.user_id` - User session lookup
- `sessions.last_activity` - Session cleanup
- `jobs.queue` - Queue processing
- `credit_balances.account_number` - Account lookup
- `transaction_series.is_active` - Active series queries
- `transaction_series.effective_from`, `effective_to` - Date range queries

### Unique Constraints
- `users.email` - Email uniqueness
- `customer_accounts.account_number` - Account uniqueness
- `transactions.or_number` - OR number uniqueness
- `credit_balances.customer_account_id` - One balance per account
- `permissions (name, guard_name)` - Permission uniqueness
- `roles (name, guard_name, team_foreign_key)` - Role uniqueness

---

## Data Integrity Rules

### Cascade Deletes
**When parent deleted, children auto-deleted**:
- `towns → barangays`
- `tickets → ticket_details, ticket_cust_information`
- `customer_applications → customer_relationships`
- `approval_flows → approval_flow_steps`

### Restrict Deletes
**Cannot delete parent if children exist**:
- `customer_types ← customer_applications`
- `customer_applications ← customer_accounts`
- `barangays ← customer_applications`

### Set Null
**Child FK set to null when parent deleted**:
- `tickets.inspector_id → users`

---

## Future Expansion Considerations

### Planned Enhancements
1. **Billing Module**: Integration with UMS rates
2. **Inventory Management**: Expansion of material items
3. **Mobile App**: API token authentication via personal_access_tokens
4. **Reporting**: Leveraging logs and audit trails
5. **Geographic Expansion**: Route optimization

### Scalability Features
- Queue system for background processing
- Cache system for performance optimization
- Polymorphic relationships for flexibility
- Modular approval system
- Extensible permission system

---

## Summary

This ERD represents a comprehensive utility management system with:

- **50+ interconnected tables**
- **Multiple relationship types** (1:1, 1:M, M:M, Polymorphic)
- **Geographic hierarchy** (Districts → Towns → Barangays)
- **Customer lifecycle** (Application → Inspection → Contract → Account)
- **Financial management** (Payables → Transactions → Payments)
- **Service ticketing** with material tracking
- **Flexible approval workflows** for any entity
- **Role-based permissions** with team support
- **Comprehensive audit trails** and soft deletes

**Key Strengths**:
- Data integrity through foreign key constraints
- Audit trails via timestamps and soft deletes
- Flexibility through polymorphic relationships
- Scalability through queue and cache systems
- Security through role-based access control

---

*This ERD documentation is based on the Laravel migration files and database structure documentation dated November 7, 2025.*
