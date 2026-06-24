
const express = require('express');
const { register, login } = require('../controller/auth.controller');
const { isAuthenticated } = require('../middleware/middleware');

const router = express.Router();


router.post("/register",register)
router.post("/login",login);
router.post("/change-password",isAuthenticated,login);


module.exports = router
  