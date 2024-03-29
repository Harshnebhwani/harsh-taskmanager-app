const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }

});

router.get('/tasks', auth, async (req, res) => {
    try {
        // const tasks = await Task.find({ owner: req.user._id });
        const match = {};
        const sort = {};

        if(req.query.completed)
        {
            match.completed = req.query.completed === 'true'
        }

        if(req.query.sortBy)
        {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc'? -1 : 1;
        }

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit:parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send();
    }

});

router.get('/tasks/:id', auth ,async (req, res) => {

    const _id = req.params.id;

    try {
        
        const task = await Task.findOne( {_id, owner: req.user._id } );

        if(!task)
        {
            return res.status(404).send(task);    
        }

        res.status(200).send(task);

    } catch (error) {
        res.status(500).send(error);
    }

});

router.patch('/tasks/:id', auth, async (req, res) => {

    const paramsAllowed = ["description","completed"];
    const reqParams = Object.keys(req.body);
    const isParamsValid = reqParams.every( (param) => paramsAllowed.includes(param) );

    if(!isParamsValid)
    {
        return res.status(400).send({error : "Invalid Parameters!"});
    }

    try {

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if(!task)
        {
            return res.status(404).send();
        }

        reqParams.forEach((param) => {
            task[param] = req.body[param];
        });      

        await task.save();

        res.send(task);

    } catch (error) {
        res.status(400).send(error);   
    }

});

router.delete('/tasks/:id', auth, async (req, res) => {

    try {

        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if(!task)
        {
            return res.status(404).send();
        }

        res.send(task);

    } catch (error) {
        res.status(404).send(error);   
    }

});

module.exports = router