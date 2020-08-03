if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const USER = require('./models/user')

require('./passport-config')(passport)


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static('public'))
app.use(methodOverride('_method'))


mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('connected to Mongoose'))



app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name, title:'Dashboard' })
})

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('login.ejs', {title:'Login'})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs', {title:'Register'})
})

app.post('/register', checkNotAuthenticated, async (req, res) =>{
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
        res.redirect('/register')
    }
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