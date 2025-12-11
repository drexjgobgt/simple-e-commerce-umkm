const { check, validationResult } = require("express-validator");

const validateRegister = [
  check("email", "Email tidak valid").isEmail(),
  check("password", "Password minimal 6 karakter").isLength({ min: 6 }),
  check("name", "Nama wajib diisi").not().isEmpty(),
];

const validateRegisterVendor = [
  check("email", "Email tidak valid").isEmail(),
  check("password", "Password minimal 6 karakter").isLength({ min: 6 }),
  check("name", "Nama wajib diisi").not().isEmpty(),
  check("storeName", "Nama toko wajib diisi").not().isEmpty(),
  check("storePhone", "Nomor telepon toko wajib diisi").not().isEmpty(),
  check("storeAddress", "Alamat toko wajib diisi").not().isEmpty(),
];

const validateLogin = [
  check("email", "Email tidak valid").isEmail(),
  check("password", "Password wajib diisi").exists(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegister,
  validateRegisterVendor,
  validateLogin,
  handleValidationErrors,
};
