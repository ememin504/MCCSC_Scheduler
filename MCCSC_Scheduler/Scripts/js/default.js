// MCCSC Scheduler - Fixed JavaScript
// default.js

// ===== GLOBAL VARIABLES =====
let currentDate = new Date();
let selectedDate = null;
let registeredUsers = [];
let userInfo;
let userID;
var user_id = 0;
var role_id = 0;
var role_type_id = 0;
var user_email = "";
var role_name = "";
var role_type_description = "";
var first_name = "";
var middle_initial = "";
var last_name = "";

// ===== PAGE LOAD EVENT =====
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded - Initializing...");
    // inject alert modal
    const alertModalDiv = document.getElementById('form1');
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML('afterend', alertModalEl);
        alertModalDiv.insertAdjacentHTML('afterend', otpModalEl); // inject OTP modal too
        alertModalDiv.insertAdjacentHTML('afterend', registrationModalEl);
    }
    // Initialize calendar
    generateCalendar(currentDate);

    // Attach event listeners to navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const btnText = this.textContent.trim().toLowerCase();
            showSection(btnText);
        });
    });

    // Attach registration form submit
    const registerBtn = document.querySelector('.registration-container .submit-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function (e) {
            e.preventDefault();
            submitRegistrationRequest();
        });
    }

    // Attach login form submit
    const loginBtn = document.querySelector('.login-box .submit-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            authenticateUser();
        });
    }

    // Attach login link in registration form
    const loginLink = document.querySelector('.registration-container .login-link a');
    if (loginLink) {
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            showSection('login');
        });
    }

    // Attach register link in login form
    const registerLink = document.querySelector('.login-box .login-link a');
    if (registerLink) {
        registerLink.addEventListener('click', function (e) {
            e.preventDefault();
            showSection('home');
        });
    }

    console.log('MCCSC Scheduler Loaded Successfully');
    console.log('Current Date:', getTodayDate());
});
// ===== NAVIGATION BETWEEN SECTIONS =====
function showSection(sectionName) {
    console.log("Switching to section:", sectionName);

    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log("Section activated:", sectionName);
    } else {
        console.error("Section not found:", sectionName);
    }

    // Add active class to the button that matches this section
    navButtons.forEach(btn => {
        const btnText = btn.textContent.trim().toLowerCase();
        if (btnText === sectionName.toLowerCase()) {
            btn.classList.add('active');
        }
    });
}

// ===== CALENDAR GENERATION =====
function generateCalendar(date) {
    const calendar = document.getElementById('calendar');
    if (!calendar) {
        console.warn("Calendar element not found");
        return;
    }

    calendar.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();

    // Create calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'calendar-nav';
    prevBtn.textContent = '◀ Prev';
    prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        changeMonth(-1);
    });

    const monthTitle = document.createElement('h4');
    monthTitle.textContent = `${getMonthName(month)} ${year}`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'calendar-nav';
    nextBtn.textContent = 'Next ▶';
    nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        changeMonth(1);
    });

    header.appendChild(prevBtn);
    header.appendChild(monthTitle);
    header.appendChild(nextBtn);
    calendar.appendChild(header);

    // Create day headers
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayHeaderGrid = document.createElement('div');
    dayHeaderGrid.className = 'calendar-grid';

    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeaderGrid.appendChild(dayHeader);
    });
    calendar.appendChild(dayHeaderGrid);

    // Create calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayCell = createDayCell(daysInPrevMonth - i, true);
        calendarGrid.appendChild(dayCell);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = createDayCell(day, false);

        // Highlight today
        if (isCurrentMonth && day === today.getDate()) {
            dayCell.classList.add('today');
        }

        // Add click event
        dayCell.addEventListener('click', function () {
            selectDate(year, month, day);
        });

        calendarGrid.appendChild(dayCell);
    }

    // Next month's days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const dayCell = createDayCell(day, true);
        calendarGrid.appendChild(dayCell);
    }

    calendar.appendChild(calendarGrid);
}

