const router = require('express').Router()
const report = require('./report.route')

// Export all routes
router.get('/heartbeat', (req, res) => {
  res.json({
    status: 'online'
  })
})

router.use('/', report)

module.exports = router
