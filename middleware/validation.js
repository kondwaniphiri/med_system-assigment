const { body, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Patient validation rules
const validatePatient = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  body("surname")
    .trim()
    .notEmpty()
    .withMessage("Surname is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Surname must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Surname can only contain letters, spaces, hyphens, and apostrophes"
    ),

  body("insurance")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Insurance name must not exceed 100 characters"),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[\d\s+()-]+$/)
    .withMessage("Invalid phone number format"),

  body("street")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Street must not exceed 100 characters"),

  body("town")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Town must not exceed 50 characters"),

  body("province")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Province must not exceed 50 characters"),

  handleValidationErrors,
];

// Staff validation rules
const validateStaff = [
  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  body("surname")
    .trim()
    .notEmpty()
    .withMessage("Surname is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Surname must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Surname can only contain letters, spaces, hyphens, and apostrophes"
    ),

  body("position")
    .trim()
    .notEmpty()
    .withMessage("Position is required")
    .isIn(["Doctor", "Nurse", "Administrator", "Technician", "Receptionist"])
    .withMessage("Invalid position"),

  body("SSN")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage("SSN must not exceed 20 characters"),

  body("street")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Street must not exceed 100 characters"),

  body("town")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Town must not exceed 50 characters"),

  body("province")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Province must not exceed 50 characters"),

  handleValidationErrors,
];

// ID validation
const validateId = [
  body("id")
    .notEmpty()
    .withMessage("ID is required")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer"),

  handleValidationErrors,
];

// Relationship validation
const validateDoctorPatient = [
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isInt({ min: 1 })
    .withMessage("Doctor ID must be a positive integer"),

  body("patientId")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isInt({ min: 1 })
    .withMessage("Patient ID must be a positive integer"),

  handleValidationErrors,
];

const validateNurseWard = [
  body("nurseId")
    .notEmpty()
    .withMessage("Nurse ID is required")
    .isInt({ min: 1 })
    .withMessage("Nurse ID must be a positive integer"),

  body("wardId")
    .notEmpty()
    .withMessage("Ward ID is required")
    .isInt({ min: 1 })
    .withMessage("Ward ID must be a positive integer"),

  handleValidationErrors,
];

const validatePatientWard = [
  body("patientId")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isInt({ min: 1 })
    .withMessage("Patient ID must be a positive integer"),

  body("wardId")
    .notEmpty()
    .withMessage("Ward ID is required")
    .isInt({ min: 1 })
    .withMessage("Ward ID must be a positive integer"),

  handleValidationErrors,
];

module.exports = {
  validatePatient,
  validateStaff,
  validateId,
  validateDoctorPatient,
  validateNurseWard,
  validatePatientWard,
  handleValidationErrors,
};
