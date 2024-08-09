const { Login, Signup, getUsers } = require('../controllers/user.controller')

const userRouter=require('express').Router()

userRouter.post('/login',Login)
userRouter.post('/signup',Signup)
userRouter.get('/',getUsers)

module.exports=userRouter