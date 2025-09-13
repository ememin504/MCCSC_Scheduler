//page load event
document.addEventListener("DOMContentLoaded", function () {
    //initialize alert modal
    //inject alert modal after the confirmation modal form
    const alertModalDiv = document.getElementById('logIn');
    if (alertModalDiv)
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
});
function authenticateUser() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    console.log(username, password);
    let userData = {
        UserName : username,
        Password : password
    }
    let submitUrl = 'Default.aspx/AuthenticationResult';
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userDTO : userData })
    };
        fetch(submitUrl, options)
        .then(response => {         //response contains the server response
            //get server response
            console.log('Server response: ', response);
            //parse the response to JSON format
            return response.json();
        })
        .then(data => {             //data contains the parsed JSON data
            var operationStatus = data.d;
            console.log('Operation status: ', operationStatus);
            openAlertModal('App Info', operationStatus);
                
        })
        .catch(error => {           //handle the error response
            //log error
            console.log('Error: ', error);
            openAlertModal('App Info', 'Error: ' + error.d);
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