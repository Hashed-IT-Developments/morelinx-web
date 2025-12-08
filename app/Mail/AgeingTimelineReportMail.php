<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AgeingTimelineReportMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public array $reportData,
        public string $frequency = 'daily'
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->frequency) {
            'weekly' => 'Weekly Aging Timeline Report',
            'monthly' => 'Monthly Aging Timeline Report',
            default => 'Daily Aging Timeline Report',
        };

        return new Envelope(
            subject: $subject . ' - ' . $this->reportData['generated_at'],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.ageing-timeline-report',
            with: [
                'reportData' => $this->reportData,
                'frequency' => $this->frequency,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
