const express = require('express')
const router = express.Router()
const passport = require('passport')

const { checkNotAuthenticated } = require('../config/auth')

router.get('/', checkNotAuthenticated, (req, res) =>{
    res.render('login', {title:'Login'})
})

router.post('/', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

module.exports = router