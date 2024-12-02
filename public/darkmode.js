document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('darkModeToggle');

    // Check localStorage and apply saved mode
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        toggleButton.checked = true;
    }
    else {
        document.body.classList.remove('dark-mode');
        toggleButton.checked = false;
    }

    // Toggle dark mode on slider change
    toggleButton.addEventListener('change', () => {

        // Apply dark mode based on the slider state
        if (toggleButton.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
});