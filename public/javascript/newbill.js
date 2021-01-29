import { showAlert } from './alert.js';

const newBillModal = document.querySelector('.newBill-modal');
const newBillForm = document.querySelector('.newBill-form');
const newBillButton = document.querySelector('#newBillButton');
const closeButton = document.querySelector('.newBill-modal__content span.close');

const createNewBill = async (billName, billNumber, date, price, category, state, paidAt) => {
    // récupère l'id du projet sur lequel créer une nouvelle facture
    const projectId = window.location.href.split('/')[4];

    try {
        const res = await axios({
            method: 'POST',
            url: `/api/v1/projects/${projectId}/bills`,
            data: {
                billName,
                billNumber,
                date,
                price,
                category,
                state,
                paidAt,
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
    // si le règlement est marqué comme 'Effectué", affiche l'input date pour définir la date du règlement
    if (document.querySelector('#state-paid').checked) {
        document.querySelector('#settlementDate').style.display = block;
    }

    document.querySelector('#state-waiting').addEventListener('click', () => {
        document
            .querySelector('.form_group.form__group--settlementDate')
            .classList.add('form__group--settlementDate--hide');
    });

    document.querySelector('#state-paid').addEventListener('click', () => {
        document
            .querySelector('.form_group.form__group--settlementDate')
            .classList.remove('form__group--settlementDate--hide');
    });

    // récupère les boutons radio pour la catégorie de la facture
    const categoryArray = document.getElementsByName('category');
    // récupère les boutons radio pour le règlement de la facture
    const stateArray = document.getElementsByName('state');

    newBillForm.addEventListener('submit', e => {
        e.preventDefault();
        const billName = document.getElementById('bill-name').value;
        const price = document.getElementById('bill-price').value;
        const billNumber = document.getElementById('bill-number').value;
        const date = document.getElementById('bill-date').value;

        let category;
        let state;
        let paidAt;

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

                // si le paiement est effectué, récupère sa date de règlement
                if (stateArray[i].value === 'Effectué') {
                    const tempDate = new Date(document.querySelector('#settlementDate').value);

                    const yyyy = tempDate.getFullYear();
                    const mm =
                        tempDate.getMonth() < 10
                            ? `0${tempDate.getMonth() + 1}`
                            : tempDate.getMonth() + 1;
                    const dd = tempDate.getDate();

                    paidAt = `${yyyy}-${mm}-${dd}`;
                }
            }
        }

        createNewBill(billName, billNumber, date, price, category, state, paidAt);
    });
}
