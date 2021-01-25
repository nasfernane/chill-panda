import { showAlert } from './alert.js';
// import axios from 'axios';

const newProjectForm = document.querySelector('.form-newProject');

const createNewProject = async (name, client, projectType, quote, status) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/projects',
            data: {
                name,
                client,
                projectType,
                quote,
                status,
            },
            validateStatus: status => {
                return true; // test bug pour intern error
            },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Projet créé');
            window.setTimeout(() => {
                location.assign('/overview');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err);
        console.log(err);
    }
};

if (newProjectForm) {
    // récupère les boutons radio pour le statut du projet
    const statusArray = document.getElementsByName('status');
    // récupère les boutons radio pour le type de projet
    const typeArray = document.getElementsByName('projectType');

    newProjectForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('projectName').value;
        const client = document.getElementById('client').value;
        const quote = document.getElementById('quote').value;
        let projectType;
        let status;

        // boucle sur le type de projet pour récupérer le choix utilisateur
        for (let i = 0; i < typeArray.length; i++) {
            if (typeArray[i].checked) {
                projectType = typeArray[i].value;
            }
        }

        // boucle sur le status du projet pour récupérer le choix utilisateur
        for (let i = 0; i < statusArray.length; i++) {
            if (statusArray[i].checked) {
                status = statusArray[i].value;
            }
        }

        createNewProject(name, client, projectType, quote, status);
    });
}
