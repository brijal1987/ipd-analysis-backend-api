const express = require('express')
const router = express.Router()
const reportController = require('../controllers/report.controller')

router.get('/exit', reportController.exit)
router.post('/ingest', reportController.ingest)
router.get('/categories', reportController.categories)
router.post('/summary', reportController.summary)
router.post('/generate_report', reportController.generate_report)
router.get('/generate_report/:filename', reportController.get_file)

module.exports = router
