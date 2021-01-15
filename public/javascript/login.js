/* eslint-disable */

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
            console.log('coucou');
            window.setTimeout(() => {
                location.assign('/overview');
            }, 1500);
        }
    } catch (err) {
        alert(err.response.data.message);
    }
};

// écouteur sur le formulaire de login, lance la fonction login() sur l'event submit
document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
});
