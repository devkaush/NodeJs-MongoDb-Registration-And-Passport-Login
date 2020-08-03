if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const USER = require('./models/user')

//const initializePassport = require('./passport-config')
require('./passport-config')(passport)
//initializePassport(
//  passport,
//  email => users.find(user => user.email === email),
//  id => users.find(user => user.id === id)
//)

//initializePassport(
 //   passport,
 //   async (email) => await USER.findOne({email:email}),
 //   async (id) => await USER.findById(id)
  //)
const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('connected to Mongoose'))



app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) =>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword
        })

        const newUser = new USER({
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword 
        })

        await newUser.save()

        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
    console.log(users)
})

app.get('/seeall', async (req, res) =>{
    try{
        const allUsers = await USER.find()
        res.render('seeall.ejs',{ allUsers: allUsers})
    }catch (e){
        console.log(e)
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res)=>{
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(process.env.PORT || 3000)