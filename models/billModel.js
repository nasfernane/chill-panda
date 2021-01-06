const mongoose = require('mongoose');
const Project = require('./projectModel');

const billSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, `Vous devez renseigner un nom de facture`],
    },
    date: {
        type: Date,
    },
    price: {
        type: Number,
        required: true,
    },
    endorsement: {
        type: Boolean,
        default: false,
    },
    number: {
        type: Number,
    },
    projectId: mongoose.Schema.ObjectId,
    userId: mongoose.Schema.ObjectId,
});

// hook post save qui ajoute la facture crée dans le projet concerné
billSchema.post('save', async (doc, next) => {
    const project = await Project.findOne({ _id: doc.projectId });
    console.log(doc);
    project.bills.push(doc._id);
    project.save();

    next();
});

//
const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
