const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    name: String,
    date: {
        type: Date,
        required: [true, `La date de la facture est manquante`],
    },
    number: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    endorsement: Boolean,
    projectId: String,
});

//
const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
