export const registrationTemplate = (name, role) => {
  // Logic for GP-Asmara roles
  const isAsmara = role === "asmara";

  const welcomeTitle = isAsmara
    ? "Asmara Merchant Account Verified"
    : "Factory Profile Registered";

  const welcomeMessage = isAsmara
    ? "Your <strong>Merchant Account</strong> for GP-Asmara is now active. You can start managing orders, tracking shipments, and collaborating with factories."
    : "Your <strong>Factory Profile</strong> has been successfully registered. You can now receive orders, update production status, and manage your capacity on the portal.";

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${welcomeTitle}</title>
          <style>
              body {
                  font-family: 'Segoe UI', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 90%;
                  max-width: 600px;
                  margin: 20px auto;
                  border: 1px solid #e0e0e0;
                  border-radius: 10px;
                  overflow: hidden;
              }
              .header {
                  background-color: #2c3e50;
                  padding: 25px;
                  text-align: center;
              }
              .header h1 {
                  margin: 0;
                  color: #ffffff;
                  font-size: 24px;
              }
              .content {
                  padding: 40px;
                  background-color: #ffffff;
              }
              .content p {
                  margin-bottom: 20px;
                  font-size: 16px;
              }
              .button {
                  display: inline-block;
                  background-color: #27ae60;
                  color: #ffffff !important;
                  padding: 14px 25px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  margin-top: 10px;
              }
              .footer {
                  background-color: #f4f7f6;
                  padding: 20px;
                  text-align: center;
                  font-size: 13px;
                  color: #888;
              }
              .highlight {
                  color: #2c3e50;
                  font-weight: bold;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>GP-Asmara Portal</h1>
              </div>
              <div class="content">
                  <p>Dear ${name},</p>
                  <p>Welcome to the <strong>GP-Asmara Merchant-Factory Network</strong>.</p>
                  <p>${welcomeMessage}</p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                      <a href="http://localhost:5173/login" class="button">
                        Access Your Dashboard
                      </a>
                  </div>

                  <p style="margin-top: 40px;">We look forward to a productive partnership.</p>
                  <p>Best Regards,<br>
                  <span class="highlight">The GP-Asmara Team</span></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} GP-Asmara Supply Chain. All rights reserved.</p>
                  <p>This is an automated message, please do not reply to this email.</p>
              </div>
          </div>
      </body>
      </html>
    `;
};
