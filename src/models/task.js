const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = Schema({
    description : {
        type : String,
        required: true,
        trim: true
    },
    completed : {
        type : Boolean,
        default : false
    },
    owner : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema)

module.exports = Task;