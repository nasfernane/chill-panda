const mongoose = require('mongoose');
const Project = require('./projectModel');

const billSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, `Vous devez renseigner un nom de facture`],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    price: {
        type: Number,
        required: true,
        min: 1,
    },
    endorsement: {
        type: Boolean,
        default: false,
    },
    billNumber: {
        type: Number,
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
});

// FIXME
// // middleware pre-find : selectionne seulement les utilisateurs actifs
// billSchema.pre(/^find/, function (next) {
//     console.log(this.req);
//     // pointe sur la requête en cours
//     this.find({ userId: this.userId });
//     next();
// });

billSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'project',
        select: 'name',
    }).populate({
        path: 'user',
        select: 'name',
    });

    next();
});

// // hook post save qui ajoute la facture créee dans le projet concerné
// billSchema.post('save', async (doc, next) => {
//     const project = await Project.findOne({ _id: doc.projectId });
//     project.bills.push(doc._id);
//     project.save();

//     next();
// });

//
const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
