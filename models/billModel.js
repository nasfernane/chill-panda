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
    paid: {
        type: Boolean,
        required: [true, `Vous devez renseigner l'état de la facture`],
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

    const settlementSum = await this.aggregate([
        {
            // phase 1 : récupère les factures payées
            $match: { project: projectId, paid: true },
        },
        {
            $group: {
                _id: '$project',
                // calcul de la somme des factures déjà payées
                paidSum: { $sum: '$price' },
            },
        },
    ]);

    // mise à jour de la quantité de factures et leur montant total
    if (stats.length > 0) {
        // si des factures sont trouvées...
        await Project.findByIdAndUpdate(projectId, {
            // ...met à jour les infos du projet
            billsQuantity: stats[0].billsQuantity,
            billsTotal: stats[0].billsTotal,
        });
    } else {
        // Si aucun résultat (après suppression d'une facture)...
        await Project.findByIdAndUpdate(projectId, {
            // ... remet les infos du projet à 0
            billsQuantity: 0,
            billsTotal: 0,
        });
    }

    // mise à jour du montant déjà réglé
    if (settlementSum.length > 0) {
        // si des factures sont trouvées...
        await Project.findByIdAndUpdate(projectId, {
            // ...met à jour les infos du projet
            alreadyPaid: settlementSum[0].paidSum,
        });
    } else {
        // Si aucun résultat
        await Project.findByIdAndUpdate(projectId, {
            // ... détermine la somme à 0
            alreadyPaid: 0,
        });
    }
};

billSchema.post('save', function (next) {
    // this pointe sur la facture
    // Le modèle n'est pas encore déclaré, on utilise donc this.constructor pour pointer dessus
    this.constructor.calcSumBills(this.project);
});

// pour executer calcSumBills sur findOneAndDelete ou findOneAndUpdate, on ajoute deux hooks. Le premier en pre hook sur toutes les requêtes findOne, qui crée une variable sur l'objet de la requête  pour pouvoir la faire passer au post middleware. Dans le hook post query, la requête a déjà été exécutée donc on ne peut pas récupérée l'id du projet directement sur la facture, mais on peut utiliser r pour exécuter la méthode calcSumBills sur le constructor, mettant ainsi le projet à chaque fois qu'une facture est modifiée ou supprimée.
billSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    console.log(this.r);
    next();
});

billSchema.post(/^findOneAnd/, async function (next) {
    await this.r.constructor.calcSumBills(this.r.project);
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
