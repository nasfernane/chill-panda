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

// Index
// Améliore les performances de lecture sur l'API. A régler en fonction des requêtes les plus utilisées
billSchema.index({ price: 1, createdAt: 1 });

// CANCELLED
// // middleware pre-find : selectionne seulement les utilisateurs actifs
// billSchema.pre(/^find/, function (next) {
//     console.log(this.req);
//     // pointe sur la requête en cours
//     this.find({ userId: this.userId });
//     next();
// });

//
const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
