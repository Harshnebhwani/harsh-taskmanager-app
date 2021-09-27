const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth')
const { welcomeEmail, cancelEmail } = require('../emails/account');
const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {

        await user.save();
        welcomeEmail(user.email, user.name)
        const token = await user.generateToken();

        res.status(201).send({ user , token});

    } catch (error) {
        res.status(400).send(error);   
    }

});

router.post('/users/login', async (req, res) => {

    try {

        const user = await User.findByCredentials(req.body.email , req.body.password);
        const token = await user.generateToken();
        return res.status(200).send({ user, token});

    } catch (error) {

        return res.status(400).send({error:"Unable to login"});
    }

});

router.post('/users/logout', auth, async (req, res) => {

    try {

        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        return res.send();

    } catch (error) {

        return res.status(500).send();
    }

});

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = [];
        await req.user.save();
        return res.send();
    } catch (error) {
        return res.status(500).send();
    }

});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {

    const paramsAllowed = ["name","email","password","age"];
    const reqParams = Object.keys(req.body);
    const isParamsValid = reqParams.every( (param) => paramsAllowed.includes(param) );

    if(!isParamsValid)
    {
        return res.status(400).send({error : "Invalid Parameters!"});
    }

    try {

        reqParams.forEach((param) => req.user[param] = req.body[param]);

        await req.user.save();

        res.send(req.user);

    } catch (error) {
        res.status(400).send(error);   
    }

});

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove();
        cancelEmail(req.user.email, req.user.name)
        res.send(req.user);

    } catch (error) {
        res.status(500).send(error);   
    }

});

const upload = multer({
    limits: {
        filesize: 100000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image!'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth ,upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send();
}, (error, req, res, next) => {
    if(error.message)
    {
        res.status(400).send(error.message)
    }
})

router.delete('/users/me/avatar', auth , async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send();
})

router.get('/users/:id/avatar' , async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if(!user || !user.avatar)
        {
            throw new Error()
        }

        res.set('Content-Type','image/png');
        res.send(user.avatar);

    } catch (error) {
        res.status(404).send();
    }
})

module.exports = router