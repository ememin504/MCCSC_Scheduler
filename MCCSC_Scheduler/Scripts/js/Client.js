var clientID = 0;
const roleId = sessionStorage.getItem("role_id");
const userIdStr = sessionStorage.getItem("user_id");
const userId = userIdStr ? Number(userIdStr) : 0;
const userEmail = sessionStorage.getItem("user_email");
const roleName = sessionStorage.getItem("role_name");
const roleTypeIDStr = sessionStorage.getItem("role_type_id");
const roleTypeID = roleTypeIDStr ? Number(roleTypeIDStr) : 0;
const roleTypeDescription = sessionStorage.getItem("role_type_description");
var organizationID = 0;
console.log(roleId, userId, userEmail);
let selectedAssets = []; // use array in case multiple assets are checked
let n = 0;
let noteFor = "Admin";
let pageType = "Client"

console.log(roleId, userId, userEmail);

document.addEventListener("DOMContentLoaded", function () {
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
    }

    getClientInfo();
    getAsset(); // if independent
});

function getClientInfo() {
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/GetClientInfo",
        data: JSON.stringify({ clientData: { UserID: userId } }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            let info = JSON.parse(response.d);
            clientID = info.clientID;
            organizationID = info.organizationID;

            getReservation();
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
        }
    });
}

function getReservation() {
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/GetClientReservation",
        data: JSON.stringify({ clientData: { clientID: clientID } }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            let data = JSON.parse(response.d);
            // Render reservations table
            renderReservations(data);
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
        }
    });
}

function renderReservations(data) {
    
    // Clear tables first
    $("#reservationTableBody").empty();
    $("#reservationHistoryTableBody").empty();

    // Helper to convert 24-hour to 12-hour time
    function to12Hour(time) {
        if (!time) return "";
        let [hour, minute] = time.split(':').map(Number);
        let ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    data.forEach(res => {
        // Format event dates
        let dates = res.EventDates.length
            ? res.EventDates.map(d => {
                let formattedDate = d.Date.split('T')[0];
                let start = to12Hour(d.StartTime);
                let end = to12Hour(d.EndTime);
                return `${formattedDate} (${start} - ${end})`;
            }).join("<br>")
            : "No dates";

        // Determine button properties
        let container ;

        switch (res.StatusName) {
            case "Rejected":
            case "Expired":
            case "Cancelled":
                container = $("#reservationHistoryTableBody");
                break;

            default:
                container = $("#reservationTableBody");
                break;
        }
        let safeRes = JSON.stringify(res).replace(/"/g, '&quot;');
        // Create button with data attributes
        let buttonHTML = `<button class="btn btn-primary btn-sm" onclick="viewInfo(${safeRes}, ${res.ReservationID}); return false;">View Info</button>`;


        // Append row
        let row = `<tr>
            <td>${res.EventName}</td>
            <td>${res.EventDescription}</td>
            <td>${formatAssets(res.SelectedAssets)}</td>
            <td>${res.StatusName}</td>
            <td>${dates}</td>
            <td>${res.Reference}</td>
            <td>${buttonHTML}</td>
        </tr>`;

        container.append(row);
    });
}

function viewInfo(res, reservationID) {
    let buttonText = "";
    let buttonClass = "";
    let callFunction = "";
    switch (res.StatusName) {
        case "Accepted":
        case "Coordination Meeting":
        case "Reschedule":
            buttonText = "Request Cancellation";
            buttonClass = "btn btn-warning btn";
            callFunction = "requestCancellation";
            break;

        case "Pending":
            buttonText = "Cancel Reservation";
            buttonClass = "btn btn-danger btn";
            callFunction = "cancelReservation";
            break;

        case "Cancellation Request":
            buttonText = "Undo Cancellation";
            buttonClass = "btn btn-secondary btn";
            callFunction = "undoCancellation";
            break;

        case "Rejected":
        case "Expired":
        case "Cancelled":
            buttonText = "View Info";
            buttonClass = "btn btn-secondary btn";
            callFunction = "viewInfo";
            break;

        default:
            buttonText = "";
            buttonClass = "";
            callFunction = "";
            break;
    }

    if (Array.isArray(res)) {
        res = res[0];
    }

    let assetDetails = "";
    let dateDetails = "";

    res.SelectedAssets.forEach(a => {
        assetDetails += `
            <p><strong>Asset:</strong> ${a.AssetName}</p>
            <p><strong>Quantity:</strong> ${a.Quantity}</p>
        `;
    });

    res.EventDates.forEach(d => {
        dateDetails += `
            <p><strong>Date:</strong> ${d.Date.split("T")[0]}</p>
            <p><strong>Start:</strong> ${d.StartTime}</p>
            <p><strong>End:</strong> ${d.EndTime}</p>
        `;
    });

    // Encode the object safely for onclick
    const safeRes = encodeURIComponent(JSON.stringify(res));

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
                        <p><strong>Status:</strong> ${res.StatusName}</p>
                        ${assetDetails}
                        ${dateDetails}
                        <p><strong>Reference:</strong> ${res.Reference}</p>
                        <p><strong>Remarks:</strong> ${res.Remarks}</p>
                    </div>
                    <div class='modal-footer'>
                        ${buttonText ? `<button class="${buttonClass}" onclick="${callFunction}('${safeRes}', ${res.ReservationID}, ${res.PreviousStatusID}); return false;">${buttonText}</button>` : ""}
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("viewReservationModal")?.remove();
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    new bootstrap.Modal(document.getElementById("viewReservationModal"), {
        backdrop: "static"
    }).show();
}


function undoCancellation(data, reservationID, previousStatusID) {
    console.log("Undoing Cancellation");
    let reservationInfo = {
        PreviousStatusID: previousStatusID,
        ReservationID: reservationID
    }
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/UndoCancellation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert(response.d);
            $('#viewReservationModal').modal('hide');
            getReservation();
        },
        error: function (xhr, status, error) {
            openAlertModal("Error", "An error occurred while sending your request. Please try again.");
            console.error(xhr.responseText);
        }
    });
}

