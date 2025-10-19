document.addEventListener("DOMContentLoaded", function () {
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
    }
    getAsset();
    
});
getAsset();
const roleId = sessionStorage.getItem("role_id");
const userId = sessionStorage.getItem("user_id");
const userEmail = sessionStorage.getItem("user_email");
let clientID = 0;

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
            console.log(info.organizationName);
            console.log(info.organizationType); 
            console.log(info.clientID);
            clientID = info.clientID;
            console.log(clientID);
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    });

}


function getAsset() {
    console.log("loading assets!");

    fetch("ClientDashboard.aspx/GetAssets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
    })
        .then(res => res.json())
        .then(data => {
            let assets = data.d;
            let container = document.getElementById("assetContainer");

            // Hide and clear container
            container.style.display = "none";
            container.innerHTML = "";

            // Populate with checkboxes
            assets.forEach(asset => {
                if (asset.IsActive != 0) {
                    container.innerHTML += `
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
                    `;
                }
            });
            // ✅ Show container once loaded
            container.style.display = "block";

            // Handle checkbox behavior
            assets.forEach(asset => {
                const checkbox = document.getElementById(`asset_${asset.AssetId}`);
                const qtyInput = document.getElementById(`qty_${asset.AssetId}`);

                checkbox.addEventListener("change", () => {
                    if (checkbox.checked) {
                        qtyInput.disabled = false;

                        // ✅ Add to selectedAsset[]
                        selectedAssets.push({
                            AssetId: asset.AssetId,
                            AssetName: asset.AssetName,
                            MaxQty: asset.Quantity,
                            Qty: 1 // default
                        });
                    } else {
                        qtyInput.disabled = true;
                        qtyInput.value = "";

                        // ✅ Remove from selectedAsset[] when unchecked
                        selectedAssets = selectedAssets.filter(a => a.AssetId !== asset.AssetId);
                    }

                    console.log("Selected Assets:", selectedAssets);
                });
                qtyInput.addEventListener("input", () => {
                    const selected = selectedAssets.find(a => a.AssetId === asset.AssetId);
                    if (selected) {
                        selected.Qty = parseInt(qtyInput.value) || 1;
                    }
                    console.log("Updated Assets:", selectedAssets);
                });
            })
        })
        .catch(err => console.error("Error fetching assets:", err));
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
        ClientID: clientID,
    }
    console.log("Data to be submitted ",reservationInfo);
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/SubmitReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    })
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



