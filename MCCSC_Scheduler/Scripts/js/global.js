//declare modal object
var alertModal;
var otpModal;
var reservationModal;

var alertModalEl = "<div class='modal fade' id='alertModal' role='dialog'>" +
    "<div class='modal-dialog'>" +
    "<div class='modal-content'>" +
    "<div class='modal-header'>" +
    "<h4 id='alertModalTitle' class='modal-title'></h4>" +
    "<button type='button' class='btn-close' data-bs-dismiss='modal'></button>" +
    "</div>" +
    "<div class='modal-body'>" +
    "<div class='col-md-12 alert-modal-content'></div>" +
    "</div>" +
    "<div class='modal-footer'>" +
    "<button type='button' class='btn btn-primary' data-bs-dismiss='modal'>OK</button>" +
    "</div></div></div></div>";

var otpModalEl =
    "<div class='modal fade' id='otpModal' role='dialog'>" +
    "<div class='modal-dialog'>" +
    "<div class='modal-content'>" +
    "<div class='modal-header'>" +
    "<h5 class='modal-title'>OTP Verification</h5>" +
    "<button type='button' class='btn-close' data-bs-dismiss='modal'></button>" +
    "</div>" +
    "<div class='modal-body'>" +
    "<p>Please enter the One-Time Password sent to your email:</p>" +
    "<input type='text' id='otpCode' class='form-control' placeholder='Enter OTP' />" +
    "<small id='otpMessage' class='text-danger d-none'>Invalid OTP, please try again.</small>" +
    "</div>" +
    "<div class='modal-footer'>" +
    "<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Cancel</button>" +
    "<button type='button' class='btn btn-primary' onclick='verifyOTP()'; return false;>Verify</button>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

let reservationModalEl =
    "<div class='modal fade' id='reservationModal' tabindex='-1' role='dialog'>" +
    "<div class='modal-dialog'>" +
    "<div class='modal-content'>" +

    "<div class='modal-header'>" +
    "<h5 class='modal-title'>RESERVATION</h5>" +
    "<button type='button' class='btn-close' data-bs-dismiss='modal'></button>" +
    "</div>" +

    "<div class='modal-body'>" +
    "<label for='eventName'>Event Name</label>" +
    "<input type='text' id='eventName' class='form-control' placeholder='Singing Contest'>" +

    "<label for='eventDescription'>Event Description</label>" +
    "<input type='text' id='eventDescription' class='form-control' placeholder='Battle of the Bands'>" +

    "<label for='eventDate'>Date of Event</label>" +
    "<select id='eventDate' class='form-select'>" +
    "<option value=''>Date</option>" +
    "</select>" +

    "<label for='asset'>Item you wish to borrow</label>" +
    "<select id='asset' class='form-select'>" +
    "<option value=''>Asset</option>" +
    "</select>" +
    "</div>" +

    "<div class='modal-footer'>" +
    "<button type='button' class='btn btn-primary' id='submitReservation'>Submit</button>" +
    "<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Clear</button>" +
    "</div>" +

    "</div></div></div>";

function initializeTooltip() {
    //initialize tooltips
    //get elements where tooltips will be triggered
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    //let each of those elements become a Booststrap tooltip
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function hideTooltip() {
    var tooltipElement = document.querySelector('[data-bs-toggle="tooltip"]');
    if (tooltipElement) {
        var tooltip = bootstrap.Tooltip.getInstance(tooltipElement);
        if (tooltip)
            tooltip.hide();
    }
}

function openAlertModal(title, message) {
    alertModal = new bootstrap.Modal(document.getElementById('alertModal'), {                                                        //show alert modal with the corresponding heading and message
        backdrop: 'static'
    });
    alertModal.show();
    document.getElementById('alertModalTitle').textContent = title;
    var alertModalDiv = document.getElementsByClassName('alert-modal-content');
    alertModalDiv[0].textContent = message;
}
function openOtpModal() {
    otpModal = new bootstrap.Modal(document.getElementById('otpModal'), {
        backdrop: 'static'
    });
    otpModal.show();
}
function openReservationModal() {
    reservationModal = new bootstrap.Modal(document.getElementById('reservationModal'), {
        backdrop: 'static'
    });
    reservationModal.show();
}
//Method to verify the user OTP input.
