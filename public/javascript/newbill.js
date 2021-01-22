import { showAlert } from './alert.js';

const newBillModal = document.querySelector('.newBill-modal');
const newBillForm = document.querySelector('.newBill-form');
const newBillButton = document.querySelector('#newBillButton');
const closeButton = document.querySelector('.newBill-modal__content span.close');

const createNewBill = async (billName, price, category, state) => {
    // récupère l'id du projet sur lequel créer une nouvelle facture
    const projectId = window.location.href.split('/')[4];

    try {
        const res = await axios({
            method: 'POST',
            url: `/api/v1/projects/${projectId}/bills`,
            data: {
                billName,
                price,
                category,
                state,
            },
        });

        if (res.data.status === 'success') {
            await showAlert('success', 'Facture créée');
            window.setTimeout(() => {
                location.reload();
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

// faire apparaitre la fenêtre modèle nouvelle facture
if (newBillButton) {
    newBillButton.addEventListener('click', () => {
        newBillModal.style.display = 'block';
    });
}

// faire disparaitre la fenêtre modèle nouvelle facture
if (closeButton) {
    closeButton.addEventListener('click', () => {
        newBillModal.style.display = 'none';
    });
}

if (newBillForm) {
    // récupère les boutons radio pour la catégorie de la facture
    const categoryArray = document.getElementsByName('category');
    // récupère les boutons radio pour le règlement de la facture
    const stateArray = document.getElementsByName('state');

    newBillForm.addEventListener('submit', e => {
        e.preventDefault();
        const billName = document.getElementById('bill-name').value;
        const price = document.getElementById('bill-price').value;
        let category;
        let state;

        // boucle sur la catégorie de facture pour récupérer le choix utilisateur
        for (let i = 0; i < categoryArray.length; i++) {
            if (categoryArray[i].checked) {
                category = categoryArray[i].value;
            }
        }

        // boucle sur le status du projet pour récupérer le choix utilisateur
        for (let i = 0; i < stateArray.length; i++) {
            if (stateArray[i].checked) {
                state = stateArray[i].value;
            }
        }

        createNewBill(billName, price, category, state);
    });
}
