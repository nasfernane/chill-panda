// VARIABLES
const filtersBtn = document.querySelector('#filtersButton');
const filtersForm = document.querySelector('.filters-form');

// FONCTIONS

// fonction qui crée une url en fonction des filtres sélectionnés et envoie sur la nouvelle page au submit du formulaire
const newSearch = function () {
    const sortBy = document.querySelector('#sort-by').value;
    const statusInputs = document.querySelectorAll('.filters-form__container--status input');
    const dateInputs = document.querySelectorAll('.filters-form__container--date input');

    let url = '/overview?';

    // si l'utilisateur a choisi un tri, ajoute à l'url
    if (sortBy) {
        url = url + `sort=${sortBy}&`;
    }

    // date min
    if (dateInputs[0].value) url = url + `&date[gte]=${dateInputs[0].value}`;
    // date max avec +1 sur le jour pour récupérer correctement LTE
    if (dateInputs[1].value) {
        const date = new Date(dateInputs[1].value);
        const maxDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`;
        url = url + `&date[lte]=${maxDate}`;
    }

    // boucle sur les inputs status pour vérifier si il y a une saisie et le cas échéant ajouter à l'url
    for (let i = 0; i < statusInputs.length; i++) {
        console.log(statusInputs[i]);
        if (statusInputs[i].checked) url = url + `status=${statusInputs[i].value}`;
    }

    console.log(url);
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
}
