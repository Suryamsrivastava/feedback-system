const { google } = require("googleapis");
require("dotenv").config();

class GoogleSheetsService {
  constructor() {
    this.sheetId = process.env.GOOGLE_SHEET_ID;
    this.auth = null;
    this.sheets = null;
  }

  async initialize() {
    try {
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;
      if (privateKey) {
        privateKey = privateKey.replace(/^["']|["']$/g, "");
        privateKey = privateKey.replace(/\\n/g, "\n");
      }

      this.auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        privateKey,
        ["https://www.googleapis.com/auth/spreadsheets"],
      );

      await this.auth.authorize();
      this.sheets = google.sheets({ version: "v4", auth: this.auth });
      console.log("Google Sheets API initialized successfully");
      await this.ensureHeadersExist();

      return true;
    } catch (error) {
      console.error("Error initializing Google Sheets:", error.message);
      throw error;
    }
  }

  async ensureHeadersExist() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: "Sheet1!A1:Z1",
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0 || !rows[0] || rows[0].length === 0) {
        await this.addHeaders();
      }
    } catch (error) {
      await this.addHeaders();
    }
  }

  async addHeaders() {
    try {
      const headers = [
        "id",
        "order_id",
        "name",
        "experience",
        "buddy_on_time",
        "buddy_courteous",
        "buddy_handling",
        "buddy_pickup",
        "sales_understanding",
        "sales_clarity",
        "sales_professionalism",
        "sales_transparency",
        "sales_followup",
        "sales_decision",
        "cx_onboarding",
        "cx_courteous",
        "cx_resolution",
        "cx_communication",
        "recommendation",
        "tip_asked",
        "tip_details",
        "liked",
        "improvement",
        "created_at",
        "email",
        "form_type",
        "service_complete_datetime",
        "feedback_token",
        "feedback_link",
        "feedback_sent_at",
        "feedback_submitted_at",
        "token_expires_at",
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: "Sheet1!A1",
        valueInputOption: "RAW",
        resource: {
          values: [headers],
        },
      });

      // Format headers (bold, background color)
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.27,
                      green: 0.45,
                      blue: 0.77,
                    },
                    textFormat: {
                      foregroundColor: {
                        red: 1.0,
                        green: 1.0,
                        blue: 1.0,
                      },
                      bold: true,
                    },
                    horizontalAlignment: "CENTER",
                  },
                },
                fields:
                  "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
              },
            },
          ],
        },
      });

      console.log("Headers added to Google Sheet");
    } catch (error) {
      console.error("Error adding headers:", error.message);
      throw error;
    }
  }

  async saveFeedback(feedbackData) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const rowData = [
        feedbackData.id || "",
        feedbackData.order_id || "",
        feedbackData.name || "",
        feedbackData.experience || "",
        feedbackData.buddy_on_time || "",
        feedbackData.buddy_courteous || "",
        feedbackData.buddy_handling || "",
        feedbackData.buddy_pickup || "",
        feedbackData.sales_understanding || "",
        feedbackData.sales_clarity || "",
        feedbackData.sales_professionalism || "",
        feedbackData.sales_transparency || "",
        feedbackData.sales_followup || "",
        feedbackData.sales_decision || "",
        feedbackData.cx_onboarding || "",
        feedbackData.cx_courteous || "",
        feedbackData.cx_resolution || "",
        feedbackData.cx_communication || "",
        feedbackData.recommendation || "",
        feedbackData.tip_asked || "",
        feedbackData.tip_details || "",
        feedbackData.liked || "",
        feedbackData.improvement || "",
        feedbackData.created_at || new Date().toISOString(),
        feedbackData.email || "",
        feedbackData.form_type || "customer_satisfaction",
        feedbackData.service_complete_datetime || "",
        feedbackData.feedback_token || "",
        feedbackData.feedback_link || "",
        feedbackData.feedback_sent_at || "",
        feedbackData.feedback_submitted_at || "",
        feedbackData.token_expires_at || "",
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: "Sheet1!A:Z",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: [rowData],
        },
      });

      console.log("Feedback saved to Google Sheets successfully");
      return true;
    } catch (error) {
      console.error("Error saving feedback to Google Sheets:", error.message);
      throw error;
    }
  }

  async getAllFeedbacks() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: "Sheet1!A2:Z",
      });

      const rows = response.data.values;
      return rows || [];
    } catch (error) {
      console.error("Error reading Google Sheets:", error.message);
      return [];
    }
  }

  async getRowCount() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: "Sheet1!A:A",
      });

      const rows = response.data.values;
      return rows ? rows.length - 1 : 0;
    } catch (error) {
      console.error("Error getting row count:", error.message);
      return 0;
    }
  }
}

module.exports = new GoogleSheetsService();