function requestCancellation(res, reservationID) {
    document.getElementById("viewReservationModal")?.remove();
    openReservationCancellationModal();

    // Wait for modal to render before binding the button
    setTimeout(() => {
        document.getElementById("cancelRequestBtn").onclick = function () {
            const reason = document.getElementById("cancelReasonInput").value.trim();

            if (!reason) {
                openAlertModal("Missing Reason", "Please provide a reason before submitting.");
                return;
            }

            sendCancellationRequest(reservationID, res.StatusID, reason);
        };
    }, 200);
}

function sendCancellationRequest(reservationID, statusID, reason) {
    const reservationInfo = {
        ReservationID: reservationID,
        StatusID: statusID,
        Reason: reason,
        ClientID: clientID
    };
    console.log(reservationInfo);

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/RequestCancellation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",

        success: function (response) {
            $("#reservationCancellationModal").modal("hide");

            alert("Success", "Your cancellation request has been submitted successfully.");
            getReservation();
            addNotification(reservationID, userId, 8);
        },

        error: function (xhr, status, error) {
            openAlertModal("Error", "An error occurred while sending your request. Please try again.");
            console.error(xhr.responseText);
        }
    });
}

function cancelReservation(reservationID, clientId, statusID, eventID, referenc, remarks) {
    console.log("Cancelling Reservation");
    let reservationInfo = {
        ReservationID: reservationID
    }
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/CancelReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);
            let result = JSON.parse(response.d);
            if (result.success) {
                alert("Your reservation is successfully cancelled");
                getReservation();
                addNotification(reservationID, 7);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    })
}

function formatDates(dates) {
    if (!dates || dates.length === 0) return "No Dates";

    return dates
        .map(d => {
            let date = new Date(d.date);
            let formatted = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            return `${formatted} <br><small>${d.startTime} - ${d.endTime}</small>`;
        })
        .join("<br><br>");
}

function formatAssets(assets) {
    if (!assets || assets.length === 0) return "No Assets";

    return assets
        .map(a => `${a.AssetName} (${a.Quantity})`)
        .join("<br>");
}

