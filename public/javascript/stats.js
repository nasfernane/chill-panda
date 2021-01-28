const yearTitles = document.querySelectorAll('.year-title')
const monthTitles = document.querySelectorAll('.month-title')
const statsContainer = document.querySelector('.stats-container')



window.addEventListener('load', function () {
    // mofifie le nom du mois en fonction des données mensuelles
    if (statsContainer) {

        // boucle sur les titres d'année pour supprimer les doublons
        const checkArray = []
        for (let i = 0; i < yearTitles.length; i++) {
                if (checkArray.includes(yearTitles[i].innerText)) {
                    yearTitles[i].innerText = '';
                } else {
                    checkArray.push(yearTitles[i].innerText)
                }
            }


        for (let i = 0; i < monthTitles.length; i++) {
            console.log(monthTitles[i].innerText)
            switch (monthTitles[i].innerText) {
                case '1':
                    monthTitles[i].innerText = 'Janvier'
                    break;
                case '2':
                    monthTitles[i].innerText = 'Février'
                    break;
                case '3':
                    monthTitles[i].innerText = 'Mars'
                    break;
                case '4':
                    monthTitles[i].innerText = 'Avril'
                    break;
                case '5':
                    monthTitles[i].innerText = 'Mai'
                    break;
                case '6':
                    monthTitles[i].innerText = 'Juin'
                    break;
                case '7':
                    monthTitles[i].innerText = 'Juillet'
                    break;
                case '8':
                    monthTitles[i].innerText = 'Aout'
                    break;
                case '9':
                    monthTitles[i].innerText = 'Septembre'
                    break;
                case '10':
                    monthTitles[i].innerText = 'Octobre'
                    break;
                case 'Novembre':
                    monthTitles[i].innerText = 'Novembre'
                    break;
                case 'Décembre':
                    monthTitles[i].innerText = 'Décembre'
                    break;
            }


        }
}
})

