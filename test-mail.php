<?php

// Quick SMTP connection test
$host = 'sandbox.smtp.mailtrap.io';
$port = 2525;
$username = '26c6e721e47588';
$password = ''; // Enter your Mailtrap password here

echo "Testing SMTP connection to Mailtrap...\n";
echo "Host: $host:$port\n";
echo "Username: $username\n\n";

$socket = @fsockopen($host, $port, $errno, $errstr, 30);

if ($socket) {
    echo "✓ Successfully connected to $host:$port\n";
    echo "Response: " . fgets($socket, 512) . "\n";
    fclose($socket);
    
    echo "\nNow testing with credentials...\n";
    echo "Update MAIL_PASSWORD in .env with your actual Mailtrap password\n";
    echo "Then change MAIL_MAILER=smtp and run the command again.\n";
} else {
    echo "✗ Failed to connect: $errstr ($errno)\n";
    echo "This might be a firewall issue or the SMTP server is unreachable.\n";
}
