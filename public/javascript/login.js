/* eslint-disable */
import { showAlert, hideAlert } from './alert.js';

// éléments DOM
const loginForm = document.querySelector('.loginForm');
const logOutBtn = document.querySelector('.logout');
// récupération du message d'erreur pour les visiteurs non identifiés qui essaient d'accéder à une page
const error = document.querySelector('.error__container header h2');
const showPwBtn = document.querySelector('.showPw');
const showPwConfirmBtn = document.querySelector('.showPwConfirm');
const pwInput = document.querySelector('#password');
const pwConfirmInput = document.querySelector('#passwordConfirm');

// utilise le client HTTP Axios pour envoyer les identifiants de connexion à l'API
const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password,
            },
        });

        // si les identifiants sont corrects, bascule sur la page overview
        if (res.data.status === 'success') {
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

// log out de l'utilisateur
const logout = async () => {
    try {
        const res = await axios({
            methode: 'GET',
            url: '/api/v1/users/logout',
        });

        // renvoie à la page d'accueil
        if (res.data.status === 'success') document.location.replace('/');
    } catch (err) {
        // affiche une erreur en cas d'échec
        showAlert('error', 'Echec de connexion !');
    }
};

// ajoute l'écouteur sur le formulaire de connexion seulement sur la page où il existe
if (loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

// gestion erreur pour redirection vers login

if (error && error.innerText.includes(`Vous n'êtes pas identifié.`)) {
    window.setTimeout(function () {
        window.location.replace('/');
    }, 3000);
}

if (showPwBtn) {
    showPwBtn.addEventListener('mousedown', function () {
        pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
    });

    showPwBtn.addEventListener('mouseup', function () {
        pwInput.type = pwInput.type === 'text' ? 'password' : 'text';
    });
}

if (showPwConfirmBtn) {
    showPwConfirmBtn.addEventListener('mousedown', function () {
        pwConfirmInput.type = pwConfirmInput.type === 'password' ? 'text' : 'password';
    });

    showPwConfirmBtn.addEventListener('mouseup', function () {
        pwConfirmInput.type = pwConfirmInput.type === 'text' ? 'password' : 'text';
    });
}
