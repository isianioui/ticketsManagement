// /routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');



router.get('/', (req, res) => {
    res.render('login');
});

router.get('/login', authController.getLoginPage);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);

module.exports = router;
