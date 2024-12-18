# G5 Snowhere You're Going

Snowhere you're going is a webapp developed as part of a WVU project. You can contribute via our github at https://github.com/WVU-CS330-2024-08-Group05/G5.

The root directory of our repo acts as our backend, the server, database connection and communication, and API calls are stored here.

|--index.js              # Server config, handles setting up the server and communication

|--sql.js                # Database SQL queries and helper function

|--weather.js            # Working with the NWS API to pull our temperature data

|--resortdata.json       # JSON file storing all of the data we use for the resorts

|--src/                  # conains code that dynamically generates html as a string

    |--ResortCard.js     # Generate HTML wrappers for the home page based off resorts in our .JSON
  
    |--Search.js         # Handle search queries for resorts using the sites search bar
  

The public directory is the frontend of our website. This includes the login, signup, and all functions used by the User.

|--public/  

    |--DropdownMenu.js   # Dropdown menu on the Skilogger page
  
    |--account.js        # Functions and fetch requests on the Account page
  
    |--Trip.js           # The Trip class, functions and fetches for all things relating to trips
  
    |--darkmode.js       # Register button press and CSS changes for dark mode
  
    |--guest.js          # Validate a user is logged in and restrict access to parts of the website
  
    |--hoursLogged.js    # Submit's data from Skilogger into a Trip and then stores in the database
  
    |--login.js          # Login functionality and user validation
    
    |--pin.js            # Pinned resorts, saved in our database, then listed first on home page.
  
    |--search.js         # Webpage search functionality to query our Search.js
  
    |--signup.js         # Signup functionality and user validation
  




