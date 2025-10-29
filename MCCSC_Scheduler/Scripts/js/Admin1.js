const roleId = sessionStorage.getItem("role_id");
const userId = sessionStorage.getItem("user_id");
const userEmail = sessionStorage.getItem("user_email");
const firstName = sessionStorage.getItem("first_name");
const middleInitial = sessionStorage.getItem("middle_initial");
const lastName = sessionStorage.getItem("last_name");
const roleName = sessionStorage.getItem("role_name");
const roleTypeID = sessionStorage.getItem("role_type_id");
const roleTypeDescription = sessionStorage.getItem("role_type_description");

console.log(roleId, userId, userEmail, roleName, roleTypeID, roleTypeDescription, firstName, middleInitial, lastName);
// categoryLoader.js
var categoriesGlobal = []; // initialize as array
let eventID;
let assetID = 0;
async function loadParentCategoryOptions() {
    try {
        const response = await fetch('AdminDashboard1.aspx/GetAssetCategories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({})
        });

        const data = await response.json();
        const categories = JSON.parse(data.d);

        const select = document.getElementById('parentCategorySelect');
        select.innerHTML = '<option value="">-- Add as Main Category --</option>';
        select.innerHTML += buildCategoryOptions(categories);
    } catch (error) {
        console.error("Error loading parent categories:", error);
    }
}

document.addEventListener('shown.bs.modal', event => {
    if (event.target.id === 'createAssetModal') {
        let action = "create"
        loadAssetCategories(action);
    }
});

