$(function () {
    let trips = 0; // count the amount of 'trips' objects in the trips json stored in the database
    let username = sessionStorage.getItem("username"); // localstorage for now until a better idea is thought of
    let rank = 1; // take totalHours from all user once a cycle(we'll figure out time), and set ranks globally
    let totalHours = 0; // total all the hours from trips in database
    if (localStorage.getItem('trips') !== null) {
        trips = JSON.parse(localStorage.getItem("trips"));
    }
    if (localStorage.getItem('totalHours') != null) {
        totalHours = JSON.parse(localStorage.getItem('totalHours'));
    }
    if (localStorage.getItem('rank') != null) {
        rank = localStorage.getItem('rank');
    }
    let rating = 0;

    document.getElementById('total-trips').textContent = ("Total Trips: " + trips);
    document.getElementById('total-hours').textContent = ("Total Hours: " + totalHours);
    document.getElementById('rank').textContent = ("Global Rank: " + rank);

    $('#hourSubmit').on('click', async function () {

        let newHours = parseFloat($("#Hours").val());
        totalHours += newHours;
        $("#totalHours").value = totalHours;
        $("#totalHours").innerText = ("Total Hours: " + totalHours);
        $("#Hours").value = 0;
        //let rating = document.getElementsByName('rating').value;
        // update user Info
        trips += 1;
        document.getElementById('total-trips').textContent = ("Total Trips: " + trips);
        document.getElementById('total-hours').textContent = ("Total Hours: " + totalHours);

        // Adds new Ski Trip to list
        let resort = document.getElementById('Resort').value;
        let date = document.getElementById('Date').value;
        let listItem = document.createElement('li');
        listItem.textContent = ("Trip to " + resort + " on " + date + ", for " + newHours + " hours, " + "Rating: " + rating + " stars");
        document.getElementById('SkiTripList').append(listItem);


        // send account data to database
        localStorage.setItem('trips', trips);
        localStorage.setItem('totalHours', totalHours);
    });
    $('input[name="rating"]').change(function () {
        rating = $(this).val(); // Assign value to the variable
        $('#output').text(`Selected Value: ${rating}`); // Update the text
        console.log(`The selected value is: ${rating}`); // For debugging'
    });


});
