const filtersBtn = document.querySelector('#filtersButton');

if (filtersBtn) {
    filtersBtn.addEventListener('click', e => {
        const filters = document.querySelector('.filtersCard');
        filters.classList.toggle('filtersCard--hide');
    });
}
