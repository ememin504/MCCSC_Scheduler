document.addEventListener("DOMContentLoaded", function () {
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
    }

    getRegistrationRequests();
    getReservationRequests();
    getUsers();
    getAssets();
});
const roleId = sessionStorage.getItem("role_id");
const userId = sessionStorage.getItem("user_id");
const userEmail = sessionStorage.getItem("user_email");

console.log(roleId, userId, userEmail);

function getUsers() {
    $.ajax({
        type: "POST",
        url: "AdminDashboard.aspx/GetUser",
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
        url: "AdminDashboard.aspx/GetReservationRequest",
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
            }

            console.log("Parsed data:", data);

            let tbody = document.getElementById("reservationTableBody");
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
                        <td>${req.ReservationID}</td>
                        <td>${req.ClientID}</td>
                        <td>${req.StatusID}</td>
                        <td>${req.Remarks}</td>
                        <td>${req.AssetID}</td>
                        <td>${req.AssetQuantity}</td>
                        <td>${req.EventID}</td>
                        <td>${req.Reference}</td>
                        <td>
                            <button class="btn btn-success btn-sm"
                            onclick="GetRequestInfo(
                                ${req.ClientID}, 
                                ${req.StatusID}, 
                                '${req.Remarks}', 
                                ${req.AssetID}, 
                                ${req.AssetQuantity}, 
                                ${req.EventID}, 
                                '${req.Reference}'
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
    });
}
function openReservationInfoModal() {
    viewReservationModal = new bootstrap.Modal(document.getElementById('vewReservationModal'), {
        backdrop: 'static'
    });
    viewReservationModal.show();
}

function GetRequestInfo(clientID, statusID, remarks, assetID, assetQty, eventID, reference) {
    let requestInfo = {
        ClientID: clientID,
        StatusID: statusID,
        AssetID: assetID,
        EventID: eventID,
    };

    $.ajax({
        type: "POST",
        url: "AdminDashboard.aspx/GetRequestInfo",
        data: JSON.stringify({ requestData: requestInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Full server response:", response);

            let data = response.d;
            if (typeof data === "string") {
                try { data = JSON.parse(data); } catch (e) { console.error("JSON parse error:", e); }
            }

            if (!data || !data.Client) {
                console.error("Invalid data structure:", data);
                alert("Reservation info could not be loaded.");
                return;
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
              <p><strong>Asset:</strong> ${data.Asset}</p>
              <p><strong>Asset Quantity:</strong> ${assetQty}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Remarks:</strong> ${remarks}</p>
            </div>
            <div class='modal-footer'>
              <button type='button' class='btn btn-primary' data-bs-dismiss='modal'>OK</button>
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
        url: "AdminDashboard.aspx/GetRegistrationRequests",
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
        url: "AdminDashboard.aspx/ConfirmUser",
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
        url: "AdminDashboard.aspx/GetAssets",
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
                        <td>${req.IsActive}</td>
                        <td>
                          <td>
                          <button class="btn btn-primary btn-sm"
                              onclick="editAsset(${req.AssetId}, '${req.AssetName}', ${req.Quantity})">
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
let assetID = 0;
function editAsset(asset_id, asset_name, asset_quantity) {
    console.log("Editing asset with ID:", asset_id, asset_name, asset_quantity);
    openAssetEditorModal(asset_name, asset_quantity);
    assetID = asset_id;
}
function createAsset() {
    const asset_name = document.getElementById('createAssetName').value.trim();
    const qty = document.getElementById('createQuantity').value;
    let asset_data = {
        AssetName: asset_name,
        Quantity: qty
    }
    console.log("Asset to be added:", asset_data);
    $.ajax({
        type: "POST",
        url: "AdminDashboard.aspx/AddAsset",
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

    // ✅ 1. Create your data object properly
    let asset_data = {
        AssetID: assetID,
        AssetName: asset_name,
        Quantity: qty
    };
    console.log(asset_data);
    // ✅ 2. Send it correctly as JSON to your ASP.NET method
    $.ajax({
        type: "POST",
        url: "AdminDashboard.aspx/UpdateAsset", // <-- Use your update method here
        data: JSON.stringify({ assetData: asset_data }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",

        success: function (response) {
            console.log("✅ Asset updated successfully:", response.d);
            alert("Asset updated successfully!");

            // Optional: close modal after success
            const modalEl = document.getElementById("assetEditorModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            getAssets();

            // Optionally reload your asset table or update UI
        },
        error: function (xhr, status, error) {
            console.error("❌ Error updating asset:", error);
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
        url: "AdminDashboard.aspx/ActivateAsset",
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
        url: "AdminDashboard.aspx/DeactivateAsset",
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



