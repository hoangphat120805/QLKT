const express = require('express');
const router = express.Router();
const scientificAchievementController = require('../controllers/scientificAchievement.controller');
const { verifyToken, requireManager, requireAuth } = require('../middlewares/auth');

router.get('/', verifyToken, requireAuth, scientificAchievementController.getAchievements);
router.post('/', verifyToken, requireManager, scientificAchievementController.createAchievement);
router.put('/:id', verifyToken, requireManager, scientificAchievementController.updateAchievement);
router.delete(
  '/:id',
  verifyToken,
  requireManager,
  scientificAchievementController.deleteAchievement
);

module.exports = router;
