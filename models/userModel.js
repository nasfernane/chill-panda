// module Node pour fonctionnalités cryptographiques, wrappers, hash, etc.
const crypto = require('crypto');
// lib ODM pour mongoDB
const mongoose = require('mongoose');
// lib pour faciliter validators
const validator = require('validator');
// lib encryptage mdp
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
    role: {
        type: String,
        enum: ['user', 'admin', 'bebe-panda', 'papa-panda'],
        default: 'user',
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
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// hook pre-save : cryptage des mots de passe avant de stocker dans la bdd
userSchema.pre('save', async function (next) {
    // si le mot de passe n'a pas été modifié ou créé à l'instant, on skip ce middleware
    if (!this.isModified('password')) return next();

    // hashage asynchrone du mot de passe, avec un paramètre de coût à 12 (par défaut 10)
    this.password = await bcrypt.hash(this.password, 12);

    // le mot de passe de confirmation n'est plus nécessaire
    this.passwordConfirm = undefined;

    next();
});

// hook pre-save : création d'un slug basé sur le nom
userSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// hook pre-save : maj de la date de modification du mdp
userSchema.pre('save', function (next) {
    // si le mot de passe n'a pas été modifié ou si c'est un nouveau document, on skip ce middleware, sinon...
    if (!this.isModified('password') || this.isNew) return next();
    // ... on met à jour la date de modification du mdp. On enlève une seconde être sûr que le token soit créé après la modification
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// middleware pre-find : selectionne seulement les utilisateurs actifs
userSchema.pre(/^find/, function (next) {
    // pointe sur la requête en cours
    this.find({ active: { $ne: false } });
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

// méthode instanciée pour générer un token aléatoire quand l'utilisateur modifie son mdp
userSchema.methods.createPasswordResetToken = function () {
    // token aléatoire crypté de 32 bytes, qu'on transforme en chaîne de caractères hexadécimale
    const resetToken = crypto.randomBytes(32).toString('hex');
    // hash le token en sha256 et le stocke dans la bdd utilisateur
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({ resetToken }, this.passwordResetToken);
    // définit l'expiration du token aléatoire à 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
