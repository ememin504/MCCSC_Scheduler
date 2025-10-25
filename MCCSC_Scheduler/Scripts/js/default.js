//page load event
document.addEventListener("DOMContentLoaded", function () {
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', otpModalEl); // inject OTP modal too
        alertModalDiv.insertAdjacentHTML('afterend', registrationModalEl);
    }
});
let userInfo; // global variable to store user ID after login
let userID; // global variable

/*function getUserInfo(UserName) {
    let submitUrl = 'Default.aspx/GetUserInfoWeb';

    // wrap it as object because C# expects a UserDTO
    let userDTO = { UserName: UserName };

    let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ userDTO: userDTO })
    };

    return fetch(submitUrl, options)
        .then(response => response.json())
        .then(data => {
            if (data.d) {
                console.log("User info:", data.d);
                userInfo = data.d;      // global
                userID = data.d.UserID; // global
                roleID = data.d.RoleID; // <-- make sure casing matches your DTO
                console.log("Extracted UserID:", userID);

                if (roleID == 1) {
                    window.location.href = "../../ClientDashboard.aspx";
                    openOtpModal(userID);
                }
                else if (roleID == 2) {
                    openOtpModal(userID);
                    window.location.href = "../../AdminDashboard.aspx";
                }
                else {
                    window.location.href = "AccessDenied.aspx"; // fallback
                }

                return data.d;
            } else {
                console.warn("No user info returned");
                return null;
            }
        })
        .catch(error => {
            console.error("Error fetching user info:", error);
        });
}*/
var user_id = 0;
var role_id = 0;
var role_type_id = 0;
var user_email = "";
var role_name = "";
var role_type_description = "";
var first_name = "";
var middle_initial = "";
var last_name = "";
function authenticateUser() {
    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }
    let userData = {
        UserName: username,
        Password: password
    };
    
    fetch("Default.aspx/AuthenticationResult", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ loginVM: userData })
    })
        .then(response => response.json())
        .then(data => {
            const user = JSON.parse(data.d); 

            if (user.Success) {
                // Assign all the data safely
                user_id = user.UserID;
                role_id = user.RoleID;
                user_email = user.Email;
                first_name = user.FirstName;
                middle_initial = user.MiddleInitial;
                last_name = user.LastName;
                role_name = user.RoleName;
                role_type_id = user.RoleTypeID;
                role_type_description = user.RoleTypeDescription;

                console.log("All user data:", user);
                openOtpModal(user); // pass full object
            } else {
                alert("Login failed: " + user.Success);
                console.log("All user data:", user.Success);
            }
        })
        .catch(error => {
            console.error("Authentication error:", error);
            alert("An error occurred while logging in.");
        });


}
function verifyOTP(role_id ,user_id, user_email) {
    parseInt(user_id);
    console.log(user_id);
    let otpCode = document.getElementById('otpCode').value;

    let userData = {
        OtpCode: otpCode,
        UserID: parseInt(user_id) // use the global userID set in getUserInfo()
    };
    console.log("OTP Payload:", userData);

    let submitUrl = 'Default.aspx/SubmitOtp';
    let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ otpDto: userData })
    };

    fetch(submitUrl, options)
        .then(response => response.json())
        .then(data => {
            let result = data.d;
            console.log("OTP verify result:", result);

            if (result === "OTP Verified Successfully") {
                if (role_id === 1) {
                    // After login success
                    sessionStorage.setItem("role_id", role_id);
                    sessionStorage.setItem("user_id", user_id);
                    sessionStorage.setItem("user_email", user_email);
                    sessionStorage.setItem("role_name", role_name);
                    console.log(role_name);
                    sessionStorage.setItem("role_type_id", role_type_id);
                    sessionStorage.setItem("role_type_description", role_type_description);
                    sessionStorage.setItem("first_name", first_name);
                    sessionStorage.setItem("middle_initial", middle_initial);
                    sessionStorage.setItem("last_name", last_name);
                    // Redirect to dashboard
                    window.location.href = "ClientDashboard.aspx";

                }   
                else if (role_id === 2) {
                    sessionStorage.setItem("role_id", role_id);
                    sessionStorage.setItem("user_id", user_id);
                    sessionStorage.setItem("user_email", user_email);
                    sessionStorage.setItem("role_name", role_name);
                    sessionStorage.setItem("role_type_id", role_type_id);
                    sessionStorage.setItem("role_type_description", role_type_description);
                    sessionStorage.setItem("first_name", first_name);
                    sessionStorage.setItem("middle_initial", middle_initial);
                    sessionStorage.setItem("last_name", last_name);
                    
                    if (role_type_id == 1)
                        window.location.href = "AdminDashboard1.aspx";
                    else
                        window.location.href = "AdminDashboard2.aspx";
                }
                else {
                    console.log("User role is undefined");
                }
            } else {
                document.getElementById('otpMessage').classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error("Error:", error);
            openAlertModal("App Info", "Error: " + error);
        });
}

function submitRegistrationRequest() {
    let firstName = document.getElementById("firstName").value;
    let middle_initial = document.getElementById("middleInitial").value;
    let lastName = document.getElementById("lastName").value;
    let e_mail = document.getElementById("email").value;
    let orgs = document.getElementById("organization").value;
    let userName = document.getElementById("username").value;
    let passWord = document.getElementById("password").value;

    let userData = {
        FirstName: firstName,
        MiddleInitial: middle_initial,
        LastName: lastName,
        Email: e_mail,
        Organization: orgs,
        UserName: userName,
        PassWord: passWord
    };
    let submitUrl = 'Default.aspx/registrationRequestResult';
    let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ userDTO: userData })
    };
    fetch(submitUrl, options)
        .then(response => response.json())
        .then(data => {
            let result = data.d;
            console.log(result);
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


           