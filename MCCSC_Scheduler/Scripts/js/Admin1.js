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
    loadAssetCategories();
    getRegistrationRequests();
    getReservationRequests();
    getUsers();
    getAssets();
    getAcceptedReservation();
    getStatusCMReservation();
    getReservationCancellationRequests()
    getEvents();
});

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
// 🌐 Global Variables
let eventID;
let reservationId;
let assetID = 0;
// ==============================
// Global category cache
// ==============================
let categoriesGlobal = [];

// ==============================
// SAVE CATEGORY CHANGES
// ==============================
function saveCategoryChanges(categoryID) {
    const name = document.getElementById("editCategoryName").value;
    const parentId = document.getElementById("populateEditCategoryParent").value;

    const categoryInfo = {
        CategoryID: parseInt(categoryID),
        CategoryName: name,
        ParentCategoryID: parentId ? parseInt(parentId) : null
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/SaveCategoryChanges",
        data: JSON.stringify({ categoryData: categoryInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            let result;
            try {
                result = typeof response.d === "string" ? JSON.parse(response.d) : response.d;
            } catch (e) {
                console.error("Error parsing response:", e);
                alert("An unexpected error occurred.");
                return;
            }

            console.log("Server Response:", result);
            alert(result.message || "Category updated successfully.");

            // Reload categories and update table/dropdowns
            loadAssetCategories();

            // Close modal
            const modalEl = document.getElementById("editCategoryModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", error);
            alert("Failed to save category changes.");
        }
    });
}

// ==============================
// LOAD CATEGORIES
// ==============================
async function loadAssetCategories(action = "", view = "dropdown") {
    console.log("📦 Loading asset categories...");

    try {
        const response = await fetch("AdminDashboard1.aspx/GetAssetCategories", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const categories = data.d; // already deserialized

        if (!categories || !Array.isArray(categories)) {
            throw new Error("Invalid response from server.");
        }

        // Cache globally
        categoriesGlobal = categories;

        console.log("✅ Categories loaded successfully:", categories);

        // Populate table
        populateCategoryTable(categories);

        // Populate dropdowns if needed
        if (view === "dropdown" || view === "all") {
            populateCategoryDropdown(categories, action);
        }

    } catch (error) {
        console.error("❌ Error loading categories:", error);
        alert("Failed to load categories. Please try again later.");
    }
}

// ==============================
// POPULATE CATEGORY TABLE
// ==============================
function populateCategoryTable(categories) {
    const tableBody = document.querySelector("#categoryTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    categories.forEach(item => {
        // Find parent category name, or "-" if none
        const parentCategory = item.ParentCategoryID
            ? categoriesGlobal.find(cat => cat.CategoryID === item.ParentCategoryID)
            : null;
        const parentName = parentCategory ? parentCategory.CategoryName : "-";

        const safeName = item.CategoryName.replace(/'/g, "\\'").replace(/"/g, '\\"');

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.CategoryID}</td>
            <td>${item.CategoryName}</td>
            <td>${parentName}</td>
            <td>
                <button class="btn btn-sm btn-primary"
                        onclick="openEditCategoryModal(${item.CategoryID}, '${safeName}', ${item.ParentCategoryID ?? 'null'})">
                    Edit
                </button>
                ${
                item.IsActive == 1
            ? `<button class="btn btn-danger btn-sm" onclick="deactivateCategory(${item.CategoryID})">Deactivate</button>`
                    : `<button class="btn btn-success btn-sm" onclick="activateCategory(${item.CategoryID})">Activate</button>`
                              }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function deactivateCategory(categoryID) {
    if (!confirm("Are you sure you want to deactivate this category?")) return;

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/SetCategoryStatus",
        data: JSON.stringify({ categoryID: categoryID, isActive: false }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            const result = typeof response.d === "string" ? JSON.parse(response.d) : response.d;
            alert(result.message || "Category deactivated successfully.");
            loadAssetCategories(); // refresh table/dropdowns
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", error);
            alert("Failed to deactivate category.");
        }
    });
}

function activateCategory(categoryID) {
    if (!confirm("Are you sure you want to activate this category?")) return;

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/SetCategoryStatus",
        data: JSON.stringify({ categoryID: categoryID, isActive: true }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            const result = typeof response.d === "string" ? JSON.parse(response.d) : response.d;
            alert(result.message || "Category activated successfully.");
            loadAssetCategories(); // refresh table/dropdowns
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", error);
            alert("Failed to activate category.");
        }
    });
}

// ==============================
// POPULATE CATEGORY DROPDOWN
// ==============================
function populateCategoryDropdown(categories, action) {
    let select = null;

    if (action === "create") {
        select = document.getElementById("populateAssetCategory");
    } else if (action === "edit_asset") {
        select = document.getElementById("populateEditAssetCategory");
    } else if (action === "add_category") {
        select = document.getElementById("parentCategorySelect");
    }else if (action === "edit_category") {
        select = document.getElementById("populateEditCategoryParent");
    } 

    if (!select) {
        console.warn("⚠️ Dropdown element not found for action:", action);
        return;
    }

    select.innerHTML = ""; // reset
    select.innerHTML = `<option value="">-- Select Category --</option>`;
    select.innerHTML += buildCategoryOptions(categories);
}

