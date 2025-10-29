//declare modal object
var alertModal;
var otpModal;
var reservationModal;
var registrationModal;
var assetEditorModal;
var createAssetModal;
var addAssetCategoryModal;

var addAssetCategoryModalEl = `
    <div class="modal fade" id="addAssetCategoryModal" tabindex="-1" aria-labelledby="addAssetCategoryModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title" id="addAssetCategoryModalLabel">Add Asset Category</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <form id="addAssetCategoryForm">
              <div class="mb-3">
                <label for="parentCategorySelect" class="form-label">Parent Category</label>
                <select id="parentCategorySelect" class="form-select">
                  <option value="">-- Add as Main Category --</option>
                  <!-- Populated dynamically -->
                </select>
              </div>

              <div class="mb-3">
                <label for="assetCategoryName" class="form-label">Category Name</label>
                <input type="text" id="assetCategoryName" class="form-control" required>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="saveAssetCategory()">Save</button>
          </div>

        </div>
      </div>
    </div>
    `;

function openAddAssetCategoryModal() {
    console.log("Opening add asset category modal...");

    // 1️⃣ Check if modal exists
    let modalElement = document.getElementById('addAssetCategoryModal');
    if (!modalElement) {
        console.warn("Modal not found — inserting into DOM.");
        document.body.insertAdjacentHTML('beforeend', addAssetCategoryModalEl);
        modalElement = document.getElementById('addAssetCategoryModal');
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
    loadParentCategoryOptions();
}

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

let reservationModalEl =
    "<div class='modal fade' id='reservationModal' tabindex='-1' role='dialog'>" +
    "<div class='modal-dialog modal-lg'>" +
    "<div class='modal-content'>" +

    "<div class='modal-header'>" +
    "<h5 class='modal-title'>RESERVATION</h5>" +
    "<button type='button' class='btn-close' data-bs-dismiss='modal'></button>" +
    "</div>" +

    "<div class='modal-body'>" +
    "<label for='eventName'>Event Name</label>" +
    "<input type='text' id='eventName' class='form-control mb-2' placeholder='Singing Contest'>" +

    "<label for='eventDescription'>Event Description</label>" +
    "<input type='text' id='eventDescription' class='form-control mb-3' placeholder='Battle of the Bands'>" +

    "<label>Items you wish to borrow</label>" +
    "<div id='assetContainer' class='mb-3' style='display:none;'></div>" +

    "<div id='datesContainer'>" +
    "<label>Event Dates and Time</label>" +
    "<div class='date-group mb-3'>" +
    "<div class='input-group mb-2'>" +
        "<input type='date' class='form-control event-date'>" +
        "<input type='time' class='form-control start-time'>" +
        "<input type='time' class='form-control end-time'>" +
    "<button type='button' class='btn btn-danger remove-date ms-1'>−</button>" +
    "</div>" +
    "</div>" +
    "</div>" +

    "<button type='button' class='btn btn-success mb-3' id='addDate'>+ Add Another Date</button>" +
    "</div>" +

    "<div class='modal-footer'>" +
    "<button type='button' class='btn btn-primary' id='btnSubmitReservation' onclick='submitReservation()'; return false;> Submit</button >"+
    "<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Clear</button>" +
    "</div>" +

    "</div>" +
    "</div>" +
    "</div>";
// Restrict allowed date range
function setDateRange(input) {
    const today = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(today.getMonth() + 2);

    const formatDate = (d) => d.toISOString().split('T')[0];
    const minDate = formatDate(today);
    const maxDate = formatDate(twoMonthsFromNow);

    input.min = minDate;
    input.max = maxDate;

    // Prevent selecting invalid dates manually
    input.addEventListener('input', () => {
        if (input.value < minDate) input.value = minDate;
        if (input.value > maxDate) input.value = maxDate;
    });

    // Prevent opening the picker for invalid range
    input.addEventListener('click', (e) => {
        const currentDate = new Date(input.value || today);
        if (currentDate < today || currentDate > twoMonthsFromNow) {
            e.preventDefault();
        }
    });
}

// Apply to all date inputs
function applyDateLimits() {
    document.querySelectorAll('.event-date').forEach(setDateRange);
}

applyDateLimits();

// Add/remove date rows
document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'addDate') {
        const container = document.getElementById('datesContainer');
        const newDateGroup = document.createElement('div');
        newDateGroup.classList.add('date-group', 'mb-3');
        newDateGroup.innerHTML = `
      <div class='input-group mb-2'>
        <input type='date' class='form-control event-date'>
        <input type='time' class='form-control start-time'>
        <input type='time' class='form-control end-time'>
        <button type='button' class='btn btn-danger remove-date ms-1'>−</button>
      </div>`;
        container.appendChild(newDateGroup);
        applyDateLimits();
    }

    if (e.target && e.target.classList.contains('remove-date')) {
        e.target.closest('.date-group').remove();
    }
});

