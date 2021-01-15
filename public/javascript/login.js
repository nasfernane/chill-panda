/* eslint-disable */

const login = async (email, password) => {
    try {
        console.log(email, password);
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password,
            },
        });
        console.log(res);
    } catch (err) {
        console.log(err.response.data);
    }
};

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
});
