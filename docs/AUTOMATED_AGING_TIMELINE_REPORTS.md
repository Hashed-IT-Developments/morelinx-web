# Automated Aging Timeline Reports

## Overview

The Automated Aging Timeline Reports system allows administrators to schedule and send aging timeline reports via email automatically. This feature eliminates the need for manual report generation and ensures stakeholders receive timely updates on application statuses.

## Features

- **Automated Email Delivery**: Schedule reports to be sent daily, weekly, or monthly
- **Multiple Recipients**: Configure multiple email addresses to receive reports
- **Flexible Scheduling**: Choose specific times and days for report delivery
- **Test Functionality**: Send test reports to verify configuration before enabling schedules
- **Admin Interface**: User-friendly web interface for non-technical configuration
- **Email Templates**: Professional HTML email design with executive summary and detailed breakdowns

## System Components

### 1. Artisan Command

**File**: `app/Console/Commands/SendAgeingTimelineReport.php`

The core command that generates and sends the aging timeline reports.

**Command Signature**:
```bash
php artisan report:send-ageing-timeline {--frequency=daily} {--recipients=}
```

**Parameters**:
- `--frequency`: Report frequency (daily, weekly, monthly)
- `--recipients`: Comma-separated email addresses (optional, uses config if not provided)

**Features**:
- Generates comprehensive report data with stage breakdowns
- Calculates age distribution (Below 7 Days, 7-30 Days, 30-90 Days, Over 90 Days)
- Identifies critical applications (90+ days old)
- Includes null safety checks for relationships
- Supports queue system for asynchronous processing

**Example Usage**:
```bash
# Send daily report to configured recipients
php artisan report:send-ageing-timeline --frequency=daily

# Send test report to specific email
php artisan report:send-ageing-timeline --frequency=weekly --recipients=test@example.com
```

### 2. Mailable Class

**File**: `app/Mail/AgeingTimelineReportMail.php`

Handles email composition and delivery.

**Features**:
- Dynamic subject line based on frequency
- Passes report data to email template
- Supports mail queuing
- Uses Laravel's mailable system for reliability

**Subject Formats**:
- Daily: "Daily Aging Timeline Report - [Date]"
- Weekly: "Weekly Aging Timeline Report - [Date]"
- Monthly: "Monthly Aging Timeline Report - [Date]"

### 3. Email Template

**File**: `resources/views/emails/ageing-timeline-report.blade.php`

Professional HTML email template with modern design.

**Template Sections**:

1. **Header**: Company branding with report title
2. **Executive Summary**: Four key metrics cards
   - Below 7 Days (Blue - Low urgency)
   - 7-30 Days (Green - Normal)
   - 30-90 Days (Orange - Warning)
   - Over 90 Days (Red - Critical)
3. **Stage Breakdown**: Detailed view by stage with age distribution pills
4. **Critical Applications**: Top 10 applications exceeding 90 days
5. **Call-to-Action**: Button linking to dashboard
6. **Footer**: Company information and branding

**Design Features**:
- Responsive layout (mobile-friendly)
- Color-coded indicators for urgency levels
- Clean typography and spacing
- Dark purple header gradient
- Professional card-based design

### 4. Configuration File

**File**: `config/reports.php`

Centralized configuration for report settings.

**Structure**:
```php
return [
    'ageing_timeline' => [
        'recipients' => [
            'email1@example.com',
            'email2@example.com',
        ],
        'schedule' => [
            'daily' => [
                'enabled' => true,
                'time' => '08:00',
            ],
            'weekly' => [
                'enabled' => false,
                'day' => 'monday',
                'time' => '08:00',
            ],
            'monthly' => [
                'enabled' => false,
                'day' => 1,
                'time' => '08:00',
            ],
        ],
        'thresholds' => [
            'critical_days' => 90,
            'warning_days' => 30,
            'max_critical_display' => 20,
        ],
    ],
];
```

