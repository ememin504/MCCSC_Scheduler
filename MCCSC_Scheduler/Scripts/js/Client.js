document.addEventListener("DOMContentLoaded", function () {
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
    }
    getAsset();
});
var clientID = 0;
getAsset();
const roleId = sessionStorage.getItem("role_id");
const userId = sessionStorage.getItem("user_id");
const userEmail = sessionStorage.getItem("user_email");
const roleName = sessionStorage.getItem("role_name");
const roleTypeID = sessionStorage.getItem("role_type_id");
const roleTypeDescription = sessionStorage.getItem("role_type_description");
var organizationID = 0;
console.log(roleId, userId, userEmail);

getClientInfo()
let selectedAssets = []; // use array in case multiple assets are checked
let n = 0;

console.log(roleId, userId, userEmail);

function getClientInfo() {
    
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/GetClientInfo",
        data: JSON.stringify({ clientData: { UserID: userId } }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            // Parse JSON since C# returns it as string
            let info = JSON.parse(response.d);
            console.log(info.name);
            console.log(info.organizationID);
            console.log(info.organizationName);
            console.log(info.organizationType); 
            console.log(info.clientID);
            console.log(info.roleName);
            clientID = info.clientID;
            organizationID = info.organizationID;
            //getReservation();
        },
        error: function (xhr, status, error) {
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
            console.log(data);
        }
    });
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

    const eventName = document.getElementById("eventName").value;
    const eventDescription = document.getElementById("eventDescription").value;

    const eventDates = getEventDates();

    let reservationInfo = {
        EventName: eventName,
        EventDescription: eventDescription,
        SelectedAssets: selectedAssets,
        EventDates: eventDates,
        ClientID: parseInt(clientID),
        organizationID: organizationID
    };

    console.log("Data to be submitted:", reservationInfo);

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/SubmitReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Raw response:", response.d);

            // Parse the JSON string returned from the server
            let result = JSON.parse(response.d);

            if (result.success) {
                alert(result.message || "Reservation submitted successfully!");
                console.log("Reservation success:", result);
                // Optionally clear form or reload data
                // location.reload();
            } else {
                alert(result.error || "An error occurred while submitting the reservation.");
                console.log("Reservation failed:", result.error);
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            alert("A system error occurred. Please try again later.");
        }
    });


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

}

