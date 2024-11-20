document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('darkModeToggle');

    // Check localStorage and apply saved mode
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        toggleButton.classList.add('dark-mode-enabled');
    }

    // Toggle dark mode on button click
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        // Save preference in localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            toggleButton.classList.add('dark-mode-enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
            toggleButton.classList.remove('dark-mode-enabled');
        }
    });
});