**Configuration Options**:
- `recipients`: Array of email addresses
- `schedule.daily`: Daily schedule settings (enabled, time)
- `schedule.weekly`: Weekly schedule settings (enabled, day, time)
- `schedule.monthly`: Monthly schedule settings (enabled, day, time)
- `thresholds.critical_days`: Days threshold for critical status (default: 90)
- `thresholds.warning_days`: Days threshold for warning status (default: 30)
- `thresholds.max_critical_display`: Maximum critical applications to display in email (default: 20)

### 5. Task Scheduler

**File**: `routes/console.php`

Registers scheduled tasks based on configuration.

**Scheduling Logic**:
```php
// Daily schedule - runs at configured time
if (config('reports.ageing_timeline.schedule.daily.enabled')) {
    $schedule->command('report:send-ageing-timeline', ['--frequency' => 'daily'])
        ->dailyAt(config('reports.ageing_timeline.schedule.daily.time'))
        ->timezone(config('app.timezone'));
}

// Weekly schedule - runs on specific day at configured time
if (config('reports.ageing_timeline.schedule.weekly.enabled')) {
    $schedule->command('report:send-ageing-timeline', ['--frequency' => 'weekly'])
        ->weeklyOn(
            config('reports.ageing_timeline.schedule.weekly.day'),
            config('reports.ageing_timeline.schedule.weekly.time')
        )
        ->timezone(config('app.timezone'));
}

// Monthly schedule - runs on specific day of month at configured time
if (config('reports.ageing_timeline.schedule.monthly.enabled')) {
    $schedule->command('report:send-ageing-timeline', ['--frequency' => 'monthly'])
        ->monthlyOn(
            config('reports.ageing_timeline.schedule.monthly.day'),
            config('reports.ageing_timeline.schedule.monthly.time')
        )
        ->timezone(config('app.timezone'));
}
```

**Requirements**:
- Laravel's task scheduler must be configured in cron
- Add to crontab: `* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1`

### 6. Admin Interface

**Controller**: `app/Http/Controllers/Settings/ReportScheduleController.php`  
**Frontend**: `resources/js/pages/settings/report-schedules/index.tsx`  
**Routes**: `routes/settings.php`

**Accessible At**: `/settings/report-schedules`

**Access Control**: Restricted to `superadmin` and `admin` roles

**Features**:
- Email recipient management (add/remove)
- Schedule configuration for daily, weekly, and monthly reports
- Enable/disable individual schedules via checkboxes
- Time picker for delivery times
- Day selector for weekly reports (Monday-Sunday)
- Day-of-month selector for monthly reports (1-31)
- Test email functionality
- Real-time validation
- Config cache clearing after updates
- Active schedules summary display

**Controller Methods**:
- `index()`: Display settings page
- `update(Request)`: Save schedule configuration to config file
- `testSend(Request)`: Send test email
- `getSettings()`: Retrieve current configuration
- `updateConfigFile(array)`: Write changes to config/reports.php

## Email Report Data Structure

The report email contains the following data:

```php
[
    'summary' => [
        'below_7_days' => 5,    // Applications aged 0-6 days
        '7_30_days' => 12,      // Applications aged 7-30 days
        '30_90_days' => 8,      // Applications aged 31-90 days
        'over_90_days' => 3,    // Applications aged 90+ days
    ],
    'stages' => [
        'Stage Name' => [
            'total' => 10,
            'age_groups' => [
                'below_7_days' => 2,
                '7_30_days' => 5,
                '30_90_days' => 2,
                'over_90_days' => 1,
            ],
        ],
    ],
    'applications' => [
        [
            'customer_name' => 'John Doe',
            'account_number' => '12345',
            'stage' => 'Pending Approval',
            'days_elapsed' => 45,
            'date_applied' => '2024-10-23',
        ],
    ],
    'critical_applications' => [
        // Applications with days_elapsed >= 90
    ],
]
```

