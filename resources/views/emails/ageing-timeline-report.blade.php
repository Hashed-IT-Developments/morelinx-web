<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aging Timeline Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
        }
        .email-wrapper {
            max-width: 800px;
            margin: 0 auto;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 10px;
            background: white;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0 0 8px;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 0;
            opacity: 0.95;
            font-size: 15px;
            font-weight: 500;
        }
        .content {
            padding: 40px 30px;
            background-color: #fafafa;
        }
        .summary-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .summary-title {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .summary-subtitle {
            font-size: 28px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 25px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .stat-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .stat-label {
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 36px;
            font-weight: 800;
            line-height: 1;
        }
        .stat-card:nth-child(1) .stat-value { color: #10b981; }
        .stat-card:nth-child(2) .stat-value { color: #3b82f6; }
        .stat-card:nth-child(3) .stat-value { color: #f59e0b; }
        .stat-card:nth-child(4) .stat-value { color: #ef4444; }
        .insights-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 3px solid #667eea;
        }
        .insight-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .insight-item:last-child {
            border-bottom: none;
        }
        .insight-label {
            font-size: 14px;
            color: #4b5563;
            font-weight: 500;
        }
        .insight-value {
            font-size: 18px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 20px;
        }
        .value-low {
            background-color: #d1fae5;
            color: #065f46;
        }
        .value-moderate {
            background-color: #fef3c7;
            color: #92400e;
        }
        .value-high {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .critical-section {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px solid #fecaca;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
        }
        .critical-title {
            font-size: 18px;
            font-weight: 700;
            color: #991b1b;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .critical-list {
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        .critical-item {
            padding: 15px;
            border-bottom: 1px solid #fee2e2;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .critical-item:last-child {
            border-bottom: none;
        }
        .critical-info {
            flex: 1;
        }
        .critical-account {
            font-weight: 700;
            color: #111827;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .critical-name {
            font-size: 13px;
            color: #6b7280;
        }
        .critical-days {
            background: #fee2e2;
            color: #991b1b;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 13px;
            white-space: nowrap;
        }
        .cta-section {
            text-align: center;
            padding: 30px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            font-size: 15px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        .footer {
            background-color: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
            font-size: 13px;
        }
        .footer-brand {
            color: #ffffff;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header">
                <h1>📊 Aging Timeline Report</h1>
                <p>{{ ucfirst($frequency) }} Report · {{ $reportData['generated_at'] }}</p>
            </div>

            <div class="content">
                <!-- Executive Summary -->
                <div class="summary-section">
                    <div class="summary-title">📈 Executive Summary</div>
                    <div class="summary-subtitle">{{ $reportData['total_applications'] }} Applications in Process</div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Below 7 Days</div>
                            <div class="stat-value">{{ $reportData['summary']['by_age_group']['below_7_days'] }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">7-30 Days</div>
                            <div class="stat-value">{{ $reportData['summary']['by_age_group']['7_to_30_days'] }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">30-90 Days</div>
                            <div class="stat-value">{{ $reportData['summary']['by_age_group']['30_to_90_days'] }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Over 90 Days</div>
                            <div class="stat-value">{{ $reportData['summary']['by_age_group']['above_90_days'] }}</div>
                        </div>
                    </div>
                </div>

                @php
                $stageLabels = [
                    'during_application' => 'Application in Process',
                    'forwarded_to_inspector' => 'Forwarded To Inspector',
                    'inspection_date' => 'For Inspection',
                    'inspection_uploaded_to_system' => 'Inspection Uploaded',
                    'paid_to_cashier' => 'Paid To Cashier',
                    'contract_signed' => 'Contract Signed',
                    'assigned_to_lineman' => 'Assigned To Lineman',
                    'downloaded_to_lineman' => 'Downloaded To Lineman',
                    'installed_date' => 'Installed Date',
                ];
            @endphp

            <!-- Applications by Stage Breakdown -->
            <div class="insights-section">
                <div class="section-title">📋 Applications by Stage</div>
                @foreach($reportData['stages'] as $stage)
                    @php
                        $count = $reportData['summary']['by_stage'][$stage] ?? 0;
                        $valueClass = $count === 0 ? '' : ($count <= 5 ? 'value-low' : ($count <= 15 ? 'value-moderate' : 'value-high'));
                        
                        // Calculate age group distribution for this stage
                        $below7 = 0;
                        $from7to30 = 0;
                        $from30to90 = 0;
                        $above90 = 0;
                        
                        foreach ($reportData['applications'] ?? [] as $app) {
                            if ($app['current_stage'] === $stage) {
                                $days = $app['days_elapsed'];
                                if ($days < 7) {
                                    $below7++;
                                } elseif ($days >= 7 && $days < 30) {
                                    $from7to30++;
                                } elseif ($days >= 30 && $days < 90) {
                                    $from30to90++;
                                } else {
                                    $above90++;
                                }
                            }
                        }
                    @endphp
                    <div class="insight-item" style="display: block; padding: 16px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div class="insight-label">{{ $stageLabels[$stage] ?? $stage }}</div>
                            <div class="insight-value {{ $valueClass }}">{{ $count }}</div>
                        </div>
                        @if($count > 0)
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                            @if($below7 > 0)
                            <div style="background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                < 7d: {{ $below7 }}
                            </div>
                            @endif
                            @if($from7to30 > 0)
                            <div style="background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                7-30d: {{ $from7to30 }}
                            </div>
                            @endif
                            @if($from30to90 > 0)
                            <div style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                30-90d: {{ $from30to90 }}
                            </div>
                            @endif
                            @if($above90 > 0)`
                            <div style="background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                > 90d: {{ $above90 }}
                            </div>
                            @endif
                        </div>
                        @endif
                    </div>
                @endforeach
            </div>

            @php
                // Skip the detailed day-by-day tables for email brevity - not needed for the new design
            @endphp

            <!-- Critical Applications -->
            @if(count($reportData['critical_applications']) > 0)
            <div class="critical-section">
                <div class="critical-title">⚠️ Urgent Attention Required</div>
                <div class="critical-list">
                    @foreach(array_slice($reportData['critical_applications'], 0, 10) as $app)
                        <div class="critical-item">
                            <div class="critical-info">
                                <div class="critical-account">{{ $app['account_number'] }}</div>
                                <div class="critical-name">{{ $app['customer_name'] }} · {{ $stageLabels[$app['current_stage']] ?? $app['current_stage'] }}</div>
                            </div>
                            <div class="critical-days">{{ $app['days_elapsed'] }} days</div>
                        </div>
                    @endforeach
                    @if(count($reportData['critical_applications']) > 10)
                        <div class="critical-item" style="background: #fef2f2; justify-content: center;">
                            <div style="color: #991b1b; font-weight: 600; font-size: 13px;">
                                +{{ count($reportData['critical_applications']) - 10 }} more critical applications
                            </div>
                        </div>
                    @endif
                </div>
            </div>
            @endif

            <!-- Call to Action -->
            <div class="cta-section">
                <a href="{{ route('ageing-timeline.index') }}" class="cta-button">
                    View Detailed Dashboard →
                </a>
                <p style="color: #6b7280; font-size: 13px; margin-top: 15px;">
                    Access the full interactive report with filters and drill-down capabilities
                </p>
            </div>
        </div>

        <div class="footer">
            <div class="footer-brand">MoreLinx System</div>
            <p>Automated {{ ucfirst($frequency) }} Aging Timeline Report</p>
            <p>© {{ date('Y') }} MoreLinx. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
