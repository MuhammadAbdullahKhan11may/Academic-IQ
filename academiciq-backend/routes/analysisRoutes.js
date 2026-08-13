const express = require('express');
const multer = require('multer');
const router = express.Router();
const { analyze, getHistory, getOne, deleteOne } = require('../controllers/analysisController');
const { uploadMarksheet } = require('../controllers/marksheetController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB, matches marksheetParser's own check
});

router.post('/analyze', analyze);
router.get('/history', getHistory);
router.get('/analyze/:id', getOne);
router.delete('/analyze/:id', deleteOne);
router.post('/marksheet', upload.single('marksheet'), uploadMarksheet);

module.exports = router;
