document.addEventListener("DOMContentLoaded", function () {
    getRegistrationRequests();
    getReservationRequests();
    getAcceptedReservation();
    getStatusCMReservation();
    getCancelledReservation();
    getUsers();
});
function getRegistrationRequests() {
    $.ajax({
        type: "POST",
        url: "AdminDashboard2.aspx/GetRegistrationRequests",
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
function getReservationRequests() {
    console.log("getting reservation requests!");
    let reservationType = "Reservation Request";
    let requestInfo = {
        ReservationType: reservationType
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard2.aspx/GetReservation",
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
        url: "AdminDashboard2.aspx/GetReservation",
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
        url: "AdminDashboard2.aspx/GetReservation",
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
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Reservation found</td></tr>`;
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
                        <td>${formatDate(res.MeetingDate)}</td>
                        <td>${formatTime(res.MeetingTime)}</td>
                        <td>${res.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                            onclick="GetRequestInfo(
                                ${res.ReservationID},
                                ${res.ClientID}, 
                                ${res.StatusID}, 
                                ${res.EventID}, 
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
function getCancelledReservation() {
    let reservationType = "Cancelled";
    let requestInfo = {
        ReservationType: reservationType
    }
    $.ajax({
        type: "POST",
        url: "AdminDashboard2.aspx/GetReservation",
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

            let tbody = document.getElementById("CancelledReservationTableBody");
            tbody.innerHTML = "";

            // Check if there are any records
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center">No Cancelled Reservation found</td></tr>`;
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
        url: "AdminDashboard2.aspx/GetRequestInfo",
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
function getUsers() {
    $.ajax({
        type: "POST",
        url: "AdminDashboard2.aspx/GetUser",
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