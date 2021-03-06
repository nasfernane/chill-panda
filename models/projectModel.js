const mongoose = require('mongoose');

// schéma pour construire un nouveau Projet
const projectSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            default: Date.now(),
        },
        name: {
            type: String,
            required: [true, 'Le projet doit avoir un nom'],
            unique: true,
            trim: true,
            minlength: [4, `Le nom d'un projet doit contenir au moins 4 caractères`],
            maxlength: [30, `Le nom d'un projet doit contenir moins de 30 caractères`],
        },
        projectType: {
            type: String,
            required: [true, 'Il faut définir le type de projet'],
        },
        client: {
            type: String,
            required: [true, 'Il faut spécifier le nom du client'],
            trim: true,
        },
        quote: {
            type: Number,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            required: [true, 'Le projet doit avoir un statut'],
            // vérifie que le statut fait partie des 4 disponibles
            enum: {
                values: ['Avorté', 'En pause', 'En cours', 'Proposition', 'A régler', 'Terminé'],
                message: `Le statut d'un projet doit être défini sur: En cours, Proposition, A régler ou Terminé`,
            },
        },
        billsQuantity: {
            type: Number,
            default: 0,
        },
        billsTotal: {
            type: Number,
            default: 0,
        },
        quoteNumber: {
            type: Number,
        },
        alreadyPaid: {
            type: Number,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index
// Améliore les performances de lecture sur l'API. A régler en fonction des requêtes les plus utilisées
projectSchema.index({ date: 1, client: 1 });

// virtual populate pour les factures
projectSchema.virtual('bills', {
    ref: 'Bill',
    foreignField: 'project',
    localField: '_id',
    justOne: false,
});

// populate l'utilisateur
projectSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name',
    });
    next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
