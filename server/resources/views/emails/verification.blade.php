<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your AcademVault Account</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .logo-icon {
            width: 48px;
            height: 48px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #3b82f6;
        }
        
        .logo-text {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-text {
            font-size: 18px;
            margin-bottom: 30px;
            color: #4b5563;
        }
        
        .verification-box {
            background: #f8fafc;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .verification-code {
            font-size: 48px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #3b82f6;
            margin: 20px 0;
            font-family: monospace;
        }
        
        .code-label {
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .instructions {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .instructions h3 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .instructions ol {
            margin-left: 20px;
            color: #4b5563;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        
        .alternative-method {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 20px;
        }
        
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .security-note {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        .footer-links {
            margin-top: 20px;
        }
        
        .footer-links a {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .copyright {
            margin-top: 20px;
            color: #9ca3af;
            font-size: 12px;
        }
        
        @media (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .verification-code {
                font-size: 36px;
                letter-spacing: 6px;
            }
            
            .verify-button {
                padding: 14px 30px;
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">🎓</div>
                <div class="logo-text">AcademVault</div>
            </div>
            <h1>Complete Your Registration</h1>
            <p>Welcome to the future of academic research</p>
        </div>
        
        <div class="content">
            <p class="welcome-text">
                Hello {{ $email }},<br><br>
                Thank you for joining AcademVault! To complete your registration and start exploring millions of research papers, videos, and articles, please verify your email address.
            </p>
            
            <div class="verification-box">
                <div class="code-label">Your Verification Code</div>
                <div class="verification-code">{{ $code }}</div>
                <p style="color: #6b7280; font-size: 14px;">
                    This code will expire in 24 hours. Enter it in the verification page.
                </p>
            </div>
            
            <div class="instructions">
                <h3>📝 How to Verify Your Account</h3>
                <ol>
                    <li><strong>Option 1:</strong> Click the button below to verify automatically</li>
                    <li><strong>Option 2:</strong> Copy the 6-digit code above</li>
                    <li>Return to AcademVault app/site</li>
                    <li>Paste or enter the code in the verification field</li>
                    <li>Click "Verify & Create Account"</li>
                </ol>
            </div>
            
            <div class="button-container">
                <a href="{{ $verificationUrl }}" class="verify-button">
                    🚀 Complete Verification
                </a>
                <p class="alternative-method">
                    Or copy and paste this link in your browser:<br>
                    <small style="color: #6b7280; word-break: break-all;">{{ $verificationUrl }}</small>
                </p>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 12px;">
                <h3 style="color: #3b82f6; margin-bottom: 10px;">🎯 What's Next?</h3>
                <p style="color: #4b5563;">
                    Once verified, you'll get instant access to:
                </p>
                <ul style="margin-left: 20px; color: #4b5563; margin-top: 10px;">
                    <li>🔍 Intelligent search across academic sources</li>
                    <li>📚 Millions of research papers and articles</li>
                    <li>🎥 Educational videos and tutorials</li>
                    <li>👥 Collaborative research tools</li>
                    <li>💾 Secure document storage</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <div class="security-note">
                🔒 This is a secure email. Your verification code is unique to you.
            </div>
            
            <div class="footer-links">
                <a href="{{ config('app.frontend_url') }}/privacy">Privacy Policy</a>
                <a href="{{ config('app.frontend_url') }}/terms">Terms of Service</a>
                <a href="{{ config('app.frontend_url') }}/help">Help Center</a>
                <a href="{{ config('app.frontend_url') }}/contact">Contact Us</a>
            </div>
            
            <div class="copyright">
                © {{ date('Y') }} AcademVault. All rights reserved.<br>
                This email was sent to {{ $email }}. If you didn't request this, please ignore this email.
            </div>
        </div>
    </div>
</body>
</html>