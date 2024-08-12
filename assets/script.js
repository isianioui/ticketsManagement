const passwordInput = document.getElementById('password');
const icon = document.getElementById('show-hide');

icon.addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    icon.src = passwordInput.type === 'password' ? 'assets/images/action-hide-password.png' : 'assets/images/show-pass.png';
});


       
