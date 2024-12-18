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
        // Apply dark mode based on the slider state
        if (localStorage.getItem('darkMode') === 'disabled') {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            console.log('darmode set');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            console.log('darkmode clear');
        }
    });
});