## SMTP Configuration

### For Testing (Mailtrap)

**File**: `.env`

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@morelinx.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### For Production

Update `.env` with your production SMTP credentials:

```env
MAIL_MAILER=smtp
MAIL_HOST=your.smtp.server
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="reports@yourcompany.com"
MAIL_FROM_NAME="Company Reports"
```

**Supported Mail Drivers**:
- `smtp`: Standard SMTP server
- `ses`: Amazon SES
- `mailgun`: Mailgun
- `postmark`: Postmark
- `log`: Write emails to log (development only)

## Installation & Setup

### Step 1: Configuration

1. Copy the example configuration:
   ```bash
   php artisan config:publish reports
   ```

2. Edit `config/reports.php` and set initial recipients:
   ```php
   'recipients' => [
       'executive@company.com',
       'manager@company.com',
   ],
   ```

### Step 2: SMTP Setup

Configure your email credentials in `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=your.smtp.host
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
```

### Step 3: Test Email Delivery

Send a test email to verify configuration:
```bash
php artisan report:send-ageing-timeline --frequency=daily --recipients=your@email.com
```

Check your inbox (or spam folder) for the test report.

### Step 4: Configure Schedules

1. Navigate to `/settings/report-schedules` in the admin interface
2. Add or modify email recipients
3. Enable desired schedules (daily, weekly, or monthly)
4. Set delivery times and days
5. Use "Send Test" to verify before enabling
6. Click "Save Changes"

### Step 5: Enable Laravel Scheduler

Add Laravel's scheduler to your crontab:

```bash
crontab -e
```

Add this line:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Replace `/path-to-your-project` with your actual project path.

### Step 6: Verify Scheduler

Check that the scheduler is running:
```bash
php artisan schedule:list
```

You should see entries for `report:send-ageing-timeline` if schedules are enabled.

## Testing

### Manual Testing

1. **Test Command Directly**:
   ```bash
   php artisan report:send-ageing-timeline --frequency=daily --recipients=test@example.com
   ```

2. **Test via Admin Interface**:
   - Go to `/settings/report-schedules`
   - Enter test email in "Test Report" section
   - Select frequency
   - Click "Send Test"

3. **Test Scheduler**:
   ```bash
   # Run scheduler manually (runs all due tasks)
   php artisan schedule:run
   
   # Test specific schedule
   php artisan schedule:test
   ```

### Verification Checklist

- [ ] Email received in inbox
- [ ] All report sections display correctly
- [ ] Summary numbers are accurate
- [ ] Stage breakdown shows correct data
- [ ] Critical applications section appears (if applicable)
- [ ] Dashboard link works
- [ ] Email displays properly on mobile devices
- [ ] Dark mode renders correctly (if applicable)

## Troubleshooting

### Issue: Emails Not Being Sent

**Possible Causes**:
1. SMTP credentials incorrect
2. Laravel scheduler not running
3. Schedule not enabled in config
4. Recipients array empty

**Solutions**:
```bash
# Check SMTP configuration
php artisan tinker
Mail::raw('Test', function($msg) { $msg->to('test@example.com')->subject('Test'); });

# Verify scheduler is running
php artisan schedule:list

# Check configuration
php artisan config:cache
php artisan config:clear

# Verify recipients
php artisan tinker
config('reports.ageing_timeline.recipients');
```

### Issue: Command Fails with Error

**Check logs**:
```bash
tail -f storage/logs/laravel.log
```

**Common Issues**:
- Database connection errors
- Missing relationships (check `customerApplication` relationship)
- Memory limit exceeded (increase in `php.ini`)
- Timeout issues (increase `max_execution_time`)

### Issue: Scheduler Not Running

**Verify crontab**:
```bash
crontab -l
```

**Check cron logs**:
```bash
# Linux
grep CRON /var/log/syslog

# macOS
log show --predicate 'eventMessage contains "CRON"' --last 1h
```

