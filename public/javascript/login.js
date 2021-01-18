/* eslint-disable */

// éléments DOM
const loginForm = document.querySelector('.form');

// messages d'alerte pour notifier à l'utilisateur si il a réussi à se connecter
// type is 'success' or 'error'
const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};

// cache l'alerte
const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

// utilise le client HTTP Axios pour envoyer les identifiants de connexion à l'API
const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password,
            },
        });

        // si les identifiants sont corrects, bascule sur la page overview
        if (res.data.status === 'Success') {
            showAlert('success', 'Connexion réussie');
            // alert('Vous êtes à présent connecté(e)');
            window.setTimeout(() => {
                location.assign('/overview');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};


// ajoute l'écouteur sur le formulaire de connexion seulement sur la page où il existe
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}
