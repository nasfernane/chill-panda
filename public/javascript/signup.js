/* eslint-disable */
import {showAlert, hideAlert} from './alert.js';

// éléments DOM
const signUpForm = document.querySelector('.signupForm')

const signUp = async (name, email, password, passwordConfirm) => {
    console.log('test')
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        })

        // si l'inscription est réussie, affiche une alerte et bascule sur overview
        if (res.data.status === 'Success') {
            showAlert('success', 'Inscription réussie');
            // alert('Vous êtes à présent connecté(e)');
            window.setTimeout(() => {
                location.assign('/overview');
            }, 1500);
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

// ajoute l'écouteur sur le formulaire d'inscription seulement sur la page où il existe
if (signUpForm) {
    console.log('coucou');

    signUpForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signUp(name, email, password, passwordConfirm);
    });
}