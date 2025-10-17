//declare modal object
var alertModal;
var otpModal;
var reservationModal;
var registrationModal;
var assetEditorModal;
var createAssetModal;

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

var registrationModalEl =
    "<div class='modal fade' id='registrationModal' tabindex='-1' role='dialog'>" +
    "  <div class='modal-dialog'>" +
    "    <div class='modal-content'>" +

    "      <div class='modal-header'>" +
    "        <h5 class='modal-title'>Account Registration</h5>" +
    "        <button type='button' class='btn-close' data-bs-dismiss='modal'></button>" +
    "      </div>" +

    "      <div class='modal-body'>" +
    "        <form id='registrationForm'>" +

    "          <div class='mb-3'>" +
    "            <label for='firstName' class='form-label'>First Name</label>" +
    "            <input type='text' class='form-control' id='firstName' placeholder='Enter first name'>" +
    "          </div>" +

    "          <div class='mb-3'>" +
    "            <label for='middleInitial' class='form-label'>Middle Initial</label>" +
    "            <input type='text' class='form-control' id='middleInitial' maxlength='1' placeholder='M'>" +
    "          </div>" +

    "          <div class='mb-3'>" +
    "            <label for='lastName' class='form-label'>Last Name</label>" +
    "            <input type='text' class='form-control' id='lastName' placeholder='Enter last name'>" +
    "          </div>" +

    "          <div class='mb-3'>" +
    "            <label for='username' class='form-label'>Username</label>" +
    "            <input type='text' class='form-control' id='username' placeholder='Enter username'>" +
    "          </div>" +

    "          <div class='mb-3'>" +
    "            <label for='password' class='form-label'>Password</label>" +
    "            <input type='password' class='form-control' id='password' placeholder='Enter password'>" +
    "          </div>" +

    "          <div class='mb-3'>" +
    "            <label for='comfirmPassword' class='form-label'>Confirm Password</label>" +
    "            <input type='password' class='form-control' id='password' placeholder='Re-enter password'>" +
    "          </div>" +

    "          <div class='mb-3'>" +
    "            <label for='email' class='form-label'>Email</label>" +
    "            <input type='email' class='form-control' id='email' placeholder='Enter email'>" +
    "          </div>" +

    "          <div class='mb-3'>" +
    "            <label for='organization' class='form-label'>Organization</label>" +
    "            <input type='text' class='form-control' id='organization' placeholder='Enter organization'>" +
    "          </div>" +

    "        </form>" +
    "      </div>" +

    "      <div class='modal-footer'>" +
    "        <button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Cancel</button>" +
    "        <button type='button' class='btn btn-primary' id='submitRegistration'>Register</button>" +
    "      </div>" +

    "    </div>" +
    "  </div>" +
    "</div>";


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
    "<button type='button' class='btn btn-primary' onclick='verifyOTP(role_id, user_id, user_email)'; return false;>Verify</button>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

// Modal template (already in your global.js)
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
    "<input type='date' id='eventDate' class='form-control'>" +

    "<label for='asset'>Item you wish to borrow</label>" +
    "<select id='asset' class='form-select'>" +
    "<option value=''>Asset</option>" +
    "</select>" +

    "</div>" +

    "<div class='modal-footer'>" +
    "<button type='button' class='btn btn-primary' id='submitReservation'>Submit</button>" +
    "<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Clear</button>" +
    "</div>" +

    "</div>" +
    "</div>" +
    "</div>";

let creatAssetModalEl = `
<div class="modal fade" id="createAssetModal" tabindex="-1" aria-labelledby="createAssetModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      
      <div class="modal-header">
        <h5 class="modal-title" id="createAssetModalLabel">Create Asset</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <div class="modal-body">
        <form id="createAssetForm">
          
          <div class="mb-3">
            <label for="createAssetName" class="form-label">Asset Name</label>
            <input type="text" id="createAssetName" class="form-control" required>
          </div>
          
          <div class="mb-3">
            <label for="createQuantity" class="form-label">Quantity</label>
            <input type="number" id="createQuantity" class="form-control" min="1" required>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="createAsset()">Save</button>
      </div>
    </div>
  </div>
</div>
`;

let assetEditorModalEl = `
<div class="modal fade" id="assetEditorModal" tabindex="-1" aria-labelledby="assetEditorModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      
      <div class="modal-header">
        <h5 class="modal-title" id="assetEditorModalLabel">Edit Asset</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <div class="modal-body">
        <form id="editAssetForm">
          
          <div class="mb-3">
            <label for="editAssetName" class="form-label">Asset Name</label>
            <input type="text" id="editAssetName" class="form-control" required>
          </div>
          
          <div class="mb-3">
            <label for="editQuantity" class="form-label">Quantity</label>
            <input type="number" id="editQuantity" class="form-control" min="1" required>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveAssetChanges()">Save Changes</button>
      </div>
    </div>
  </div>
</div>
`;

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
function openOtpModal(userID) {
    var modalEl = document.getElementById("otpModal");

    if (!modalEl) {
        console.error("otpModal not found in DOM!");
        return;
    }

    // Optionally show userID inside modal
    modalEl.setAttribute("data-userid", userID || "");

    var otpModal = new bootstrap.Modal(modalEl, { backdrop: 'static' });
    otpModal.show();
}

function openReservationModal() {
    reservationModal = new bootstrap.Modal(document.getElementById('reservationModal'), {
        backdrop: 'static'
    });
    reservationModal.show();
}

function openRegistrationModal() {
    registrationModal = new bootstrap.Modal(document.getElementById('registrationModal'), {
        backdrop: 'static'
    });
    //registrationModal.show();
}
let assetModalInstance = null;
function openCreateAssetModal() {
    console.log("Opening create asset modal...");

    // 1️⃣ Check if modal exists
    let modalElement = document.getElementById('createAssetModal');
    if (!modalElement) {
        console.warn("Modal not found — inserting into DOM.");
        document.body.insertAdjacentHTML('beforeend', creatAssetModalEl);
        modalElement = document.getElementById('createAssetModal');
    }

    // 2️⃣ Verify that insertion succeeded
    if (!modalElement) {
        console.error("❌ Failed to insert modal into DOM!");
        return;
    }

    // 3️⃣ Create and show modal
    const modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: 'static'
    });
    modalInstance.show();

    console.log("✅ Modal opened successfully.");
}

function openAssetEditorModal(asset_name, asset_quantity) {
    console.log("Opening asset editor modal...");

    // 1️⃣ Check if modal exists
    let modalElement = document.getElementById('assetEditorModal');
    if (!modalElement) {
        console.warn("Modal not found — inserting into DOM.");
        document.body.insertAdjacentHTML('beforeend', assetEditorModalEl);
        modalElement = document.getElementById('assetEditorModal');
    }

    modalElement.addEventListener('shown.bs.modal', () => {
        document.getElementById('editAssetName').value = asset_name;
        document.getElementById('editQuantity').value = asset_quantity;
    }, { once: true });

    // 2️⃣ Verify that insertion succeeded
    if (!modalElement) {
        console.error("❌ Failed to insert modal into DOM!");
        return;
    }

    // 3️⃣ Create and show modal
    const modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: 'static'
    });
    modalInstance.show();

    console.log("✅ Modal opened successfully.");
}
function openReservationInfoModal() {
    viewReservationModal = new bootstrap.Modal(document.getElementById('vewReservationModal'), {
        backdrop: 'static'
    });
    viewReservationModal.show();
}



