const express = require('express');
const router = express.Router();
const positionHistoryController = require('../controllers/positionHistory.controller');
const { verifyToken, requireManager, requireAuth } = require('../middlewares/auth');

router.get('/', verifyToken, requireAuth, positionHistoryController.getPositionHistory);
router.post('/', verifyToken, requireManager, positionHistoryController.createPositionHistory);
router.put('/:id', verifyToken, requireManager, positionHistoryController.updatePositionHistory);
router.delete('/:id', verifyToken, requireManager, positionHistoryController.deletePositionHistory);

module.exports = router;