function getAsset() {
    console.log("loading assets!");

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/GetAssets",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: "{}", // Empty body
        success: function (response) {
            let assets = response.d;
            let container = $("#assetContainer");
            console.log(assets);
            // Hide and clear container
            container.hide().empty();

            // Populate with checkboxes
            assets.forEach(asset => {
                if (asset.IsActive != 0) {
                    container.append(`
                        <div class="form-check d-flex align-items-center mb-2">
                            <input class="form-check-input me-2 asset-checkbox" 
                                   type="checkbox" 
                                   id="asset_${asset.AssetId}" 
                                   value="${asset.AssetId}">
                            <label class="form-check-label me-3" for="asset_${asset.AssetId}">
                                ${asset.AssetName}
                            </label>
                            <input type="number" class="form-control form-control-sm" 
                                   id="qty_${asset.AssetId}" placeholder="Qty" 
                                   min="1" max="${asset.Quantity}" 
                                   style="width: 80px;" disabled>
                            <span class="ms-1 text-muted">/ ${asset.Quantity}</span>
                        </div>
                    `);
                }
            });

            // ✅ Show container once loaded
            container.show();

            // Handle checkbox behavior
            assets.forEach(asset => {
                const checkbox = $(`#asset_${asset.AssetId}`);
                const qtyInput = $(`#qty_${asset.AssetId}`);

                checkbox.on("change", function () {
                    if (this.checked) {
                        qtyInput.prop("disabled", false);

                        // ✅ Add to selectedAssets[]
                        selectedAssets.push({
                            AssetId: asset.AssetId,
                            AssetName: asset.AssetName,
                            MaxQty: asset.Quantity,
                            Qty: 1 // default
                        });
                    } else {
                        qtyInput.prop("disabled", true).val("");

                        // ✅ Remove from selectedAssets[]
                        selectedAssets = selectedAssets.filter(a => a.AssetId !== asset.AssetId);
                    }

                    console.log("Selected Assets:", selectedAssets);
                });

                qtyInput.on("input", function () {
                    const selected = selectedAssets.find(a => a.AssetId === asset.AssetId);
                    if (selected) {
                        selected.Quantity = parseInt($(this).val()) || 1;
                    }
                    console.log("Updated Assets:", selectedAssets);
                });
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching assets:", error);
        }
    });
}

function submitReservation() {
    console.log("Submitting these assets:", selectedAssets);

    const eventName = document.getElementById("eventName").value.trim();
    const eventDescription = document.getElementById("eventDescription").value.trim();
    const eventDates = getEventDates();

    // ✅ VALIDATION SECTION
    if (!eventName) {
        alert("Please enter the event name.");
        return;
    }

    if (!eventDates || eventDates.length === 0) {
        alert("Please add at least one event date.");
        return;
    }

    if (!clientID) {
        alert("Client ID is missing. Please log in again.");
        return;
    }

    // Continue if validation passed
    let reservationInfo = {
        EventName: eventName,
        EventDescription: eventDescription,
        SelectedAssets: selectedAssets,
        EventDates: eventDates,
        ClientID: parseInt(clientID),
        organizationID: organizationID
    };

    reservationInfo = sanitizeObject(reservationInfo);

    console.log("Data to be submitted:", reservationInfo);

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/SubmitReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Raw response:", response.d);

            let result = JSON.parse(response.d);

            if (result.success) {
                let reservationID = parseInt(result.reservation_id); // match server key
                alert(result.message || "Reservation submitted successfully!");
                $('#reservationModal').modal('hide');
                getReservation();

                // ✅ Use the reservation_id returned from the server
                addNotification(reservationID, userId, 2);
            } else {
                alert(result.error || "An error occurred while submitting the reservation.");
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            alert("A system error occurred. Please try again later.");
        }
    });
}

function addNotification(reservationID, userId, statusID) {
    let notificationInfo = {
        ReservationID: reservationID,
        UserID: userId,
        StatusID: statusID,
        NoteFor: noteFor
    }
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/CreateNotification",
        data: JSON.stringify({ notificationDTO: notificationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            alert("A system error occurred. Please try again later.");
        }
    });
}

function sanitizeObject(obj) {
    if (typeof obj === "string") {
        return obj.replace(/'/g, '`'); // replace all single quotes
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === "object" && obj !== null) {
        let cleanObj = {};
        for (let key in obj) {
            cleanObj[key] = sanitizeObject(obj[key]);
        }
        return cleanObj;
    }

    return obj; // numbers, booleans, null
}

function connectDB() {
    console.log('connecting to DB...');
    var xhr = new XMLHttpRequest();
    //initiate a request to the server asynchronously (AJAX)
    xhr.open('GET', 'ClientDashboard.aspx/ConnectDB', true);
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