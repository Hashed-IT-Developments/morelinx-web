<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;

class UserPasswordSetupNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        // Generate password reset token
        $token = Password::createToken($notifiable);
        
        // Force the app URL to be used for URL generation
        $originalUrl = config('app.url');
        URL::forceRootUrl($originalUrl);
        
        // Create password setup URL
        $url = route('password.reset', [
            'token' => $token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->subject('Welcome! Set up your password - ' . config('app.name'))
            ->greeting('Welcome to ' . config('app.name') . '!')
            ->line('Your account has been created successfully. To get started, you need to set up your password.')
            ->line('Please click the button below to create your password and activate your account.')
            ->action('Set Up Password', $url)
            ->line('This password setup link will expire in ' . config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60) . ' minutes for security reasons.')
            ->line('If you did not expect to receive this email, please contact your administrator.')
            ->salutation('Best regards,')
            ->salutation(config('app.name') . ' Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}