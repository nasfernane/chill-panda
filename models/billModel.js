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
    projectId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
    },
    userId: {
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
        path: 'projectId',
        select: 'name',
    }).populate({
        path: 'userId',
        select: 'name',
    });

    next();
});

// hook post save qui ajoute la facture crée dans le projet concerné
billSchema.post('save', async (doc, next) => {
    const project = await Project.findOne({ _id: doc.projectId });
    project.bills.push(doc._id);
    project.save();

    next();
});

//
const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
