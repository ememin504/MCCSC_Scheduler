//const roleIdStr = sessionStorage.getItem("role_id");
//const roleId = roleIdStr ? Number(roleIdStr) : 0;
const userIdStr = sessionStorage.getItem("user_id");
const userId = userIdStr ? Number(userIdStr) : 0;
const userEmail = sessionStorage.getItem("user_email");
const firstName = sessionStorage.getItem("first_name");
const middleInitial = sessionStorage.getItem("middle_initial");
const lastName = sessionStorage.getItem("last_name");
const roleName = sessionStorage.getItem("role_name");
const roleTypeIDStr = sessionStorage.getItem("role_type_id");
const roleTypeID = roleTypeIDStr ? Number(roleTypeIDStr) : 0;
const roleTypeDescription = sessionStorage.getItem("role_type_description");
console.log(userId);

// ==============================
document.addEventListener("DOMContentLoaded", function () {

    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
        //alertModalDiv.insertAdjacentHTML("afterend", userModalEl);
    }

    document.body.insertAdjacentHTML("beforeend", userModalEl);
    loadAssetCategories();
    getRegistrationRequests();
    getReservationRequests();
    getUsers();
    getPackages();
    getAcceptedReservation();
    getStatusCMReservation();
    getReservationCancellationRequests();
    getCancelledReservation();
    getRejectedReservation();
    getApprovedReservation();
    getFinishedReservation();
    getEvents();
    //loadNotifications();
    startNotificationPolling();
    startReservationDateCheck();


});