**Test manually**:
```bash
php artisan schedule:run
```

### Issue: Config Changes Not Reflecting

**Clear all caches**:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

## Maintenance

### Adding New Recipients

**Via Admin Interface** (Recommended):
1. Go to `/settings/report-schedules`
2. Click "Add Recipient"
3. Enter email address
4. Click "Save Changes"

**Via Config File**:
1. Edit `config/reports.php`
2. Add email to `recipients` array
3. Run `php artisan config:cache`

### Modifying Schedules

**Via Admin Interface** (Recommended):
1. Go to `/settings/report-schedules`
2. Enable/disable schedules using checkboxes
3. Adjust times and days as needed
4. Click "Save Changes"

**Via Config File**:
1. Edit `config/reports.php`
2. Modify schedule settings
3. Run `php artisan config:cache`

### Monitoring

**Check Last Run**:
```bash
# View schedule history
php artisan schedule:list

# Check logs for successful sends
grep "Ageing Timeline Report sent" storage/logs/laravel.log
```

**Email Delivery Monitoring**:
- Monitor bounce rates
- Check spam folder deliverability
- Verify SPF/DKIM records for production domain
- Use email delivery monitoring services (e.g., Postmark, SendGrid)

## Security Considerations

1. **Access Control**: Admin interface restricted to `superadmin` and `admin` roles only
2. **Email Validation**: All recipient emails validated before saving
3. **SQL Injection**: Uses Eloquent ORM with parameter binding
4. **CSRF Protection**: All form submissions include CSRF tokens
5. **Config File Security**: Config files should not be publicly accessible
6. **SMTP Credentials**: Stored in `.env` file (should be in `.gitignore`)

## Performance Optimization

### For Large Datasets

1. **Use Queues**:
   ```php
   Mail::to($recipients)->queue(new AgeingTimelineReportMail($data, $frequency));
   ```

2. **Chunk Processing**:
   ```php
   AgeingTimeline::chunk(1000, function($timelines) {
       // Process in batches
   });
   ```

3. **Eager Loading**:
   ```php
   AgeingTimeline::with('customerApplication')->get();
   ```

4. **Database Indexing**:
   - Index on `days_elapsed` column
   - Index on `stage` column
   - Composite index on `(stage, days_elapsed)`

### Memory Management

For large reports, increase PHP memory limit:
```php
ini_set('memory_limit', '512M');
```

Or in `config/reports.php`:
```php
'max_applications' => 1000, // Limit applications in report
```

## Future Enhancements

Potential improvements for future versions:

1. **PDF Attachments**: Generate and attach PDF version of report
2. **Custom Templates**: Allow admins to customize email templates
3. **Filtering Options**: Filter reports by town, barangay, or status
4. **Report History**: Store sent reports for audit trail
5. **Webhook Integration**: Send reports to external systems
6. **Mobile App Notifications**: Push notifications in addition to email
7. **Interactive Dashboards**: Embed live data visualizations in emails
8. **Recipient Groups**: Create recipient groups for different report types
9. **Conditional Sending**: Only send if certain thresholds are met
10. **A/B Testing**: Test different email formats for effectiveness

## Support

For issues or questions regarding the automated reporting system:

1. Check this documentation
2. Review Laravel logs: `storage/logs/laravel.log`
3. Test email configuration with manual sends
4. Verify scheduler is running with `php artisan schedule:list`
5. Contact system administrator or development team

## Changelog

### Version 1.0.0 (December 2024)
- Initial release
- Support for daily, weekly, and monthly schedules
- Admin interface for configuration
- Professional HTML email template
- Test email functionality
- Multi-recipient support
- Config-driven scheduling
- SMTP integration with Mailtrap for testing

---

**Last Updated**: December 8, 2024  
**System Version**: 1.0.0  
**Documentation Version**: 1.0.0
