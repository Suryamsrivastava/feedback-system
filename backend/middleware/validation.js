// Validation middleware for feedback submission
const validateFeedback = (req, res, next) => {
  const {
    order_id,
    name,
    email,
    experience,
    buddy_on_time,
    buddy_courteous,
    buddy_handling,
    buddy_pickup,
    sales_understanding,
    sales_clarity,
    sales_professionalism,
    sales_transparency,
    sales_followup,
    sales_decision,
    cx_onboarding,
    cx_courteous,
    cx_resolution,
    cx_communication,
    recommendation,
    tip_asked,
    tip_details,
    liked,
    improvement,
  } = req.body;

  const errors = [];

  // Required fields validation
  if (
    !order_id ||
    typeof order_id !== "string" ||
    order_id.trim().length === 0
  ) {
    errors.push("order_id is required and must be a non-empty string");
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("name is required and must be a non-empty string");
  }

  if (
    !experience ||
    !["very-poor", "poor", "average", "good", "excellent"].includes(experience)
  ) {
    errors.push(
      "experience is required and must be one of: very-poor, poor, average, good, excellent",
    );
  }

  if (recommendation === undefined || recommendation === null) {
    errors.push("recommendation is required");
  } else {
    const recValue = parseInt(recommendation);
    if (isNaN(recValue) || recValue < 0 || recValue > 10) {
      errors.push("recommendation must be a number between 0 and 10");
    }
  }

  if (!tip_asked || !["yes", "no"].includes(tip_asked)) {
    errors.push('tip_asked is required and must be either "yes" or "no"');
  }

  // Email validation (if provided)
  if (email && email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("email must be a valid email address");
    }
  }

  // Rating fields validation (1-5)
  const ratingFields = [
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
  ];

  const ratings = {
    buddy_on_time,
    buddy_courteous,
    buddy_handling,
    buddy_pickup,
    sales_understanding,
    sales_clarity,
    sales_professionalism,
    sales_transparency,
    sales_followup,
    sales_decision,
    cx_onboarding,
    cx_courteous,
    cx_resolution,
    cx_communication,
  };

  ratingFields.forEach((field) => {
    const value = ratings[field];
    if (value !== null && value !== undefined && value !== "") {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1 || numValue > 5) {
        errors.push(`${field} must be a number between 1 and 5`);
      }
    }
  });

  // Text field length validation (max 5000 characters)
  const textFields = { tip_details, liked, improvement };
  Object.entries(textFields).forEach(([field, value]) => {
    if (value && typeof value === "string" && value.length > 5000) {
      errors.push(`${field} must not exceed 5000 characters`);
    }
  });

  // Name length validation
  if (name && name.length > 255) {
    errors.push("name must not exceed 255 characters");
  }

  // Order ID format validation (alphanumeric, hyphens, underscores)
  if (order_id) {
    const orderIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!orderIdRegex.test(order_id)) {
      errors.push(
        "order_id must contain only letters, numbers, hyphens, and underscores",
      );
    }
    if (order_id.length > 50) {
      errors.push("order_id must not exceed 50 characters");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

module.exports = { validateFeedback };
