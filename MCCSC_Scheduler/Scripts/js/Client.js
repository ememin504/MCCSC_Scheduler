document.addEventListener("DOMContentLoaded", function () {
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', reservationModalEl);
    }
});
const roleId = sessionStorage.getItem("role_id");
const userId = sessionStorage.getItem("user_id");
const userEmail = sessionStorage.getItem("user_email");

console.log(roleId, userId, userEmail);
getAsset();

let selectedAssets = []; // use array in case multiple assets are checked
let n = 0;

console.log(roleId, userId, userEmail);
getAsset();

function getAsset() {
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
            });

            // ✅ Show container once loaded
            container.style.display = "block";

            // Handle checkbox behavior
            assets.forEach(asset => {
                const checkbox = document.getElementById(`asset_${asset.AssetId}`);
                const qtyInput = document.getElementById(`qty_${asset.AssetId}`);

                checkbox.addEventListener("change", () => {
                    qtyInput.disabled = !checkbox.checked;
                    if (!checkbox.checked) {
                        qtyInput.value = "";
                        // Remove from selected list
                        selectedAssets = selectedAssets.filter(a => a.assetId !== asset.AssetId);
                    } else {
                        // Add to selected list
                        selectedAssets.push({
                            assetId: asset.AssetId,
                            assetName: asset.AssetName,
                            availableQty: asset.Quantity,
                            selectedQty: 0
                        });
                    }
                });

                qtyInput.addEventListener("input", () => {
                    const selected = selectedAssets.find(a => a.assetId === asset.AssetId);
                    if (selected) selected.selectedQty = parseInt(qtyInput.value) || 0;
                });
            });
        })
        .catch(err => console.error("Error fetching assets:", err));
}

function submitReservation() {
    console.log("Submitting these assets:", selectedAssets);

    /*fetch("ClientDashboard.aspx/SubmitReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            assets: selectedAssets,
            roleId: roleId,
            userId: userId,
            userEmail: userEmail
        })
    })
        .then(res => res.json())
        .then(data => {
            alert("Reservation submitted successfully!");
            console.log(data);
        })
        .catch(err => console.error("Error submitting reservation:", err));*/
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



