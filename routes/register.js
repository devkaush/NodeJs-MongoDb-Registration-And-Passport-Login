const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const USER = require('../models/user')
const { checkNotAuthenticated } = require('../config/auth')

router.get('/', checkNotAuthenticated, (req, res) =>{
    res.render('register', {title:'Register'})
})

router.post('/', checkNotAuthenticated, async (req, res) =>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const newUser = new USER({
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword 
        })

        await newUser.save()

        res.redirect('/login')
    }catch{
        res.redirect('/')
    }
})

module.exports = router