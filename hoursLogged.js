
document.getElementById("hourSubmit").addEventListener("click", function () {
    let hours = parseFloat(getElementById("Hours").value);
    let total = parseFloat(getElementById("totalHours").value);
    let newTotal = hours + total;
    getElementById("totalHours").value = newTotal;
});