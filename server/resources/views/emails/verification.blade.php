<!DOCTYPE html>
<html>
<head>
    <title>AcademVault - Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px; border-radius: 16px; color: white;">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                    <i class="fas fa-graduation-cap" style="font-size: 32px; color: white;"></i>
                </div>
                <h1 style="color: white; margin: 0;">AcademVault</h1>
                <p style="color: #a1a1aa; margin-top: 5px;">Research Platform</p>
            </div>
            
            <h2 style="color: white; text-align: center;">Email Verification</h2>
            
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <p style="color: #a1a1aa; margin-bottom: 15px;">Enter this code on the verification page:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #3b82f6; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; margin: 20px 0;">
                    {{ $code }}
                </div>
                
                <p style="color: #a1a1aa; margin-top: 20px;">Or click the button below to verify automatically:</p>
                
                <a href="{{ $verificationUrl }}" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                   Verify Email Address
                </a>
            </div>
            
            <p style="color: #a1a1aa; text-align: center; margin-top: 20px;">
                This verification code will expire in 24 hours.<br>
                If you didn't request this, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 30px; padding-top: 20px; text-align: center; color: #71717a; font-size: 12px;">
                <p>© {{ date('Y') }} AcademVault. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>