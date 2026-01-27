const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailConfig {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    const emailProvider = process.env.EMAIL_PROVIDER || "gmail";

    if (emailProvider === "gmail") {
      this.transporter = this.createGmailTransporter();
    } else {
      this.transporter = this.createSMTPTransporter();
    }
  }

  createGmailTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  createSMTPTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  getTransporter() {
    if (!this.transporter) {
      throw new Error("Email transporter not initialized");
    }
    return this.transporter;
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email server connection verified");
      return true;
    } catch (error) {
      console.error("❌ Email server connection failed:", error.message);
      return false;
    }
  }

  getSenderEmail() {
    return process.env.EMAIL_FROM || process.env.EMAIL_USER;
  }

  getSenderName() {
    return process.env.EMAIL_FROM_NAME || "Store My Goods";
  }
}

module.exports = new EmailConfig();
