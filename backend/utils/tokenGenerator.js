const crypto = require("crypto");

class TokenGenerator {
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  }

  static generateExpirationDate(hours = 72) {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + hours);
    return expiration;
  }

  static isTokenExpired(expirationDate) {
    return new Date() > new Date(expirationDate);
  }
}

module.exports = TokenGenerator;
