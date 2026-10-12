const express = require('express');
const router = express.Router();
const { generateDesign, saveHistory } = require('../controllers/aiController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/generate-design', optionalProtect, generateDesign);
router.post('/history', protect, saveHistory);

module.exports = router;