// ==============================
// BUILD CATEGORY OPTIONS (Recursive, hierarchical)
// ==============================
function buildCategoryOptions(categories, parentId = null, level = 0) {
    let html = "";
    categories
        .filter(cat => cat.ParentCategoryID === parentId)
        .forEach(cat => {
            const indent = "&nbsp;".repeat(level * 4);
            const safeName = cat.CategoryName.replace(/'/g, "\\'").replace(/"/g, '\\"');
            html += `<option value="${cat.CategoryID}">${indent}${safeName}</option>`;
            html += buildCategoryOptions(categories, cat.CategoryID, level + 1);
        });
    return html;
}

// ==============================
// MODAL EVENT LISTENER - Auto Load Categories
// ==============================
document.addEventListener("shown.bs.modal", event => {
    let action = "";

    if (event.target.id === "createAssetModal") {
        action = "create";
    } else if (event.target.id === "assetEditorModal") {
        action = "edit_asset";
    } else if (event.target.id === "addAssetCategoryModal") {
        action = "add_category";
    }else if (event.target.id === "editCategoryModal") {
        action = "edit_category";
    }

    if (action) {
        populateCategoryDropdown(categoriesGlobal, action);
        if (!categoriesGlobal.length) loadAssetCategories(action, "dropdown");
    }
});

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
    openEditCategoryModal();
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
    let reservationType = "Reservation Request";
    let requestInfo = {
        ReservationType: reservationType
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetReservation",
        data: JSON.stringify({ requestData: requestInfo }),
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
function getAcceptedReservation() {
    let reservationType = "Accepted Reservation";
    let requestInfo = {
        ReservationType: reservationType
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetReservation",
        data: JSON.stringify({ requestData: requestInfo }),
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

function getStatusCMReservation() {
    let reservationType = "Coordination Meeting";
    let requestInfo = {
        ReservationType: reservationType
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetReservation",
        data: JSON.stringify({ requestData: requestInfo }),
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

            let tbody = document.getElementById("statusCMReservationTableBody");
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

function getReservationCancellationRequests() {
    let reservationType = "Cancellation Request";
    let requestInfo = {
        ReservationType: reservationType
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetReservation",
        data: JSON.stringify({ requestData: requestInfo }),
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

            let tbody = document.getElementById("ReservationCancellationRequestTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Cancellation Request found</td></tr>`;
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
                        <td>${res.Reason}</td>
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
            let callFunction;
            let buttonText = "";
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
            if (data.Status === "Accepted") {
                callFunction = "coordinationMeetingSetUp";
                buttonText = "Set Coordination Meeting";
            } else if (data.Status === "Pending") {
                callFunction = "acceptReservation";
                buttonText = "Accept";
            } else if (data.Status == "Coordination Meeting") {
                callFunction = "editReservationInfo";
                buttonText = "Edit Reservation";
            } else if (data.Status == "Cancellation Request") {
                callFunction = "confirmCancellation";
                buttonText = "Confirm Cancellation"
            }



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
                        <button type='button' class='btn btn-success' onclick='${callFunction}(${JSON.stringify(data)}, ${reservationID})'>${buttonText}</button>
                        <button type='button' class='btn btn-danger' data-bs-dismiss='modal'>Close</button>
                      </div>
                    </div>
                  </div>
                </div>`;

            reservationId = reservationID
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
function coordinationMeetingSetUp(data, reservationID) {
    console.log("Reservation Data", data, reservationID)
    $("#viewReservationModal").modal("hide");
    openCoordinationMeetingModal(data, reservationID);
}
function saveCoordinationMeeting() {
    let meetingDate = document.getElementById("meetingDate").value;
    let meetingTime = document.getElementById("meetingTime").value;
    if (meetingTime && meetingTime.length === 5) meetingTime += ":00"; // "13:30" → "13:30:00"
    let meetingRemarks = document.getElementById("meetingRemarks").value.trim();

    let meetingInfo = {
        ReservationID: reservationId,
        MeetingDate: meetingDate,
        MeetingTime: meetingTime,
        Remarks: meetingRemarks
    };
    console.log(meetingInfo);
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/SaveCoordinationMeeting",
        data: JSON.stringify({ meetingData: meetingInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            const result = JSON.parse(response.d);
            console.log("Server response:", result);
            alert(result.message || "Meeting saved!");
            $("#coordinationMeetingModal").modal("hide");
            getAcceptedReservation();
            getStatusCMReservation();
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            alert("Failed to save meeting. Please try again.");
        }
    });
}


function acceptReservation(data ,reservationID) {
    console.log(reservationID);
    let reservationInfo = {
        ReservationID : reservationID
    }
    console.log(reservationInfo);
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/AcceptReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);
            $('#viewReservationModal').modal('hide');
            getReservationRequests();
            getAcceptedReservation();
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    })
}
function confirmCancellation(data, reservationID) {
    console.log(reservationID);
    let reservationInfo = {
        ReservationID: reservationID
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/CancelReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);
            $('#viewReservationModal').modal('hide');
            getReservationRequests();
            getAcceptedReservation();
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

    console.log(categorySelect);
    if (!asset_name || !qty || !categorySelect) {
        alert("Please fill in all required fields and select a category.");
        return;
    }

    let asset_data = {
        AssetName: asset_name,
        Quantity: qty,
        CategoryID: parseInt(categorySelect)
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