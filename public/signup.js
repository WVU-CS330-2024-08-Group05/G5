function signUp() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if (username && password) {
        alert(`Welcome, ${username}!`);
    } else {
        alert('Please fill in both fields.');
    }
}
