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

// fonction pour calculer le nombre de factures et leur somme pour un projet. Elle sera appellé en post save à chaque création de facture pour mettre à jour les infos du projet concerné
billSchema.statics.calcSumBills = async function (projectId) {
    //Appel de la fonction aggregate sur le modèle
    const stats = await this.aggregate([
        {
            // phase 1 : récupère le projet sur son ID
            $match: { project: projectId },
        },
        {
            $group: {
                _id: '$project',
                // calcul du nombre de factures...
                billsQuantity: { $sum: 1 },
                // ... et de leur somme
                billsTotal: { $sum: '$price' },
            },
        },
    ]);
    console.log(stats);

    // met à jour les infos du projet
    await Project.findByIdAndUpdate(projectId, {
        billsQuantity: stats[0].billsQuantity,
        billsTotal: stats[0].billsTotal,
    });
};

billSchema.post('save', function (next) {
    // this pointe sur la facture
    // Le modèle n'est pas encore déclaré, on utilise donc this.constructor pour pointer dessus
    this.constructor.calcSumBills(this.project);
});

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
