const express = require('express');
const router = express.Router();
const AboutUsController = require('../controllers/AboutUsControllers');

router.get('/', AboutUsController.getAboutUs);
router.put('/', AboutUsController.updateAboutUs);

module.exports = router;
