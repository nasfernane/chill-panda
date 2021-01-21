import { showAlert } from './alert.js';

const newProjectForm = document.querySelector('.form-newProject');

const createNewProject = async (name, client, projectType, quote, status) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/projects',
            data: {
                name,
                client,
                projectType,
                quote,
                status,
            },
        });

        if (res.data.status === 'success') {
            await showAlert('success', 'Projet créé');
            window.setTimeout(() => {
                location.assign('/overview');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

if (newProjectForm) {
    const statusArray = document.getElementsByName('status');

    newProjectForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('projectName').value;
        const client = document.getElementById('client').value;
        const projectType = document.getElementById('projectType').value;
        const quote = document.getElementById('quote').value;
        let status;

        for (let i = 0; i < statusArray.length; i++) {
            if (statusArray[i].checked) {
                status = statusArray[i].value;
            }
        }

        createNewProject(name, client, projectType, quote, status);
    });
}
