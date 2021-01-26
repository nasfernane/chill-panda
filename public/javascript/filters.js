// VARIABLES
const filtersBtn = document.querySelector('#filtersButton');
const filtersForm = document.querySelector('.filters-form');

// FONCTIONS

// fonction qui pré-remplit les filtres si une recherche est en cours pour les garder en mémoire

const fillSearch = function () {
    // si une recherche est en cours
    if (window.location.search) {
        // laisse la fenêtre de filtres affichée par défaut
        document.querySelector('.filtersCard').classList.remove('filtersCard--hide');

        // récupère tous les filtres...
        const query = window.location.search.substring(1);
        // ... et les divise en variables
        const variables = query.split('&');

        // pré-remplit les filtres en fonction de l'url
        for (let i = 0; i < variables.length; i++) {
            const el = variables[i].split('=');
            console.log(el);

            if (el[0].includes('sort')) document.querySelector('#sort-by').value = el[1];

            if (el[0].includes('date[gte]')) document.querySelector('#date-start').value = el[1];
            if (el[0].includes('date[lte]')) document.querySelector('#date-finish').value = el[1];

            if (el[0].includes('quote[gte]'))
                document.querySelector('#filter-quote-gte').value = el[1];
            if (el[0].includes('quote[lte]'))
                document.querySelector('#filter-quote-lte').value = el[1];

            if (el[0].includes('status')) {
                // boucle sur le status pour pallier au problème d'encodage
                switch (el[1]) {
                    case 'Termin%C3%A9':
                        document.querySelector('#filterByStatus').value = 'Terminé';
                    case 'En%20cours':
                        document.querySelector('#filterByStatus').value = 'En cours';
                    case 'A%20r%C3%A9gler':
                        document.querySelector('#filterByStatus').value = 'A régler';
                    case 'Proposition':
                        document.querySelector('#filterByStatus').value = 'Proposition';
                }
            }
        }
    }
};

// fonction qui crée une url en fonction des filtres sélectionnés et envoie sur la nouvelle page au submit du formulaire
const newSearch = function () {
    // récupération des éléments
    const sortBy = document.querySelector('#sort-by').value;
    const statusInputs = document.querySelectorAll('.filters-form__container--status input');
    const dateInputs = document.querySelectorAll('.filters-form__container--date input');
    const filterByStatus = document.querySelector('#filterByStatus').value;
    const filterQuoteGte = document.querySelector('#filter-quote-gte').value;
    const filterQuoteLte = document.querySelector('#filter-quote-lte').value;

    // création d'une url de base
    let url = '/overview?';

    // si l'utilisateur a choisi un tri, ajoute à l'url
    if (sortBy) {
        url = url + `sort=${sortBy}`;
    }

    // date min
    if (dateInputs[0].value) url = url + `&date[gte]=${dateInputs[0].value}`;
    // date max avec +1 sur le jour et adaptation du mois pour récupérer correctement LTE
    if (dateInputs[1].value) url = url + `&date[lte]=${dateInputs[1].value}`;

    // filtrer par statut
    if (filterByStatus) {
        url = url + `&status=${filterByStatus}`;
    }

    // filtrer par montant du devis
    if (filterQuoteGte) url = url + `&quote[gte]=${filterQuoteGte}`;
    if (filterQuoteLte) url = url + `&quote[lte]=${filterQuoteLte}`;

    // refresh la page avec l'url modifiée selon la saisie utilisateur
    window.location.replace(url);
};

// EVENTS
if (filtersBtn) {
    filtersBtn.addEventListener('click', e => {
        const filters = document.querySelector('.filtersCard');
        filters.classList.toggle('filtersCard--hide');
    });
}

if (filtersForm) {
    filtersForm.addEventListener('submit', e => {
        e.preventDefault();
        newSearch();
    });

    window.addEventListener('load', () => {
        fillSearch();
    });
}