//console.log(roleId, userId, userEmail, roleName, roleTypeID, roleTypeDescription, firstName, middleInitial, lastName);
// categoryLoader.js
// 🌐 Global Variables
let eventID;
let reservationId;
let assetID = 0;
// ==============================
// Global category cache
// ==============================
let categoriesGlobal = [];
let noteFor = "Client";
let pageType = "Admin";
function addNotification(reservationID, statusID) {
    if (!reservationID || !userId || !statusID || !noteFor) {
        console.warn("Missing parameters in addNotification:", { reservationID, userId, statusID, noteFor });
        return;
    }

    let notificationInfo = {
        ReservationID: reservationID,
        UserID: userId,
        StatusID: statusID,
        NoteFor: noteFor
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/CreateNotification",
        data: JSON.stringify({ notificationDTO: notificationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Notification response:", response.d);
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", { status, error, responseText: xhr.responseText });
            alert("A system error occurred. Please check the console for details.");
        }
    });
}
function startNotificationPolling() {
    loadNotifications();
    setInterval(() => {
        loadNotifications();
        //startReservationDateCheck();
    }, 5000);
}
function startReservationDateCheck() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Final SQL formats
    const todayDate = `${year}-${month}-${day}`;            // YYYY-MM-DD
    const todayTime = `${hours}:${minutes}:${seconds}.0000000`; // HH:MM:SS.0000000
    //const todayDate = "2025-11-29";
    //const todayTime = "23:42:00.0000000";


    let dateTimeNow = {
        Date: todayDate,
        EndTime: todayTime
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/MarkTodaysReservation",
        data: JSON.stringify({ eventDateDTO: dateTimeNow }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            let statusCheck = JSON.parse(response.d);
            console.log(statusCheck);
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}


function loadNotifications() {
    let clientID = 0;
    let notificationInfo = {
        PageType: pageType,
        UserID: userId,
        ClientID: clientID
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetNotifications",
        data: JSON.stringify({ notificationDTO: notificationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            let notifications = JSON.parse(response.d);
            //console.log(notifications)
            //displayNotifications(notifications);
            return notifications;
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}
function displayNotifications(notifications) {
    $("#notificationTableBody").empty(); // Clear old rows
    if (!Array.isArray(notifications)) {
        console.error("Notifications is not an array:", notifications);
        return;
    }
    notifications.forEach(n => {

        // Format date (if needed)
        let formattedDate = new Date(n.CreatedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // Determine message by status_id
        let message = "";
        switch (n.StatusID) {
            case 2:
                message = "A Reservation Request has been added to the waiting list!";
                break;
            case 8:
                message = "A Cancellation Request has been added to the waiting list!";
                break;
            default:
                message = "Status updated.";
                break;
        }

        // Build the table row
        let row = `
            <tr class="${n.IsRead ? '' : 'table-warning'}">

                <td>${formattedDate}</td>
                <td>${message}</td>
                <td>
                    <button class = "btn btn-primary" onclick="markAsRead(${n.NotificationID}); return false;">
                    Mark as Read
                    </button>
                </td>
            </tr>
        `;

        $("#notificationTableBody").append(row);
    });
}

// ==============================
// SAVE CATEGORY CHANGES
// ==============================
function markAsRead(notificationID) {
    console.log("Marking notification as read!", notificationID);
    let notificationData = {
        NotificationID: notificationID
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/MarkAsRead",
        data: JSON.stringify({ notificationDTO: notificationData }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert(response.d);
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    })
}

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
                        onclick="openEditCategoryModal(${item.CategoryID}, '${safeName}', ${item.ParentCategoryID ?? 'null'}); return false;">
                    Edit
                </button>
                ${item.IsActive == 1
                ? `<button class="btn btn-danger btn-sm" onclick="deactivateCategory(${item.CategoryID}); return false;">Deactivate</button>`
                : `<button class="btn btn-success btn-sm" onclick="activateCategory(${item.CategoryID}) return false;">Activate</button>`
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
    } else if (action === "edit_category") {
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
    } else if (event.target.id === "editCategoryModal") {
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

            // Parse the string into a real array
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

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
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
                data = [];
            }

            let tbody = document.getElementById("reservationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Reservation Request found</td></tr>`;
                return;
            }

            // Loop through the data and build table rows
            data.forEach(req => {
                let dates = req.EventDates.length
                    ? req.EventDates.map(d => {
                        let formattedDate = d.Date.split('T')[0];
                        let start = to12Hour(d.StartTime);
                        let end = to12Hour(d.EndTime);
                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";

                let row = `
                    <tr>
                        <td>${req.EventName}</td>
                        <td>${req.PackageName}</td>
                        <td>${req.OrganizationName}</td>
                        <td>${dates}</td>
                        <td>${req.Suggestions}</td>
                        <td>${req.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                                onclick='openReservationInfoModal(${JSON.stringify(req)}); return false;'>
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
    });
}
let currentDate = new Date(); // ✅ MUST be Date
let allReservations = [];
let calendarReservations = [];

function getApprovedReservation() {
    console.log("getting approved reservation!");

    let reservationType = "Approved Reservation";
    let requestInfo = { ReservationType: reservationType };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetReservation",
        data: JSON.stringify({ requestData: requestInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",

        success: function (response) {

            let data = [];
            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
                return;
            }
            console.log(data);
            let tbody = document.getElementById("approvedReservationTableBody");
            tbody.innerHTML = "";

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML =
                    `<tr><td colspan="6" class="text-center">No Reservation Request found</td></tr>`;
                return;
            }

            let allReservations = []; // ✅ DECLARE ONCE

            data.forEach(req => {
                let dates = req.EventDates.length
                    ? req.EventDates.map(d => {
                        let formattedDate = d.Date.split('T')[0];
                        let start = to12Hour(d.StartTime);
                        let end = to12Hour(d.EndTime);

                        // ✅ collect calendar data
                        allReservations.push({
                            Date: d.Date,
                            StartTime: d.StartTime,
                            EndTime: d.EndTime,
                            EventName: req.EventName
                        });

                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";
                let row = `
                    <tr>
                        <td>${req.EventName}</td>
                        <td>${req.PackageName}</td>
                        <td>${req.OrganizationName}</td>
                        <td>${dates}</td>
                        <td>${req.Suggestions}</td>
                        <td>${req.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                                onclick='openReservationInfoModal(${JSON.stringify(req)}); return false;'>
                                View
                            </button>
                        </td>
                    </tr>
                `;

                tbody.innerHTML += row;
                // build table row...
            });
            // ✅ CALL ONCE, AFTER LOOP
            calendarReservations = allReservations;
            generateCalendar(currentDate, calendarReservations, data);
            console.log("Approved Reservation: ",data);
        },

        error: function (xhr) {
            console.error("Error:", xhr.responseText);
        }
    });
}


async function getFinishedReservation() {
    console.log("getting finished reservation!");

    let reservationType = "Expired Reservation";
    let requestInfo = { ReservationType: reservationType };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetReservation",
        data: JSON.stringify({ requestData: requestInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: async function (response) {

            let data = [];
            try { data = JSON.parse(response.d); }
            catch { data = []; }

            let tbody = document.getElementById("finishedReservationTableBody");
            tbody.innerHTML = "";

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Reservation Request found</td></tr>`;
                return;
            }

            for (const req of data) {

                let ratings = await getRatings(req.ReservationID);
                // Extract rating value from array [{ Rating: 4 }]
                let ratingValue =
                    ratings.length > 0 ? Number(ratings[0].number_of_stars) : null;

                let ratingDisplay =
                    ratings.length > 0
                        ? renderStars(ratings[0].NumberOfStars)
                        : "No Rating";

                console.log("Raw ratings:", ratings);
                console.log("Rating Value:", ratingValue, "Type:", typeof ratingValue);


                let dates = req.EventDates.length
                    ? req.EventDates.map(d => {
                        let formattedDate = d.Date.split('T')[0];
                        let start = to12Hour(d.StartTime);
                        let end = to12Hour(d.EndTime);
                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";

                let row = `
                    <tr>
                        <td>${req.EventName}</td>
                        <td>${req.PackageName}</td>
                        <td>${req.OrganizationName}</td>
                        <td>${dates}</td>
                        <td>${req.Reference}</td>
                        <td>${ratingDisplay}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                                onclick='openReservationInfoModal(${JSON.stringify(req)}); return false;'>
                                View
                            </button>
                        </td>
                    </tr>
                `;

                tbody.innerHTML += row;
            }

        }
    });
}
async function getUninishedReservation() {
    console.log("getting unfinished reservation!");

    let reservationType = "Unfinished Reservation";
    let requestInfo = { ReservationType: reservationType };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetReservation",
        data: JSON.stringify({ requestData: requestInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: async function (response) {

            let data = [];
            try { data = JSON.parse(response.d); }
            catch { data = []; }

            let tbody = document.getElementById("unfinishedReservationTableBody");
            tbody.innerHTML = "";

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Reservation Request found</td></tr>`;
                return;
            }

            for (const req of data) {

                let ratings = await getRatings(req.ReservationID);
                // Extract rating value from array [{ Rating: 4 }]
                let ratingValue =
                    ratings.length > 0 ? Number(ratings[0].number_of_stars) : null;

                let ratingDisplay =
                    ratings.length > 0
                        ? renderStars(ratings[0].NumberOfStars)
                        : "No Rating";

                console.log("Raw ratings:", ratings);
                console.log("Rating Value:", ratingValue, "Type:", typeof ratingValue);


                let dates = req.EventDates.length
                    ? req.EventDates.map(d => {
                        let formattedDate = d.Date.split('T')[0];
                        let start = to12Hour(d.StartTime);
                        let end = to12Hour(d.EndTime);
                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";

                let row = `
                    <tr>
                        <td>${req.EventName}</td>
                        <td>${req.PackageName}</td>
                        <td>${req.OrganizationName}</td>
                        <td>${dates}</td>
                        <td>${req.Reference}</td>
                        <td>${ratingDisplay}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                                onclick='openReservationInfoModal(${JSON.stringify(req)}); return false;'>
                                View
                            </button>
                        </td>
                    </tr>
                `;

                tbody.innerHTML += row;
            }

        }
    });
}
function renderStars(rating) {
    const maxStars = 5;
    let stars = "";

    for (let i = 1; i <= maxStars; i++) {
        stars += i <= rating ? "⭐" : "✩";
    }

    return stars;
}


function getRatings(reservationID) {
    return new Promise(function (resolve, reject) {
        let requestInfo = { ReservationID: reservationID };

        $.ajax({
            type: "POST",
            url: "AdminDashboard1.aspx/GetRatings",
            data: JSON.stringify({ ratingDTO: requestInfo }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                try {
                    let data = JSON.parse(response.d);
                    resolve(data.data);  // return ratings array
                } catch (e) {
                    reject(e);
                }
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        });
    });
}


function to12Hour(time) {
    if (!time) return "";
    let [hour, minute] = time.split(':').map(Number);
    let ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
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

            // Parse the string into a real array
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }


            let tbody = document.getElementById("acceptedReservationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Accepted Reservation Request found</td></tr>`;
                return;
            }
            // Loop through the data and build table rows
            data.forEach(res => {
                let dates = res.EventDates?.length
                    ? res.EventDates.map(d => {
                        const formattedDate = d?.Date?.split('T')[0] ?? 'No date';
                        const start = d?.StartTime ? to12Hour(d.StartTime) : '--:--';
                        const end = d?.EndTime ? to12Hour(d.EndTime) : '--:--';
                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";
                let row = `
                    <tr>
                        <td>${res.EventName}</td>
                        <td>${res.PackageName}</td>
                        <td>${res.OrganizationName}</td>
                        <td>${dates}</td>
                        <td>${res.Suggestions}</td>
                        <td>${res.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                                onclick='openReservationInfoModal(${JSON.stringify(res)}); return false;'>
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

            // Parse the string into a real array
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }


            let tbody = document.getElementById("stautsCMReservationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Reservation found</td></tr>`;
                return;
            }
            // Loop through the data and build table rows
            data.forEach(res => {
                let dates = res.EventDates?.length
                    ? res.EventDates.map(d => {
                        const formattedDate = d?.Date?.split('T')[0] ?? 'No date';
                        const start = d?.StartTime ? to12Hour(d.StartTime) : '--:--';
                        const end = d?.EndTime ? to12Hour(d.EndTime) : '--:--';
                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";
                let row = `
                    <tr>
                        <td>${res.EventName}</td>
                        <td>${res.PackageName}</td>
                        <td>${res.OrganizationName}</td>
                        <td>${formatDate(dates)}</td>
                        <td>${formatDate(res.Meetings[0].MeetingDate)}<br>${formatTime(res.Meetings[0].MeetingTime)}</td>
                        <td>${res.Meetings[0].MeetingRemarks}</td>
                        <td>${res.Suggestions}</td>
                        <td>${res.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                                onclick='openReservationInfoModal(${JSON.stringify(res)}); return false;'>
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
function formatDate(dateString) {
    if (!dateString) return "";

    // Remove the T and time
    return dateString.split("T")[0];
}

function formatTime(timeString) {
    if (!timeString) return "";

    let [hour, minute] = timeString.split(":");

    hour = parseInt(hour);
    let suffix = hour >= 12 ? "PM" : "AM";

    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    return `${hour}:${minute} ${suffix}`;
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

            // Parse the string into a real array
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            let tbody = document.getElementById("cancellationRequestTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Cancellation Request found</td></tr>`;
                return;
            }
           
            // Loop through the data and build table rows
            data.forEach(res => {
                res.Reason = res.Reason ? res.Reason.replace(/'/g, '`') : '';
                let dates = res.EventDates?.length
                    ? res.EventDates.map(d => {
                        const formattedDate = d?.Date?.split('T')[0] ?? 'No date';
                        const start = d?.StartTime ? to12Hour(d.StartTime) : '--:--';
                        const end = d?.EndTime ? to12Hour(d.EndTime) : '--:--';
                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";
                let row = `
                    <tr>
                        <td>${res.EventName}</td>
                        <td>${res.PackageName}</td>
                        <td>${res.OrganizationName}</td>
                        <td>${dates}</td>
                        <td>${res.Suggestions}</td>
                        <td>${res.Reference}</td>
                        <td>
                           <button class="btn btn-success btn-sm"
                                type="button" onclick='openReservationInfoModal(${JSON.stringify(res)}); return false;'>
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

function getCancelledReservation() {
    let reservationType = "Cancelled";
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
            // Parse the string into a real array
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            let tbody = document.getElementById("cancelledReservationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Cancelled Reservation found</td></tr>`;
                return;
            }
            // Loop through the data and build table rows
            data.forEach(res => {
                let dates = res.EventDates?.length
                    ? res.EventDates.map(d => {
                        const formattedDate = d?.Date?.split('T')[0] ?? 'No date';
                        const start = d?.StartTime ? to12Hour(d.StartTime) : '--:--';
                        const end = d?.EndTime ? to12Hour(d.EndTime) : '--:--';
                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";
                let row = `
                    <tr>
                        <td>${res.EventName}</td>
                        <td>${res.PackageName}</td>
                        <td>${res.OrganizationName}</td>
                        <td>${dates}</td>
                        <td>${res.Reason}</td>
                        <td>${res.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                                onclick='openReservationInfoModal(${JSON.stringify(res)}); return false;'>
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

function openReservationInfoModal(res) {
    console.log(res);
    let assetDetails = "";
    let dateDetails = "";
    let callFunction = "";
    let buttonText = "";
    let buttonClass = "";
    let newCallFunction = "";
    let newButtonText = "";
    let newButtonClass = "";
    
    // FIXED: use StatusName, not StatusID
    switch (res.StatusName) {
        case "Accepted":
            callFunction = "coordinationMeetingSetUp";
            buttonText = "Set Coordination Meeting";
            buttonClass = "btn btn-primary"

            newCallFunction = "openRejectModal";
            newButtonText = "Reject Reservation";
            newButtonClass = "btn btn-danger";
            break;
        case "Pending":
        case "Reservation Request": // if this is your actual name
            callFunction = "acceptReservation";
            buttonText = "Accept";
            buttonClass = "btn btn-primary";

            newCallFunction = "openRejectModal";
            newButtonText = "Reject Reservation";
            newButtonClass = "btn btn-danger";
            break;

        case "Coordination Meeting":
            callFunction = "approveReservation";
            buttonText = "Approve Reservation";
            buttonClass = "btn btn-primary";

            newCallFunction = "openRejectModal";
            newButtonText = "Reject Reservation";
            newButtonClass = "btn btn-danger";
            break;

        case "Cancellation Request":
            callFunction = "confirmCancellation";
            buttonText = "Confirm Cancellation";
            buttonClass = "btn btn-danger";
            break;

        default:
            callFunction = "";
            buttonText = "";
            break;
    }

    res.EventDates.forEach(d => {
        dateDetails += `
        <p><strong>Date:</strong> ${formatDate(d.Date)}</p >
        <p><strong>Start:</strong> ${to12Hour(d.StartTime)}</p>
        <p><strong>End:</strong> ${to12Hour(d.EndTime)}</p>
    `;
    });

    let safeRes = encodeURIComponent(JSON.stringify(res));

    let modalHTML = `
        <div class='modal fade' id='viewReservationModal'>
            <div class='modal-dialog'>
                <div class='modal-content'>
                    <div class='modal-header'>
                        <h4>Reservation Info</h4>
                        <button class='btn-close' data-bs-dismiss='modal'></button>
                    </div>
                    <div class='modal-body'>
                        <p><strong>Event:</strong> ${res.EventName}</p>
                        <p><strong>Package:</strong> ${res.PackageName}</p>
                        <p><strong>Client:</strong> ${res.Client.FirstName} ${res.Client.MiddleInitial ?? ""} ${res.Client.LastName}</p>
                        <p><strong>Organization:</strong> ${res.Client.Organization}</p>
                        <p><strong>Status:</strong> ${res.StatusName}</p>
                        ${assetDetails}
                        ${dateDetails}
                        <p><strong>Reference:</strong> ${res.Reference}</p>
                        ${res.Suggestions !== ""
                            ? `<p><strong>Suggestions:</strong> ${res.Suggestions}</p>`
                            :""
                        }
                        ${res.Reason !== ""
                            ? `<p><strong>Reason:</strong> ${res.Reason}</p>`
                            :""
                        }
                        ${res.Remarks !== ""
                            ? `<p><strong>Reason:</strong> ${res.Remarks}</p>`
                            : ""
                        }
                    </div>
                    <div class='modal-footer'>
                        ${callFunction !== ""
                        ? `<button class='${buttonClass}' onclick="${callFunction}('${safeRes}', ${res.ReservationID}); return false;">${buttonText}</button>`
                        : ""}
                        ${newCallFunction !== ""
                        ? `<button class='${newButtonClass}' onclick="${newCallFunction}('${safeRes}', ${res.ReservationID}); return false;">${newButtonText}</button>`
                        : ""}
               
                        <button class='btn btn-secondary btn' data-bs-dismiss='modal'>Close</button>
                    </div>
                </div>
            </div>
        </div>
        `;

    // Remove old modal
    let old = document.getElementById("viewReservationModal");
    if (old) old.remove();

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    new bootstrap.Modal(document.getElementById("viewReservationModal"), {
        backdrop: "static"
    }).show();
}

var rejectContext = null;
function openRejectModal(res, reservationID, clientID) {

    // Hide viewReservationModal properly
    let viewModalEl = document.getElementById("viewReservationModal");
    if (viewModalEl) {
        let viewModal = bootstrap.Modal.getInstance(viewModalEl);
        if (viewModal) viewModal.hide();
    }

    // Remove existing reject modal
    $('#rejectModal').remove();

    // Create modal
    let modal = `
        <div class="modal fade" id="rejectModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">Reject Reservation</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body">
                        <p>Please provide your reason for rejection:</p>
                        <textarea id="RejectReasonInput"
                                  class="form-control"
                                  rows="3"
                                  placeholder="Reason..."></textarea>
                    </div>

                    <div class="modal-footer">
                        <button type="button" id="rejectBtn" class="btn btn-danger">
                            Reject
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;

    // Append modal to body
    $('body').append(modal);

    // Show modal
    let rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    rejectModal.show();

    // Handle submit
    $('#rejectBtn').off('click').on('click', function () {
        let remarks = $('#RejectReasonInput').val().trim();

        if (!remarks) {
            alert("Please provide a reason for rejection.");
            return;
        }

        rejectReservation(reservationID, clientID, remarks);
    });
}

function rejectReservation(reservationID, clientID, remarks) {

    let reservationInfo = {
        ReservationID: reservationID,
        ClientID: clientID,
        Remarks: remarks
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/RejectReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);

            alert("This reservation is successfully rejected");

            getRejectedReservation();
            getStatusCMReservation();
            addNotification(reservationID, 4);

            // Close reject modal
            let modalEl = document.getElementById('rejectModal');
            if (modalEl) {
                let rejectModal = bootstrap.Modal.getInstance(modalEl);
                if (rejectModal) rejectModal.hide();
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
        }
    });
}

function getRejectedReservation() {
    let reservationType = "Rejected";
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
            // Parse the string into a real array
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            let tbody = document.getElementById("rejectedReservationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Rejected Reservation found</td></tr>`;
                return;
            }
            // Loop through the data and build table rows
            data.forEach(res => {
                let dates = res.EventDates?.length
                    ? res.EventDates.map(d => {
                        const formattedDate = d?.Date?.split('T')[0] ?? 'No date';
                        const start = d?.StartTime ? to12Hour(d.StartTime) : '--:--';
                        const end = d?.EndTime ? to12Hour(d.EndTime) : '--:--';
                        return `${formattedDate} (${start} - ${end})`;
                    }).join("<br>")
                    : "No dates";
                let row = `
                    <tr>
                        <td>${res.EventName}</td>
                        <td>${res.PackageName}</td>
                        <td>${res.OrganizationName}</td>
                        <td>${dates}</td>
                        <td>${res.Remarks}</td>
                        <td>${res.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                                onclick='openReservationInfoModal(${JSON.stringify(res)}); return false;'>
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

var approveContext = null;
function approveReservation(res, reservationID, clientID) {

    approveContext = {
        res: res,
        reservationID: reservationID,
        clientID: clientID
    };
    // ✅ Properly hide Bootstrap 5 modal
    const viewModalEl = document.getElementById("viewReservationModal");
    const viewModal = bootstrap.Modal.getInstance(viewModalEl);
    if (viewModal) viewModal.hide();
    openConfirmationModal(
        "Are you sure you want to approve this reservation?",
        approveReservationConfirmed
    );
}
function approveReservationConfirmed() {

    if (!approveContext) return;

    let reservationInfo = {
        ReservationID: approveContext.reservationID,
        ClientID: approveContext.clientID
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/ApproveReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert(response.d);
            $('#viewReservationModal').modal('hide');
            getStatusCMReservation();
            getApprovedReservation();
            addNotification(approveContext.reservationID, 9);
            approveContext = null;
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
}
function editReservationInfo(data, reservationID) {
    openEditReservationModal();
}
var cancelContext = null;
function confirmCancellation(res, reservationID, clientID) {
    cancelContext = {
        res: res,
        reservationID: reservationID,
        clientID: clientID
    };
    console.log(cancelContext);
    // ✅ Properly hide Bootstrap 5 modal
    const viewModalEl = document.getElementById("viewReservationModal");
    const viewModal = bootstrap.Modal.getInstance(viewModalEl);
    if (viewModal) viewModal.hide();
    openConfirmationModal(
        "Please confirm to cancel this reservation?",
        confirmCancellationConfirmed
    );
}
function confirmCancellationConfirmed() {
    if (!cancelContext) return;

    // Decode the Reason if needed
    let decodedRes = typeof cancelContext.res === "string"
        ? JSON.parse(decodeURIComponent(cancelContext.res))
        : cancelContext.res;

    let reservationInfo = {
        ReservationID: cancelContext.reservationID,
        ClientID: decodedRes.ClientID,
        Remarks: decodedRes.Reason
    };
    console.log(reservationInfo);
    console.log(decodedRes);
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/CancelReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert('Reservation cancelled successfully.');
            getReservationCancellationRequests();
            getCancelledReservation();
            addNotification(reservationInfo.ReservationID, 7);
        },
        error: function (xhr, status, error) {
            console.error('Error cancelling reservation:', error);
            alert('An error occurred. Please try again.');
        }
    });

    cancelContext = null;
}
let reservationIDGlobal = 0;
function coordinationMeetingSetUp(dataStr, reservationID) {
    const data = JSON.parse(decodeURIComponent(dataStr));
    console.log("Decoded Reservation Data", data, reservationID);
    reservationIDGlobal = reservationID;
    $("#viewReservationModal").modal("hide");
    openCoordinationMeetingModal(data, reservationID);
}

function saveCoordinationMeeting() {
    let meetingDate = document.getElementById("meetingDate").value;
    let meetingTime = document.getElementById("meetingTime").value;
    if (meetingTime && meetingTime.length === 5) meetingTime += ":00"; // "13:30" → "13:30:00"
    let meetingRemarks = document.getElementById("meetingRemarks").value.trim();

    let meetingInfo = {
        ReservationID: reservationIDGlobal,
        MeetingDate: meetingDate,
        MeetingTime: meetingTime,
        MeetingRemarks: meetingRemarks
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
            addNotification(reservationId, 5);
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            alert("Failed to save meeting. Please try again.");
        }
    });
}
var acceptContext = null;
function acceptReservation(res, reservationID, clientID) {

    acceptContext = {
        res: res,
        reservationID: reservationID,
        clientID: clientID
    };
    // ✅ Properly hide Bootstrap 5 modal
    const viewModalEl = document.getElementById("viewReservationModal");
    const viewModal = bootstrap.Modal.getInstance(viewModalEl);
    if (viewModal) viewModal.hide();
    openConfirmationModal(
        "Have you received the Letter of Intent?",
        acceptReservationConfirmed
    );
}
function acceptReservationConfirmed() {

    if (!acceptContext) return;

    let reservationInfo = {
        ReservationID: acceptContext.reservationID,
        ClientID: acceptContext.clientID
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/AcceptReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            $('#viewReservationModal').modal('hide');
            getAcceptedReservation();
            getReservationRequests();
            addNotification(acceptContext.reservationID, 3);
            acceptContext = null;
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });
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

            // Parse the string into a real array
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            let tbody = document.getElementById("registrationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No registration requests found</td></tr>`;
                return;
            }

            // Loop through the data and build table rows
            data.forEach(req => {
                console.log("Get Registration data:", req);
                let row = `
                    <tr>
                        <td>${req.FirstName}</td>
                        <td>${req.LastName}</td>
                        <td>${req.Organization}</td>
                        <td>${req.UserName}</td>
                        <td>${new Date(req.DateRequested).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-success" onclick="UserConfirmation(${req.RequestID}); return false;">Confirm</button>
                            <button class="btn btn-primary"
                                onclick="viewRequestInfo(
                                    '${req.FirstName}',
                                    '${req.LastName}',
                                    '${req.Organization}',
                                    '${req.Email}',
                                    '${req.ContactNumber}',
                                    '${req.UserName}'
                                ); return false;">
                                View Request
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
    });
}
function viewRequestInfo(firstName, lastName, organization, email, contactNumber, userName) {

    let content = `
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Organization:</strong> ${organization}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact Number:</strong> ${contactNumber}</p>
        <p><strong>Username:</strong> ${userName}</p>
    `;

    document.getElementById("userModalContent").innerHTML = content; // ✔ Correct
    openUserModal(); // ✔ Uses function from global.js
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

function getPackages() {
    console.log("Loading Packages");

    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/GetPackages",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {

            // Parse the JSON string
            let data = [];
            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            console.log("Parsed data:", data);

            let tbody = document.getElementById("packageTableBody");
            tbody.innerHTML = "";

            // No records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center">No Packages found</td></tr>`;
                return;
            }

            // Build table rows
            data.forEach(pkg => {
                // Convert items array to a readable string
                let itemsStr = pkg.ItemIncluded.map(i => `${i.ItemName} (${i.QuantityAvailable})`).join(", ");

                let row = `
                    <tr>
                        <td>${pkg.PackageID}</td>
                        <td>${pkg.PackageName}</td>
                        <td>${itemsStr}</td>
                        <td>${pkg.ConsecutiveDaysAllowed}</td>
                        <td>${pkg.DaysPrior}</td>
                        <td>${pkg.Price}</td>
                        <td>${pkg.IsActive ? "Active" : "Inactive"}</td>
                        <td>
                            <button class="btn btn-primary btn-sm"
                                onclick='editPackage(${pkg.PackageID}, "${pkg.PackageName}", ${JSON.stringify(pkg.ItemIncluded)}, ${pkg.ConsecutiveDaysAllowed}, ${pkg.DaysPrior}, ${pkg.Price}); return false;'>
                                Edit
                            </button>
                            ${pkg.IsActive
                        ? `<button class="btn btn-danger btn-sm" onclick="deactivatePackage(${pkg.PackageID}); return false;">Deactivate</button>`
                        : `<button class="btn btn-success btn-sm" onclick="activatePackage(${pkg.PackageID}); return false;">Activate</button>`
                    }
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        },
        error: function (xhr, status, error) {
            console.error("Error loading packages:", xhr.responseText);
        }
    });
}
function CreatePackage() {
    const packageName = document.getElementById("createPackageName").value.trim();
    const daysAllowed = parseInt(document.getElementById("createDaysAllowed").value);
    const daysPrior = parseInt(document.getElementById("createDaysPrior").value);
    const price = parseInt(document.getElementById("createPrice").value);

    if (!packageName || isNaN(daysAllowed) || isNaN(daysPrior) || isNaN(price)) {
        alert("Please fill in all fields.");
        return;
    }

    // Collect item inclusions
    const itemIncluded = [];
    const itemRows = document.querySelectorAll("#createItemsContainer .item-row");
    itemRows.forEach(row => {
        const itemName = row.querySelector(".item-name").value.trim();
        const quantity = parseInt(row.querySelector(".quantity").value);

        if (itemName && !isNaN(quantity)) {
            itemIncluded.push({
                ItemID: 0, // New item
                ItemName: itemName,
                QuantityAvailable: quantity,
            });
        }
    });

    if (itemIncluded.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    const payload = {
        PackageName: packageName,
        ConsecutiveDaysAllowed: daysAllowed,
        DaysPrior: daysPrior,
        ItemIncluded: itemIncluded,
        Price: price
    };

    console.log("Payload:", payload);

    // Get modal element
    const modalElement = document.getElementById("createPackageModal");

    // AJAX call to backend
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/CreatePackage",
        data: JSON.stringify({ packageDTO: payload }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
            if (bootstrapModal) bootstrapModal.hide();
            alert("Package created successfully!");
            // Clear form or close modal here if needed
            getPackages(); // Refresh package table
        },
        error: function (xhr) {
            console.error("Error creating package:", xhr.responseText);
            alert("Failed to create package.");
        }
    });
}

function editPackage(packageID, packageName, itemIncluded, daysAllowed, daysPrior, price) {
    console.log(packageID, packageName, itemIncluded, daysAllowed, daysPrior, price);
    openEditPackageModal(packageID, packageName, itemIncluded, daysAllowed, daysPrior, price);
}

function savePackageChanges() {
    const modal = document.getElementById('packageEditorModal');
    if (!modal) return;

    const packageID = parseInt(modal.dataset.packageId);
    const packageName = modal.querySelector('#editPackageName').value.trim();
    const daysAllowed = parseInt(modal.querySelector('#editDaysAllowed').value);
    const daysPrior = parseInt(modal.querySelector('#editDaysPrior').value);
    const price = parseInt(modal.querySelector('#editPrice').value);

    if (!packageName || isNaN(daysAllowed) || isNaN(price)) {
        alert("Please fill in all fields.");
        return;
    }

    const items = [];
    modal.querySelectorAll('.item-row').forEach(row => {
        const itemName = row.querySelector('.item-name').value.trim();
        const quantity = parseInt(row.querySelector('.quantity').value);
        const itemID = row.dataset.itemId ? parseInt(row.dataset.itemId) : 0;

        if (itemName && !isNaN(quantity)) {
            items.push({
                ItemID: itemID,
                ItemName: itemName,
                QuantityAvailable: quantity,
            });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    const payload = {
        PackageID: packageID,
        PackageName: packageName,
        ConsecutiveDaysAllowed: daysAllowed,
        DaysPrior: daysPrior,
        ItemIncluded: items,
        Price: price
    };
    console.log(payload);
    // AJAX call
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/SavePackage",
        data: JSON.stringify({ packageDTO: payload }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert("Package saved successfully!");
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
            getPackages(); // Refresh table
        },
        error: function (xhr) {
            console.error("Error saving package:", xhr.responseText);
            alert("Failed to save package.");
        }
    });
}
function deactivatePackage(packageID) {
    let payload = {
        PackageID: packageID
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/DeactivatePackage",
        data: JSON.stringify({ packageDTO: payload }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert(response.d);
            getPackages();
        },
        error: function (xhr) {
            console.error("Error saving package:", xhr.responseText);
            alert("Failed to save package.");
        }
    })
}
function activatePackage(packageID) {
    let payload = {
        PackageID: packageID
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard1.aspx/ActivatePackage",
        data: JSON.stringify({ packageDTO: payload }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert(response.d);
            console.log(response.d);
            getPackages();
        },
        error: function (xhr) {
            console.error("Error saving package:", xhr.responseText);
            alert("Failed to save package.");
        }
    })
}