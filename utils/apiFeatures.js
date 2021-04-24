// créations d'une classe Features pour appliquer des méthodes aux requêtes API
class APIFeatures {
    // query => mongoose query, queryString => query from express (route)
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1-A) filtres
        // on hard copy la query
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1-B) filtres avancés
        let queryStr = JSON.stringify(queryObj);
        // remplace tous les gte, gt, lte et lt par les variantes avec $ pour les transformer en opérateurs mongodb
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        // sur une requête du style 127.0.0.1:8000/projects?sort=price
        if (this.queryString.sort) {
            // transforme les virgules en espace dans le paramètre sort pour implémenter un deuxième critère en cas d'égalité
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // filtre par défaut par date de création
            this.query = this.query.sort('-date');
        }

        return this;
    }

    limitFields() {
        // 3) limitation de champs de recherche
        if (this.queryString.fields) {
            // remplace les virgules par des espaces
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // sinon, par défaut, on inclut tous les fields sauf __v
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        // 4) mise en pages
        // ex : page=2&limit=10
        // transformation de la page en nombre, et valeur par défaut
        const page = this.queryString.page * 1 || 1;
        // transformation de la limite de résultats par page en nombre et valeur par défaut
        const limit = this.queryString.limit * 1 || 100;
        // calcul du nombre de résultats à sauter pour afficher la page demandée
        const skip = (page - 1) * limit;

        // on saute le nombre de résultats calculés en fonction de la page et de la limite
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
