document.addEventListener("DOMContentLoaded", function () {
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
    }
    getRegistrationRequests();
    getAssets();
});
const roleId = sessionStorage.getItem("role_id");
const userId = sessionStorage.getItem("user_id");
const userEmail = sessionStorage.getItem("user_email");

console.log(roleId, userId, userEmail);

function openReservationModal() {
    console.log(roleId, userId, userEmail);
}

function connectDB() {
    console.log('connecting to DB...');
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
                           <button class="btn btn-primary btn-sm" onclick="editAsset(${req.AssetId}, '${req.AssetName}', ${req.Quantity})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deactivateAsset(${req.AssetId})">Deactivate</button>
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

            // Optionally reload your asset table or update UI
        },
        error: function (xhr, status, error) {
            console.error("❌ Error updating asset:", error);
            alert("Failed to update asset. Please try again.");
        }
    });
}



