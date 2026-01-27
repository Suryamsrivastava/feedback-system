const emailConfig = require("../config/email");
const fs = require("fs").promises;
const path = require("path");

class EmailService {
  async sendFeedbackEmail({ to, customerName, feedbackLink, orderDate }) {
    try {
      const transporter = emailConfig.getTransporter();

      const htmlContent = await this.getFeedbackEmailTemplate({
        customerName,
        feedbackLink,
        orderDate,
      });

      const mailOptions = {
        from: `${emailConfig.getSenderName()} <${emailConfig.getSenderEmail()}>`,
        to: to,
        subject: "Share Your Feedback - Store My Goods",
        html: htmlContent,
        text: this.getFeedbackEmailText({
          customerName,
          feedbackLink,
          orderDate,
        }),
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send email: " + error.message);
    }
  }

  async getFeedbackEmailTemplate(data) {
    try {
      const templatePath = path.join(
        __dirname,
        "../templates/feedbackEmail.html",
      );
      let template = await fs.readFile(templatePath, "utf8");

      template = template
        .replace(/{{customerName}}/g, data.customerName)
        .replace(/{{feedbackLink}}/g, data.feedbackLink)
        .replace(/{{orderDate}}/g, data.orderDate || "recently")
        .replace(/{{year}}/g, new Date().getFullYear());

      return template;
    } catch (error) {
      console.warn("Template file not found, using fallback template");
      return this.getInlineFeedbackTemplate(data);
    }
  }

  getInlineFeedbackTemplate({ customerName, feedbackLink, orderDate }) {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Feedback Request</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="background-color: #16a34a; padding: 30px; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Store My Goods</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">
                                            Hi ${customerName},
                                        </h2>
                                        <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                            Thank you for choosing Store My Goods! We hope you had a great experience with our service.
                                        </p>
                                        <p style="margin: 0 0 25px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                            We'd love to hear your feedback. Your input helps us improve our services and serve you better.
                                        </p>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <a href="${feedbackLink}" 
                                                       style="display: inline-block; padding: 15px 40px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                                                        Share Your Feedback
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 25px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                            If the button doesn't work, copy and paste this link into your browser:<br>
                                            <a href="${feedbackLink}" style="color: #16a34a; word-break: break-all;">${feedbackLink}</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
                                        <p style="margin: 0; color: #999999; font-size: 12px;">
                                            © ${new Date().getFullYear()} Store My Goods. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
  }

  getFeedbackEmailText({ customerName, feedbackLink, orderDate }) {
    return `
Hi ${customerName},

Thank you for choosing Store My Goods! We hope you had a great experience with our service.

We'd love to hear your feedback. Your input helps us improve our services and serve you better.

Please share your feedback by clicking the link below:
${feedbackLink}

Thank you for your time!

Best regards,
Store My Goods Team
        `.trim();
  }
}

module.exports = new EmailService();