function getEventDates() {
    const dateGroups = document.querySelectorAll('.date-group');
    const eventDates = [];

    dateGroups.forEach(group => {
        const date = group.querySelector('.event-date').value;
        const startTime = group.querySelector('.start-time').value;
        const endTime = group.querySelector('.end-time').value;

        // Only push if all fields are filled
        if (date && startTime && endTime) {
            eventDates.push({
                date: date,
                startTime: startTime,
                endTime: endTime
            });
        }
    });

    return eventDates;
}


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
            <label for="populateAssetCategory" class="form-label">Asset Category</label>
            <div class="d-flex gap-2">
              <select id="populateAssetCategory" class="form-select" required>
                <option value="">-- Select a Category --</option>
              </select>
              <button type="button" class="btn btn-primary" onclick="addCategory()">+</button>
              <button type="button" class="btn btn-primary" onclick="EditCategory()">✎</button>
            </div>
          </div>

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

            <label for="populateEditAssetCategory" class="form-label">Asset Category</label>
            <div class="d-flex gap-2">
              <select id="populateEditAssetCategory" class="form-select" required>
                <option value="">-- Select a Category --</option>
              </select>
              <button type="button" class="btn btn-primary" onclick="addCategory()">+</button>
              <button type="button" class="btn btn-primary" onclick="EditCategory()">✎</button>
            </div>

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
    console.log("Opening reservation modal...");

    // 1️⃣ Check if modal exists
    let modalElement = document.getElementById('reservationModal');
    if (!modalElement) {
        console.warn("Modal not found — inserting into DOM.");
        document.body.insertAdjacentHTML('beforeend', reservationModalEl);
        modalElement = document.getElementById('reservationModal');
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

async function openAssetEditorModal(asset_name, asset_quantity, category_id) {
    console.log("Opening asset editor modal...");

    // 1️⃣ Ensure modal exists
    let modalElement = document.getElementById('assetEditorModal');
    if (!modalElement) {
        console.warn("Modal not found — inserting into DOM.");
        document.body.insertAdjacentHTML('beforeend', assetEditorModalEl);
        modalElement = document.getElementById('assetEditorModal');
    }

    // 2️⃣ Ensure categories are loaded before showing modal
    if (categoriesGlobal.length === 0) {
        console.log("Loading categories first...");
        await loadAssetCategories(); // uses your existing function
    } else {
        console.log("Using cached categories.");
        let action = "edit";
        populateCategoryDropdown(categoriesGlobal, action);
    }

    // 3️⃣ Fill modal fields
    modalElement.addEventListener('shown.bs.modal', () => {
        document.getElementById('editAssetName').value = asset_name;
        document.getElementById('editQuantity').value = asset_quantity;

        const categorySelect = document.getElementById('populateEditAssetCategory');
        if (categorySelect) {
            categorySelect.value = category_id;

            if (categorySelect.value !== category_id.toString()) {
                console.warn(`Category ID ${category_id} not found in dropdown.`);
            }
        }
    }, { once: true });

    // 4️⃣ Show modal
    const modalInstance = new bootstrap.Modal(modalElement, { backdrop: 'static' });
    modalInstance.show();

    console.log("✅ Modal opened successfully.");
}




