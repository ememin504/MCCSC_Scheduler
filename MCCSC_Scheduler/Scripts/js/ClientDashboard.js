document.addEventListener("DOMContentLoaded", function () {
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
    }
});