async function loadAssetCategories(action) {
    try {
        const response = await fetch('AdminDashboard1.aspx/GetAssetCategories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({}) // WebMethod requires a body, even if empty
        });

        const data = await response.json();
        const categories = JSON.parse(data.d); // JSON from backend
        categoriesGlobal = categories;

        populateCategoryDropdown(categories, action);
        console.log("Categories loaded:", categories);
        console.log("Categories set for global", categoriesGlobal);

        const container = document.getElementById('assetCategories');
        if (!container) return;

        // Build the dropdown with hierarchical indentation
        let html = `
            <label for="assetCategorySelect" class="form-label">Select Category</label>
            <select id="assetCategorySelect" class="form-select" required>
                <option value="">-- Choose a Category --</option>
                ${buildCategoryOptions(categories)}
            </select>
        `;
        container.innerHTML = html;
        
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

function populateCategoryDropdown(categories, action) {
    if (action == "create") {
        const select = document.getElementById('populateAssetCategory');
        select.innerHTML = '<option value="">-- Select a Category --</option>';
        select.innerHTML += buildCategoryOptions(categories);
    } else if (action == "edit"){
        const select = document.getElementById('populateEditAssetCategory');
        select.innerHTML = '<option value="">-- Select a Category --</option>';
        select.innerHTML += buildCategoryOptions(categories);
    }
}

function buildCategoryOptions(categories, parentId = null, level = 0) {
    let html = '';
    categories
        .filter(cat => cat.parent_category_id === parentId)
        .forEach(cat => {
            const indent = '&nbsp;'.repeat(level * 4);
            html += `<option value="${cat.id}">${indent}${cat.name}</option>`;
            html += buildCategoryOptions(categories, cat.id, level + 1);
        });
    return html;
}
function addCategory() {
    // 1️⃣ Close the createAssetModal if it's open
    const createModalEl = document.getElementById('createAssetModal');
    const createModalInstance = bootstrap.Modal.getInstance(createModalEl);
    if (createModalInstance) {
        createModalInstance.hide();
    }
    // 2️⃣ Open the Add Asset Category modal
    openAddAssetCategoryModal();
}
function EditCategory() {
    console.log("loading Edit Category Modal");
    console.log(categoriesGlobal);
}
function saveAssetCategory() {
    const categoryName = document.getElementById("assetCategoryName").value.trim();
    const parentId = document.getElementById("parentCategorySelect").value || null;

    if (!categoryName) {
        alert("Please enter a category name.");
        return;
    }

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/AddAssetCategory",
        data: JSON.stringify({ categoryName: categoryName, parentCategoryId: parentId }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            const result = JSON.parse(response.d);
            if (result.success) {
                alert(result.message);
                $('#addAssetCategoryModal').modal('hide');
                loadAssetCategories();
                openCreateAssetModal();
            } else {
                alert(result.message || "Error: " + result.error);
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    setInterval(() => {
        fetch("AdminDashboard1.aspx/CheckForUpdate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}"
        })
            .then(res => res.json())
            .then(data => {
                const parsed = data.d; // ✅ no need to JSON.parse

                // Compare each timestamp
                const storedRes = localStorage.getItem("lastRes");
                const storedReg = localStorage.getItem("lastReg");

                if (parsed.Reservation !== storedRes) {
                    localStorage.setItem("lastRes", parsed.Reservation);
                    console.log("Reservation table changed!");
                    getReservationRequests();
                }

                if (parsed.Registration !== storedReg) {
                    localStorage.setItem("lastReg", parsed.Registration);
                    console.log("Registration table changed!");
                    getRegistrationRequests();
                }
            })
            .catch(err => console.error("CheckForUpdate error:", err));

    }, 5000);

    // Inject modals
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
    }
    document.getElementById("fullname").textContent = firstName + " " + lastName;
    document.getElementById("roles").textContent = roleName + "/" + roleTypeDescription;
    // Initial data load
    getRegistrationRequests();
    getReservationRequests();
    getUsers();
    getAssets();
    getAcceptedReservation();
    getEvents();
});
function getEvents() {
    console.log("Loading Events...");

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetEvents",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            // ASP.NET [WebMethod] returns data under response.d
            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }
            console.log("✅ Events loaded:", data);

            // Example: display first event
            if (data.length > 0) {
                console.log("First event:", data[0]);
            }

            let tbody = document.getElementById("eventTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No User found</td></tr>`;
                return;
            }
            
            // Loop through the data and build table rows
            data.forEach(req => {
                var actionType = "";
                var actionType = req.IsPrioritized ? "Unprioritize" : "Prioritize";
                var buttonClass = actionType === "Prioritize" ? "btn btn-success" : "btn btn-danger";

                let row = `
                    <tr>
                        <td>${req.EventID}</td>
                        <td>${req.EventTitle}</td>
                        <td>${req.Description}</td>
                        <td>${req.OrganizationID}</td>
                        <td>${req.OrganizationName}</td>
                        <td>${req.OrganizationType}</td>
                        <td>${req.IsPrioritized}</td>
                        <td>${req.IsRecurring}</td>
                        <td>
                            <button class="${buttonClass}"  onclick="prioritizeEvent('${actionType}', ${req.EventID}); return false;">
                                ${actionType}
                            </button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        },
        error: function (xhr, status, error) {
            console.error("❌ Error loading events:", xhr.responseText);
        }
    });
}

function prioritizeEvent(actionType, eventID) {
    var webMethodlink = "";
    if (actionType == "Prioritize") {
        console.log("prioritizing event", eventID);
        webMethodlink = "AdminDashboard1.aspx/PrioritizeEvent";
    }
    else if (actionType == "Unprioritize") {
        console.log("unprioritizing event", eventID);
        webMethodlink = "AdminDashboard1.aspx/UnprioritizeEvent";
    }
    else {
        console.log("Button Action is not determined!");
    }
    $.ajax({
        type: "POST",
        url: webMethodlink,
        data: JSON.stringify({ eventID: eventID }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response);
            getEvents();
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
        });
}
function getUsers() {
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetUser",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Raw response:", response);
            console.log("Response.d:", response.d);

            // Parse the string into a real array
            let data = [];
            console.log("Type of response.d:", typeof response.d, response.d);

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            console.log("Parsed data:", data);

            let tbody = document.getElementById("userTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No User found</td></tr>`;
                return;
            }

            // Loop through the data and build table rows
            data.forEach(req => {
                let row = `
                    <tr>
                        <td>${req.UserID}</td>
                        <td>${req.FirstName}</td>
                        <td>${req.MiddleInitial}</td>
                        <td>${req.LastName}</td>
                        <td>${req.RoleID}</td>
                        <td>${req.UserName}</td>
                        <td>${req.Email}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}
function getReservationRequests() {
    console.log("getting reservation requests!");
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetReservationRequest",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response);
            let data = [];
            console.log("Type of response.d:", typeof response.d, response.d);

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
                data = [];
            }


            console.log("Parsed data:", data);

            let tbody = document.getElementById("reservationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Reservation Request found</td></tr>`;
                return;
            }
            
            // Loop through the data and build table rows
            data.forEach(req => {
                let row = `
                    <tr>
                        <td>${req.ReservationID}</td>
                        <td>${req.ClientID}</td>
                        <td>${req.StatusID}</td>
                        <td>${req.Remarks}</td>
                        <td>${req.EventID}</td>
                        <td>${req.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                            onclick="GetRequestInfo(
                                ${req.ReservationID},
                                ${req.ClientID}, 
                                ${req.StatusID}, 
                                '${req.Remarks}', 
                                ${req.EventID}, 
                                '${req.Reference}'
                            )">
                            View
                            </button>
                        </td>

                    </tr>
                `;
                tbody.innerHTML += row;
                console.log(eventID);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}
function openReservationInfoModal() {
    viewReservationModal = new bootstrap.Modal(document.getElementById('vewReservationModal'), {
        backdrop: 'static'
    });
    viewReservationModal.show();
}

function GetRequestInfo(reservationID, clientID, statusID, remarks, eventID, reference) {
    let requestInfo = {
        ReservationID: reservationID,
        ClientID: clientID,
        StatusID: statusID,
        EventID: eventID,
    };
    console.log(requestInfo);
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetRequestInfo",
        data: JSON.stringify({ requestData: requestInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Full server response:", response.d);

            let data = response.d;
            if (typeof data === "string") {
                try { data = JSON.parse(data); } catch (e) { console.error("JSON parse error:", e); }
            }

            if (!data || !data.Client) {
                console.error("Invalid data structure:", data);
                alert("Reservation info could not be loaded.");
                return;
            }
            let assetDetails = "";
            let dateDetails = "";
            data.Asset.forEach(a => {
                assetDetails += `<p><strong>Asset:</strong> ${a.AssetName}</p>
                     <p><strong>Quantity:</strong> ${a.Quantity}</p>`;
            });
            data.Date.forEach(d => {
                dateDetails += `<p><strong>Date:</strong> ${d.Date}</p>
                     <p><strong>Starting Time:</strong> ${d.StartTime}</p>
                     <p><strong>Ending Time:</strong> ${d.EndTime}</p>`;
            });
            // ✅ Build modal dynamically here
            let modalHTML = `
                <div class='modal fade' id='viewReservationModal' role='dialog'>
                  <div class='modal-dialog'>
                    <div class='modal-content'>
                      <div class='modal-header'>
                        <h4 class='modal-title'>Reservation Info</h4>
                        <button type='button' class='btn-close' data-bs-dismiss='modal'></button>
                      </div>
                      <div class='modal-body'>
                        <p><strong>Event Title:</strong> ${data.Event}</p>
                        <p><strong>Client:</strong> ${data.Client.FirstName} ${data.Client.MiddleInitial || ""} ${data.Client.LastName}</p>
                        <p><strong>Organization:</strong> ${data.Organization}</p>
                        <p><strong>Status:</strong> ${data.Status}</p>
                        ${assetDetails}<br>
                        ${dateDetails}
                        <p><strong>Reference:</strong> ${reference}</p>
                        <p><strong>Remarks:</strong> ${remarks}</p>
                      </div>
                      <div class='modal-footer'>
                        <button type='button' class='btn btn-success' onclick="acceptReservation(${reservationID})">Accept</button>
                        <button type='button' class='btn btn-danger' data-bs-dismiss='modal'>Close</button>
                    </div>
                    </div>
                  </div>
                </div>`;


            // ✅ Remove existing modal (to avoid duplicates)
            let oldModal = document.getElementById("viewReservationModal");
            if (oldModal) oldModal.remove();

            // ✅ Add new modal to the DOM
            document.body.insertAdjacentHTML("beforeend", modalHTML);

            // ✅ Show modal
            var modalInstance = new bootstrap.Modal(document.getElementById("viewReservationModal"), {
                backdrop: "static"
            });
            modalInstance.show();
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}
function acceptReservation(reservationID) {
    let reservationInfo = {
        ReservationID : reservationID
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/AcceptReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);
            getReservationRequests();
            getAcceptedReservation();
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    })
}

function getAcceptedReservation() {
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetAcceptedReservation",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Raw response:", response);
            console.log("Response.d:", response.d);

            // Parse the string into a real array
            let data = [];
            console.log("Type of response.d:", typeof response.d, response.d);

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            console.log("Parsed data:", data);

            let tbody = document.getElementById("acceptedReservationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Accepted Reservation Request found</td></tr>`;
                return;
            }
            // Loop through the data and build table rows
            data.forEach(res => {
                let row = `
                    <tr>
                        <td>${res.ReservationID}</td>
                        <td>${res.ClientID}</td>
                        <td>${res.StatusID}</td>
                        <td>${res.Remarks}</td>
                        <td>${res.EventID}</td>
                        <td>${res.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                            onclick="GetRequestInfo(
                                ${res.ReservationID},
                                ${res.ClientID}, 
                                ${res.StatusID}, 
                                '${res.Remarks}', 
                                ${res.EventID}, 
                                '${res.Reference}'
                            )">
                            View
                            </button>
                        </td>

                    </tr>
                `;
                tbody.innerHTML += row;
            });
            
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    })
}

