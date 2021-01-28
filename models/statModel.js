const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    _id: {
        year: [Number],
        month: [Number],
    },
    projectSum: Number,
    billsSum: Number,
    paidBillsSun: Number,
});

const Stat = mongoose.model('Stat', statsSchema);
module.exports = Stat;