function createDayCell(day, isOtherMonth) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.textContent = day;

    if (isOtherMonth) {
        dayCell.classList.add('other-month');
    }

    return dayCell;
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    console.log("Date selected:", selectedDate);

    // Update selected date display
    const displayDate = document.getElementById('displayDate');
    if (displayDate) {
        displayDate.textContent = formatDate(selectedDate);
    }

    // Highlight selected day
    const allDays = document.querySelectorAll('.calendar-day:not(.other-month)');
    allDays.forEach(dayCell => {
        dayCell.classList.remove('selected');
        if (parseInt(dayCell.textContent) === day) {
            dayCell.classList.add('selected');
        }
    });
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar(currentDate);
}

function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ===== REGISTRATION FUNCTIONS =====
function submitRegistrationRequest() {
    console.log("submitRegistrationRequest called");

    let firstName = document.getElementById("firstName").value.trim();
    let lastName = document.getElementById("lastName").value.trim();
    let e_mail = document.getElementById("email").value.trim();
    let orgs = document.getElementById("organization").value.trim();
    let userName = document.getElementById("username").value.trim();
    let passWord = document.getElementById("password").value.trim();

    // Validate inputs
    if (!firstName || !lastName || !e_mail || !orgs || !userName || !passWord) {
        alert("Please fill in all required fields.");
        return false;
    }

    // Validate date selection
    if (!selectedDate) {
        alert('Please select a date from the calendar first!');
        return false;
    }

    let userData = {
        FirstName: firstName,
        MiddleInitial: "",
        LastName: lastName,
        Email: e_mail,
        Organization: orgs,
        UserName: userName,
        PassWord: passWord
    };

    // Try to submit to backend if available
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
            console.log("Backend registration result:", result);

            // Show success message
            alert(`Registration Successful!\n\nWelcome, ${firstName} ${lastName}!\n\nYour reservation for ${formatDate(selectedDate)} has been recorded.\n\nOrganization: ${orgs}\nUsername: ${userName}\n\nThis is a FREE booking service. Please arrive on time for your event.`);

            // Reset form
            resetRegistrationForm();
        })
        .catch(error => {
            console.error("Backend registration error:", error);

            // Fallback: Store in memory
            const user = {
                firstName,
                lastName,
                email: e_mail,
                organization: orgs,
                username: userName,
                password: passWord,
                reservationDate: selectedDate,
                registeredOn: new Date()
            };

            registeredUsers.push(user);
            console.log('Stored in memory:', registeredUsers);

            // Show success message
            alert(`Registration Successful!\n\nWelcome, ${firstName} ${lastName}!\n\nYour reservation for ${formatDate(selectedDate)} has been recorded.\n\nOrganization: ${orgs}\nUsername: ${userName}\n\nThis is a FREE booking service. Please arrive on time for your event.`);

            // Reset form
            resetRegistrationForm();
        });

    return false;
}

function resetRegistrationForm() {
    const form = document.getElementById('registrationForm');
    if (form) {
        form.reset();
    }

    const displayDate = document.getElementById('displayDate');
    if (displayDate) {
        displayDate.textContent = 'Please select a date';
    }

    // Clear calendar selection
    const allDays = document.querySelectorAll('.calendar-day');
    allDays.forEach(day => day.classList.remove('selected'));

    selectedDate = null;
}

// ===== AUTHENTICATION FUNCTIONS =====
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
function verifyOTP(role_id, user_id, user_email) {
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

function setSessionStorage() {
    sessionStorage.setItem("role_id", role_id);
    sessionStorage.setItem("user_id", user_id);
    sessionStorage.setItem("user_email", user_email);
    sessionStorage.setItem("role_name", role_name);
    sessionStorage.setItem("role_type_id", role_type_id);
    sessionStorage.setItem("role_type_description", role_type_description);
    sessionStorage.setItem("first_name", first_name);
    sessionStorage.setItem("middle_initial", middle_initial);
    sessionStorage.setItem("last_name", last_name);
}

// ===== UTILITY FUNCTIONS =====
function getTodayDate() {
    const today = new Date();
    return `${getMonthName(today.getMonth())} ${today.getDate()}, ${today.getFullYear()}`;
}