import { showAlert } from './alert.js';

const userDataForm = document.querySelector('.form-user-data');
const userPwForm = document.querySelector('.form-user-password');

// fonction pour mettre à jour les infos user || son mdp
// le type est soit 'password' ou 'data'
const updateSettings = async (data, type) => {
    try {
        // en fonction du type entré en paramètre, on change l'url pour maj les data ou le mot de passe
        const url = type === 'password' ? '/api/v1/users/updatepassword' : '/api/v1/users/updateme';
        // définit le type d'alerte pour l'utilisateur
        const alertType = type === 'password' ? 'mot de passe' : 'compte';

        const res = await axios({
            method: 'PATCH',
            url: url,
            data,
        });

        if (res.data.status === 'success') {
            await showAlert('success', `Votre ${alertType} a été correctement mis à jour`);
            window.setTimeout(() => {
                location.reload();
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

// ajoute écouteur pour maj données user
if (userDataForm)
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        updateSettings({ name, email }, 'data');
    });

// écouteur pour maj password user
if (userPwForm)
    userPwForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Mise à jour...';

        const currentPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        // await l'update pour pouvoir clear les saisies après
        await updateSettings({ currentPassword, password, passwordConfirm }, 'password');

        document.querySelector('.btn--save-password').textContent = 'Sauvegarder';
        // supprime les saisies utilisateurs après modification
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
