if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')

require('./passport-config')(passport)

const indexRouter = require('./routes/index')
const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')



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
//db.once('open', () => console.log('connected to Mongoose'))


app.use('/', indexRouter)
app.use('/register', registerRouter)
app.use('/login', loginRouter)


//app.get('/seeall', async (req, res) =>{
//    try{
//        const allUsers = await USER.find()
//        res.render('seeall.ejs',{ allUsers: allUsers, title:'All Users'})
//    }catch{
//        res.redirect('/register')
//    }
//})

app.delete('/logout', (req, res)=>{
    req.logOut()
    res.redirect('/login')
})

app.listen(process.env.PORT || 3000)