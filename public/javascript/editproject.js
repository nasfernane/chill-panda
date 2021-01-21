import { showAlert } from './alert.js';

const editProjectForm = document.querySelector('.form-editProject');

const editProject = async (name, client, projectType, quote, status) => {
    // récupère l'id du projet à modifier sur l'url
    const projectId = window.location.href.split('/')[4];

    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:8000/api/v1/projects/${projectId}`,
            data: {
                name,
                client,
                projectType,
                quote,
                status,
            },
        });

        if (res.data.status === 'success') {
            await showAlert('success', 'Projet mis à jour');
            window.setTimeout(() => {
                location.assign('/overview');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

if (editProjectForm) {
    // récupère les boutons radio pour le statut du projet
    const statusArray = document.getElementsByName('status');
    // récupère les boutons radio pour le type de projet
    const typeArray = document.getElementsByName('projectType');
    // récupère tous les inputs avec l'attribut to check
    const inputsArray = document.querySelectorAll('input[tocheck]');
    console.log(inputsArray);

    // boucle sur tous les inputs radio pour leur rajouter l'attribut checked selon le projet
    for (let i = 0; i < inputsArray.length; i++) {
        const attr = inputsArray[i].attributes[5].nodeValue;
        console.log(attr);
        if (attr == 'checked') {
            inputsArray[i].setAttribute('checked', true);
        }
    }

    editProjectForm.addEventListener('submit', e => {
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

        editProject(name, client, projectType, quote, status);
    });
}
