//page load event
document.addEventListener("DOMContentLoaded", function () {
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', otpModalEl); // inject OTP modal too
    }
});

function authenticateUser() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    let userData = {
        UserName: username,
        Password: password
    };

    let submitUrl = 'Default.aspx/AuthenticationResult';
    let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDTO: userData })
    };

    fetch(submitUrl, options)
        .then(response => response.json())
        .then(data => {
            let result = data.d; // This is the string returned from C#
            console.log("Auth result:", result);
            if (result.includes("User Login Successful")) {
                if (result.includes("Client")) {
                    sessionStorage.setItem("redirectAfterOtp", "ClientDashboard.aspx");
                    openOtpModal();
                } else if (result.includes("Admin")) {
                    sessionStorage.setItem("redirectAfterOtp", "AdminDashboard.aspx");
                    openOtpModal();
                } else {
                    openAlertModal("App Info", result);
                }

            } else {
                // for "Invalid Username or Password!" or error messages
                openAlertModal("App Info", result);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            openAlertModal("App Info", "Error: " + error);
        });
}
function verifyOTP() {
    let otpCode = document.getElementById('otpCode').value;
    let userID = sessionStorage.getItem("userID"); // store this earlier when logging in
    
    let userData = {
        OtpCode: otpCode,
        UserID: parseInt(userID)
    };
    console.log(userData);
    let submitUrl = 'Default.aspx/SubmitOtp';
    let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpDto: userData }) // must match parameter name
    };

    fetch(submitUrl, options)
        .then(response => response.json())
        .then(data => {
            let result = data.d;
            console.log("OTP verify result:", result);

            if (result === "OTP Verified Successfully") {
                let redirectUrl = sessionStorage.getItem("redirectAfterOtp") || "ClientDashboard.aspx";
                window.location.href = redirectUrl;
            } else {
                document.getElementById('otpMessage').classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error("Error:", error);
            openAlertModal("App Info", "Error: " + error);
        });
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