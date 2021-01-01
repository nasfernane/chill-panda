// fonction pour remplaçer les try/catch blocs dans les fonctions async. Elle enveloppe les autres fonctions et se charge de faire suivre les erreurs.
module.exports = fn => (req, res, next) => {
    fn(req, res, next).catch(next);
};
