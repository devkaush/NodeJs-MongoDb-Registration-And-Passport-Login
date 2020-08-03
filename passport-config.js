const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const USER = require('./models/user')

//function intialize(passport, getUserByEmail, getUserById){
function intialize(passport){
    const authenticateUser = async (email, password, done) => {
        //const user = getUserByEmail(email)
        const user = await USER.findOne({email:email})
        if(user == null){
            return done(null, false, { message:'No user with that email' })
        }

        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            }else{
                return done(null, false, { message: 'Password incorrect' })
            }
        }catch (e){
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        await USER.findById(id, function(err, user){
            done(err, user)
        })
        //return done(null, getUserById(id))
    })
}

module.exports = intialize