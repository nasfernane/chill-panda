const mongoose = require('mongoose');

const yearStatsSchema = new mongoose.Schema({
    _id: {
        year: [Number],
    },
    projectTotal: Number,
    billTotal: Number,
    paidBillTotal: Number,
});

const Yearstat = mongoose.model('Yearstat', yearStatsSchema);
module.exports = Yearstat;