function openReservationModal() {
    console.log(roleId, userId, userEmail);
}

function connectDB() {
    console.log('connecting to DB..');
    var xhr = new XMLHttpRequest();
    //initiate a request to the server asynchronously (AJAX)
    xhr.open('GET', 'Default.aspx/ConnectDB', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    //send the request
    xhr.send();
    //implement the onreadystatechange callback function
    xhr.onreadystatechange = function () {
        //check if the request is complete (readyState 4) and was successful (HTTP status 200)
        if (xhr.readyState == 4 && xhr.status == 200) {
            //get server response
            var response = JSON.parse(xhr.responseText);
            console.log('Server response: ', response);
            openAlertModal('App Info', 'DB connection status: ' + response.d);
        }
    };
    //implement onerror callback function
    xhr.onerror = function () {
        //get server response
        var response = JSON.parse(xhr.responseText);
        console.log('Server response: ', response);
        openAlertModal('App Info', 'DB connection status: ' + response.d);
    };
}
function getRegistrationRequests() {
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetRegistrationRequests",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Raw response:", response);
            console.log("Response.d:", response.d);

            // Parse the string into a real array
            let data = [];
            console.log("Type of response.d:", typeof response.d, response.d);

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            console.log("Parsed data:", data);

            let tbody = document.getElementById("registrationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No registration requests found</td></tr>`;
                return;
            }

            // Loop through the data and build table rows
            data.forEach(req => {
                let row = `
                    <tr>
                        <td>${req.RequestID}</td>
                        <td>${req.FirstName}</td>
                        <td>${req.MiddleInitial}</td>
                        <td>${req.LastName}</td>
                        <td>${req.Email}</td>
                        <td>${req.Organization}</td>
                        <td>${req.UserName}</td>
                        <td>${req.Status}</td>
                        <td>${new Date(req.DateRequested).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="UserConfirmation(${req.RequestID})">Confirm</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}
function UserConfirmation(request_id) {
    console.log("request to be confirmed", request_id);
    let user_data = {
        RequestID: request_id
    };
    console.log(user_data);
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/ConfirmUser",
        data: JSON.stringify({ UserData: user_data }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("✅ User Confirmed successfully:", response.d);
            alert("User Confirmed successfully!");
            getRegistrationRequests();
            getUsers();
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}

function getAssets() {
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetAssets",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Raw response:", response);
            console.log("Response.d:", response.d);

            // Parse the string into a real array
            let data = [];
            console.log("Type of response.d:", typeof response.d, response.d);

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            console.log("Parsed data:", data);

            let tbody = document.getElementById("assetTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Assets found</td></tr>`;
                return;
            }

            // Loop through the data and build table rows
            data.forEach(req => {
                let row = `
                    <tr>
                        <td>${req.AssetId}</td>
                        <td>${req.AssetName}</td>
                        <td>${req.Quantity}</td>
                        <td>${req.CategoryID}</td>
                        <td>${req.CategoryName}</td>
                        <td>${req.IsActive}</td>
                        <td>
                          <button class="btn btn-primary btn-sm"
                              onclick="editAsset(${req.AssetId}, '${req.AssetName}', ${req.Quantity},${req.CategoryID},'${req.CategoryName}')">
                              Edit
                          </button>
                           ${
                            req.IsActive == 1
                                ? `<button class="btn btn-danger btn-sm" onclick="deactivateAsset(${req.AssetId})">Deactivate</button>`
                                : `<button class="btn btn-success btn-sm" onclick="activateAsset(${req.AssetId})">Activate</button>`
                          }
                          </td>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}

function editAsset(asset_id, asset_name, asset_quantity, categor_id, category_name) {
    console.log("Editing asset with ID:", asset_id, asset_name, asset_quantity, categor_id, category_name);
    openAssetEditorModal(asset_name, asset_quantity, categor_id, category_name);
    assetID = asset_id;
}

function createAsset() {
    const asset_name = document.getElementById('createAssetName').value.trim();
    const qty = document.getElementById('createQuantity').value;
    const categorySelect = document.getElementById("populateAssetCategory").value.trim();
    const categoryId = categorySelect ? categorySelect.value : null;

    if (!asset_name || !qty || !categoryId) {
        alert("Please fill in all required fields and select a category.");
        return;
    }

    let asset_data = {
        AssetName: asset_name,
        Quantity: qty,
        categoryId: parseInt(categoryId)
    }
    console.log("Asset to be added:", asset_data);
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/AddAsset",
        data: JSON.stringify({ assetData: asset_data }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",

        success: function (response) {
            console.log("✅ Asset Added successfully:", response.d);
            alert("Asset Added successfully!");

            const modalEl = document.getElementById("createAssetModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            getAssets();
        },
        error: function (xhr, status, error) {
            console.error("❌ Error Adding asset:", error);
            alert("Failed to Add asset. Please try again.");
        }
    })
}

function saveAssetChanges() {
    const asset_name = document.getElementById("editAssetName").value.trim();
    const qty = document.getElementById("editQuantity").value;
    const categorySelect = document.getElementById("populateEditAssetCategory");
    const categoryId = categorySelect && categorySelect.value ? parseInt(categorySelect.value) : null;

    if (!asset_name || !qty || !categoryId) {
        alert("Please fill in all required fields and select a category.");
        return;
    }

    const asset_data = {
        AssetID: assetID,              // ✅ include this to identify which asset is being updated
        AssetName: asset_name,
        Quantity: parseInt(qty),
        CategoryID: categoryId
    };

    console.log("Updating asset with data:", asset_data);

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/UpdateAsset",
        data: JSON.stringify({ assetData: asset_data }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",

        success: function (response) {
            console.log("✅ Asset updated successfully:", response.d);
            alert("Asset updated successfully!");

            // Close modal after success
            const modalEl = document.getElementById("assetEditorModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            // Reload asset list
            getAssets();
        },
        error: function (xhr, status, error) {
            console.error("❌ Error updating asset:", error, xhr.responseText);
            alert("Failed to update asset. Please try again.");
        }
    });
}

function activateAsset(asset_id) {
    console.log("Asset to activate:", asset_id);

    // Wrap asset_id inside an object so C# can read it properly
    let assetData = {
        AssetID: asset_id
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/ActivateAsset",
        data: JSON.stringify({ assetData: assetData }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("✅ This asset is now active:", response.d);
            alert("Asset activated successfully!");
            getAssets(); // Refresh your table or UI
        },
        error: function (xhr, status, error) {
            console.error("❌ Error activating asset:", error);
            alert("Failed to activate asset. Please try again.");
        }
    });
}

function deactivateAsset(asset_id) {
    console.log("Asset to deactivate:", asset_id);

    // Wrap asset_id inside an object so C# can read it properly
    let assetData = {
        AssetID: asset_id
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/DeactivateAsset",
        data: JSON.stringify({ assetData: assetData }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("✅ Asset deactivated successfully:", response.d);
            alert("Asset deactivated successfully!");
            getAssets(); // Refresh your table or UI
        },
        error: function (xhr, status, error) {
            console.error("❌ Error deactivating asset:", error);
            alert("Failed to deactivate asset. Please try again.");
        }
    });
}