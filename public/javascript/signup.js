/* eslint-disable */
import { showAlert, hideAlert } from './alert.js';

// éléments DOM
const signUpForm = document.querySelector('.signupForm');

const signUp = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm,
            },
        });

        // si l'inscription est réussie, affiche une alerte et bascule sur overview
        if (res.data.status === 'success') {
            await showAlert('success', 'Inscription réussie');
            window.setTimeout(() => {
                location.assign('/overview');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

// ajoute l'écouteur sur le formulaire d'inscription seulement sur la page où il existe
if (signUpForm) {
    signUpForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signUp(name, email, password, passwordConfirm);
    });
}
