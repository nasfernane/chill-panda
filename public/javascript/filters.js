// VARIABLES
const filtersBtn = document.querySelector('#filtersButton');
const filtersForm = document.querySelector('.filters-form');

// FONCTIONS

// fonction qui crée une url en fonction des filtres sélectionnés et envoie sur la nouvelle page au submit du formulaire
const newSearch = function () {
    const sortBy = document.querySelector('#sort-by').value;
    const statusInputs = document.querySelectorAll('.filters-form__status input');

    let url = '/overview?';

    // si l'utilisateur a choisi un tri, ajoute à l'url
    if (sortBy) {
        url = url + `sort=${sortBy}&`;
    }

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
