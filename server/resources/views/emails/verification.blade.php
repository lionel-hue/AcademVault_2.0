<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AcademVault - Email Verification</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #fafafa;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            margin: 0;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #1e1e1e;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #27272a;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .email-header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            padding: 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
            opacity: 0.1;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 15px;
            position: relative;
            z-index: 2;
        }
        
        .logo-icon {
            font-size: 28px;
            color: white;
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: white;
            letter-spacing: -0.5px;
        }
        
        .email-title {
            font-size: 28px;
            font-weight: 700;
            color: white;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
        }
        
        .email-subtitle {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            position: relative;
            z-index: 2;
        }
        
        .email-body {
            padding: 40px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #fafafa;
        }
        
        .instruction {
            font-size: 16px;
            color: #a1a1aa;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .code-container {
            background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #27272a;
        }
        
        .code-label {
            font-size: 14px;
            color: #a1a1aa;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .verification-code {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 8px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 15px 0;
        }
        
        .expiry-note {
            font-size: 14px;
            color: #f59e0b;
            margin-top: 10px;
            font-weight: 500;
        }
        
        .action-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
        }
        
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(59, 130, 246, 0.3);
        }
        
        .support-note {
            font-size: 14px;
            color: #71717a;
            text-align: center;
            margin-top: 30px;
            line-height: 1.5;
        }
        
        .email-footer {
            background: #111111;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #27272a;
        }
        
        .footer-text {
            font-size: 12px;
            color: #71717a;
            margin-bottom: 10px;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
        }
        
        .social-link {
            color: #a1a1aa;
            text-decoration: none;
            font-size: 12px;
            transition: color 0.3s;
        }
        
        .social-link:hover {
            color: #3b82f6;
        }
        
        @media (max-width: 600px) {
            .email-body {
                padding: 25px;
            }
            
            .verification-code {
                font-size: 32px;
                letter-spacing: 6px;
            }
            
            .email-title {
                font-size: 24px;
            }
            
            .email-header {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">
                <div class="logo-icon">📚</div>
                <div class="logo-text">AcademVault</div>
            </div>
            <h1 class="email-title">Email Verification</h1>
            <p class="email-subtitle">Secure your account with this code</p>
        </div>
        
        <!-- Body -->
        <div class="email-body">
            <p class="greeting">Hello,</p>
            
            <p class="instruction">
                Thank you for joining AcademVault! To complete your registration and access our academic research platform, 
                please verify your email address by entering the 6-digit code below:
            </p>
            
            <!-- Verification Code -->
            <div class="code-container">
                <div class="code-label">Verification Code</div>
                <div class="verification-code">{{ $code }}</div>
                <div class="expiry-note">This code expires in 24 hours</div>
            </div>
            
            <!-- Action Button -->
            <div class="action-container">
                <a href="{{ url('/signup') }}" class="action-button">
                    Complete Verification
                </a>
            </div>
            
            <p class="instruction">
                If you didn't request this verification, please ignore this email. Your account won't be activated until you verify your email.
            </p>
            
            <p class="support-note">
                Need help? Contact our support team at 
                <a href="mailto:support@academvault.com" style="color: #3b82f6;">support@academvault.com</a> 
                or visit our 
                <a href="{{ url('/help') }}" style="color: #3b82f6;">help center</a>.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">
                © {{ date('Y') }} AcademVault. All rights reserved.<br>
                Your data is protected with 256-bit encryption.
            </p>
            
            <div class="social-links">
                <a href="#" class="social-link">Privacy Policy</a>
                <a href="#" class="social-link">Terms of Service</a>
                <a href="#" class="social-link">Unsubscribe</a>
            </div>
        </div>
    </div>
</body>
</html>