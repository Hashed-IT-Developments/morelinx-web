<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ReportScheduleController extends Controller
{
    /**
     * Display the report schedule settings page
     */
    public function index()
    {
        $settings = $this->getSettings();

        return Inertia::render('settings/report-schedules/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update report schedule settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'ageing_timeline.schedule.daily.enabled' => 'required|boolean',
            'ageing_timeline.schedule.daily.time' => 'required|string|date_format:H:i',
            'ageing_timeline.schedule.weekly.enabled' => 'required|boolean',
            'ageing_timeline.schedule.weekly.day' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'ageing_timeline.schedule.weekly.time' => 'required|string|date_format:H:i',
            'ageing_timeline.schedule.monthly.enabled' => 'required|boolean',
            'ageing_timeline.schedule.monthly.day' => 'required|integer|min:1|max:31',
            'ageing_timeline.schedule.monthly.time' => 'required|string|date_format:H:i',
            'ageing_timeline.recipients' => 'required|array|min:1',
            'ageing_timeline.recipients.*' => 'required|email',
        ]);

        // Update the configuration file
        $this->updateConfigFile($validated);

        // Clear config cache
        Artisan::call('config:clear');

        // Clear schedule cache if exists
        Cache::forget('report_schedules');

        return back()->with('success', 'Report schedule settings updated successfully!');
    }

    /**
     * Test send a report
     */
    public function testSend(Request $request)
    {
        $validated = $request->validate([
            'frequency' => 'required|string|in:daily,weekly,monthly',
            'recipient' => 'required|email',
        ]);

        try {
            Artisan::call('report:send-ageing-timeline', [
                '--frequency' => $validated['frequency'],
                '--recipients' => $validated['recipient'],
            ]);

            return back()->with('success', 'Test report sent successfully to ' . $validated['recipient']);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send test report: ' . $e->getMessage());
        }
    }

    /**
     * Get current settings
     */
    private function getSettings(): array
    {
        $config = config('reports.ageing_timeline');

        return [
            'ageing_timeline' => [
                'schedule' => [
                    'daily' => [
                        'enabled' => $config['schedule']['daily']['enabled'] ?? false,
                        'time' => $config['schedule']['daily']['time'] ?? '08:00',
                    ],
                    'weekly' => [
                        'enabled' => $config['schedule']['weekly']['enabled'] ?? false,
                        'day' => $config['schedule']['weekly']['day'] ?? 'monday',
                        'time' => $config['schedule']['weekly']['time'] ?? '08:00',
                    ],
                    'monthly' => [
                        'enabled' => $config['schedule']['monthly']['enabled'] ?? false,
                        'day' => $config['schedule']['monthly']['day'] ?? 1,
                        'time' => $config['schedule']['monthly']['time'] ?? '08:00',
                    ],
                ],
                'recipients' => $config['recipients'] ?? [],
                'thresholds' => $config['thresholds'] ?? [
                    'critical_days' => 90,
                    'warning_days' => 30,
                    'max_critical_display' => 20,
                ],
            ],
        ];
    }

    /**
     * Update the configuration file
     */
    private function updateConfigFile(array $data): void
    {
        $configPath = config_path('reports.php');
        $configContent = file_get_contents($configPath);

        // Parse the validated data
        $settings = $data['ageing_timeline'];

        // Build the new config array content
        $recipientsArray = "[\n";
        foreach ($settings['recipients'] as $email) {
            $recipientsArray .= "            '{$email}',\n";
        }
        $recipientsArray .= "            // Add more default recipients here\n        ]";

        $dailyEnabled = $settings['schedule']['daily']['enabled'] ? 'true' : 'false';
        $dailyTime = $settings['schedule']['daily']['time'];

        $weeklyEnabled = $settings['schedule']['weekly']['enabled'] ? 'true' : 'false';
        $weeklyDay = $settings['schedule']['weekly']['day'];
        $weeklyTime = $settings['schedule']['weekly']['time'];

        $monthlyEnabled = $settings['schedule']['monthly']['enabled'] ? 'true' : 'false';
        $monthlyDay = $settings['schedule']['monthly']['day'];
        $monthlyTime = $settings['schedule']['monthly']['time'];

        // Replace the ageing_timeline section
        $pattern = "/'ageing_timeline'\s*=>\s*\[.*?'thresholds'\s*=>\s*\[.*?\],\s*\],/s";

        $replacement = "'ageing_timeline' => [
        /*
        |--------------------------------------------------------------------------
        | Default Recipients
        |--------------------------------------------------------------------------
        |
        | Email addresses that will receive the aging timeline report by default.
        | These can be overridden using command options.
        |
        */
        'recipients' => {$recipientsArray},

        /*
        |--------------------------------------------------------------------------
        | Schedule Configuration
        |--------------------------------------------------------------------------
        |
        | Configure when reports should be sent automatically.
        |
        */
        'schedule' => [
            'daily' => [
                'enabled' => {$dailyEnabled},
                'time' => '{$dailyTime}', // 24-hour format
            ],
            'weekly' => [
                'enabled' => {$weeklyEnabled},
                'day' => '{$weeklyDay}',
                'time' => '{$weeklyTime}',
            ],
            'monthly' => [
                'enabled' => {$monthlyEnabled},
                'day' => {$monthlyDay}, // Day of the month
                'time' => '{$monthlyTime}',
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | Report Thresholds
        |--------------------------------------------------------------------------
        |
        | Configure thresholds for highlighting critical applications.
        |
        */
        'thresholds' => [
            'critical_days' => 90,
            'warning_days' => 30,
            'max_critical_display' => 20,
        ],
    ],";

        $newContent = preg_replace($pattern, $replacement, $configContent);

        if ($newContent !== null && $newContent !== $configContent) {
            file_put_contents($configPath, $newContent);
        }
    }
}
