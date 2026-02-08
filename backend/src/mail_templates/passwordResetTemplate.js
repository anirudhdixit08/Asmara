export const passwordResetTemplate = (otp) => {
  return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Reset OTP</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FFD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
                font-size: 24px; /* Made slightly larger for emphasis */
                color: #000000;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <div class="message">Reset Your Password - Factrix</div>
            <div class="body">
                <p>Hey there,</p>
                <p>We received a request to reset the password for your Factrix account. No worries, it happens to the best of us!</p>
                <p>Please use the OTP below to reset your password:</p>
                
                <h2 class="highlight">${otp}</h2>
                
                <p>This OTP is valid for the next 5 minutes.</p>
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="support">Need help? Reach us anytime at <a href="mailto:anirudhdixit.sjknp@gmail.com">anirudhdixit.sjknp@gmail.com</a>.</div>
        </div>
    </body>
    
    </html>`;
};
