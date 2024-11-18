$(function () {
    let trips = 0; // take value from account data in database
    let totalHours = 0; // take value from account data in database
    let rank = 1; // take value from account data in database
    let username = "username"; // take value from account data
    let rating = 0;

    $("#username").textContent = username;
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

        // Adds new Ski Trip to list
        let resort = document.getElementById('Resort').value;
        let date = document.getElementById('Date').value;
        let listItem = document.createElement('li');
        listItem.textContent = ("Trip to " + resort + " on " + date + ", for " + newHours + " hours, " + "Rating: " + rating + " stars");
        document.getElementById('SkiTripList').append(listItem);

        // update user Info
        trips += 1;
        document.getElementById('total-trips').textContent = ("Total Trips: " + trips);
        document.getElementById('total-hours').textContent = ("Total Hours: " + totalHours);
        // send account data to database

    });

    $('input[name="rating"]').change(function () {
        rating = $(this).val(); // Assign value to the variable
        $('#output').text(`Selected Value: ${rating}`); // Update the text
        console.log(`The selected value is: ${rating}`); // For debugging'
    });


});