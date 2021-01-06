const mongoose = require('mongoose');

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
    projectId: String,
});

// billSchema.pre('save', async function (req, res, next) {
//     this.date = Date.now();
//     this.projectId = req.params.id;
// });

//
const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
