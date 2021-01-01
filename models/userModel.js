// voir tourModel.js pour commentaires de structure
const mongoose = require('mongoose');
// librairie pour faciliter validators
const validator = require('validator');
// librairie encryptage mdp
const bcrypt = require('bcryptjs');
// créations de slugs
const slugify = require('slugify');

// création du schéma
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, `Vous devez renseigner un nom d'utilisateur`],
        trim: true,
        mexlength: [30, `Votre nom ne doit pas contenir plus de 30 caractères`],
        minlength: [2, `Votre nom doit contenir au moins 2 caractères`],
    },
    email: {
        type: String,
        required: [true, `Vous devez renseigner votre adresse e-mail`],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, `Le format de votre adresse mail n'est pas valide`],
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, `Vous devez renseigner un mot de passe`],
        minlength: [8, 'Votre mot de passe doit contenir au moins 8 caractères'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        validate: {
            // IMPORTANT effectif uniquement sur create et save
            validator: function (val) {
                return val === this.password;
            },
            message: 'Vos mots de passe ne correspondent pas',
        },
    },
    passwordChangedAt: Date,
});

// cryptage des mots de passe
userSchema.pre('save', async function (next) {
    // si le mot de passe n'a pas été modifié ou créé à l'instant, on skip ce middleware
    if (!this.isModified('password')) return next();

    // hashage asynchrone du mot de passe, avec un paramètre de coût à 12 (par défaut 10)
    this.password = await bcrypt.hash(this.password, 12);

    // le mot de passe de confirmation n'est plus nécessaire
    this.passwordConfirm = undefined;

    next();
});

// création d'un slug basé sur le nom
userSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// méthode instanciée pour comparer le mot de passe crypté avec la saisie utilisateur
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// méthode instanciée pour vérifier si l'utilisateur a modifié son mdp après la délivrance de son jwt
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        // récupère la date du changement de mdp en timestamp, puis transforme en secondes sous forme d'entier
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    // si l'utilisateur n'a pas changé son mdp
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
