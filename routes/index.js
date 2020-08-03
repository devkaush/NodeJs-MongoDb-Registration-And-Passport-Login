const express = require('express')
const router = express.Router()

const { checkAuthenticated } = require('../config/auth')

router.get('/', checkAuthenticated, (req, res) => {
    res.render('index', { name: req.user.name, title:'Dashboard' })
})

module.exports = router