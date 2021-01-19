import {showAlert, hideAlert} from './alert.js';

const userDataForm = document.querySelector('.form-user-data')

const updateData = async (name, email) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:8000/api/v1/users/updateme',
            data: {
                name,
                email
            }
        })

        if (res.data.status === 'success') {
            showAlert('success', 'Vos données ont été correctement mises à jour');
            window.setTimeout(() => {
                location.assign('/account');
            }, 1000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}

if(userDataForm) 
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        updateData(name, email)
    })
