const express=require('express');
const User=require('../models/user')
const router=express.Router();
const {createTokenForUser,validateToken} = require('../services/authentication');
router.get('/signin',(req,res)=>{
    res.render('signin');
})
router.get('/signup',(req,res)=>{
    res.render('signup');
})
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await User.matchPasswordAndCreateToken(email, password);
      // console.log(result)
        if (!result.success) {
            return res.render('signin', {error:'Incorrect email or password'});
        }
      //  console.log(result.token);
        return res.cookie('token',result.token).redirect('/')
    } catch (error) {
        return res.render('signin', {error:'Incorrect email or password'});
    }
});
router.post('/signup',async (req,res)=>{
    const {fullName,email,password}=req.body
    await User.create({
        fullName,
        email,
        password,
    })
    return res.redirect('/');
})
module.exports=router;