document.addEventListener('DOMContentLoaded', () => {
    
    // Check localStorage and apply saved mode
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    else {
        document.body.classList.remove('dark-mode');
    }
    
    // Toggle dark mode on slider change
    $('#darkmode-btn').on('click', () => {
        console.log("dark mode clicked");

        // Apply dark mode based on the slider state
        if ($('#darkmode-btn').is()) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
});