import React, { useState } from 'react';

const Account = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    // Handler to toggle dark mode
    const changeBrowserMode = () => {
        setDarkMode(prevDarkMode => !prevDarkMode);
    };

    // Handler to manage account creation logic
    const handleCreateAccount = async (newUsername, newPassword, newEmail) => {
        // Send a POST request to the backend to create the account
        // We check if the account exists during the process
        try {
            const response = await fetch('create_account.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    username: newUsername,
                    password: newPassword,  // Note: password should be hashed
                    email: newEmail,
                })
            });

            const result = await response.text();
            console.log(result);  // Handle the response from PHP here (e.g., redirect or show error message)
        } catch (error) {
            console.error('Error creating account:', error);
        }
    };

};

export default Account;


