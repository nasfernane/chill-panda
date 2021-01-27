import { showAlert } from './alert.js';

// VARIABLES
//

const editBillModal = document.querySelector('.editBill-modal');
const editBillButtons = Array.from(document.querySelectorAll('.editBillButton'));
const editCloseButton = document.querySelector('.editBill-modal__content span.close');
const editBillForm = document.querySelector('.editBill-form');
let billId;

// FONCTIONS
//

const editBill = async (billName, price, category, state) => {
    // récupère l'id du projet sur lequel créer une nouvelle facture
    const projectId = window.location.href.split('/')[4];

    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/bills/${billId}`,
            data: {
                billName,
                price,
                category,
                state,
            },
        });

        if (res.data.status === 'success') {
            await showAlert('success', 'Facture modifiée');
            window.setTimeout(() => {
                location.reload();
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

// EVENTS
//

// faire disparaitre la fenêtre modèle édition facture
if (editCloseButton) {
    editCloseButton.addEventListener('click', () => {
        editBillModal.style.display = 'none';
    });
}

// A chaque clic sur un bouton d'édition de facture, récupère le parent pour pré-remplir les valeurs de la facture initiale
editBillButtons.forEach(el => {
    el.addEventListener('click', e => {
        // reset attributs d'autres factures regardées auparavent
        document.querySelector('#edit-category-deposit').removeAttribute('checked');
        document.querySelector('#edit-category-amendment').removeAttribute('checked');
        document.querySelector('#edit-state-paid').removeAttribute('checked');
        document.querySelector('#edit-state-waiting').removeAttribute('checked');
        document.querySelector('#edit-category-bill').removeAttribute('checked');

        // remplit la modale d'édition
        billId = e.target.getAttribute('data-id');
        let billCard = e.target.parentNode.parentNode;

        // nom de la facture initiale
        document.querySelector('#edit-bill-name').value = billCard.firstChild.firstChild.innerText;
        //date
        document.querySelector('#edit-bill-date').innerText =
            billCard.firstChild.children[1].innerText;
        // numéro facture
        document.querySelector('#edit-bill-number').innerText =
            billCard.children[1].firstChild.firstChild.innerText;
        // montant devis
        document.querySelector(
            '#edit-bill-price'
        ).value = billCard.children[1].firstChild.children[1].innerText.split(' ')[3];
        // catégorie. Facture est checked par défault donc on vérifie seulement pour les acomptes et avenants
        if (billCard.children[1].firstChild.children[2].innerText.split(' ')[2] === 'Acompte') {
            document.querySelector('#edit-category-deposit').setAttribute('checked', true);
        } else if (
            billCard.children[1].firstChild.children[2].innerText.split(' ')[2] === 'Avenant'
        ) {
            document.querySelector('#edit-category-amendment').setAttribute('checked', true);
        } else {
            document.querySelector('#edit-category-bill').setAttribute('checked', true);
        }
        // Etat. Facture est checked par défault donc on vérifie seulement pour les acomptes et avenants. Affiche également la date de règlement en fonction de l'état
        if (
            Number.isInteger(
                parseInt(billCard.children[1].firstChild.children[3].innerText.split(' : ')[1])
            )
        ) {
            document.querySelector('#edit-state-paid').setAttribute('checked', true);
            document
                .querySelector('#edit-settlement-date')
                .classList.remove('form__group--settlementDate--hide');

            // déconstruit la date de règlement pour la rendre reconnaissable par l'input
            const tempDate = billCard.children[1].firstChild.children[3].innerText
                .split(' : ')[1]
                .split('/');
            const newDate = `${tempDate[2]}-${tempDate[1]}-${tempDate[0]}`;
            document.querySelector('#edit-settlementDate').value = newDate;
        } else {
            document
                .querySelector('#edit-settlement-date')
                .classList.add('form__group--settlementDate--hide');
            document.querySelector('#edit-state-waiting').setAttribute('checked', true);
        }

        document.querySelector('.editBill-modal').style.display = 'block';
    });
});

if (editBillForm) {
    // récupère les boutons radio pour la catégorie de la facture
    const editCategoryArray = document.getElementsByName('edit-category');
    // récupère les boutons radio pour l'état de la facture
    const editStateArray = document.getElementsByName('edit-state');

    // fait apparaitre la div date règlement au clic sur Effectué
    document.querySelector('#edit-state-waiting').addEventListener('click', () => {
        document
            .querySelector('#edit-settlement-date')
            .classList.add('form__group--settlementDate--hide');
    });

    // fait disparaitre la div date règlement au clic sur En attente
    document.querySelector('#edit-state-paid').addEventListener('click', () => {
        document
            .querySelector('#edit-settlement-date')
            .classList.remove('form__group--settlementDate--hide');
    });

    editBillForm.addEventListener('submit', e => {
        e.preventDefault();
        const billName = document.getElementById('edit-bill-name').value;
        const price = document.getElementById('edit-bill-price').value;
        let category;
        let state;

        // boucle sur la catégorie de facture pour récupérer le choix utilisateur
        for (let i = 0; i < editCategoryArray.length; i++) {
            if (editCategoryArray[i].checked) {
                category = editCategoryArray[i].value;
            }
        }

        // boucle sur le status du projet pour récupérer le choix utilisateur
        for (let i = 0; i < editStateArray.length; i++) {
            if (editStateArray[i].checked) {
                state = editStateArray[i].value;
            }
        }

        editBill(billName, price, category, state);
    });
}
