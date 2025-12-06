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
    getReservationDates();

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
let reservationDatesGlobal = [];
function getReservationDates() {
    let requestInfo = { ReservationType: "Approved Reservation" };

    $.ajax({
        type: "POST",
        url: "Default.aspx/GetReservationDates",
        data: JSON.stringify({ requestData: requestInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            let data = [];

            try {
                data = JSON.parse(response.d);
            } catch (e) {
                console.error("JSON parse error:", e);
                data = [];
            }

            // Build correct structure
            reservationDatesGlobal = data.flatMap(req =>
                req.EventDates.map(d => ({
                    Date: d.Date.split('T')[0],          // "2025-12-23"
                    StartTime: d.StartTime.substring(0, 5), // "10:01"
                    EndTime: d.EndTime.substring(0, 5)       // "22:00"
                }))
            );

            console.log("Reservation dates (correct structure):", reservationDatesGlobal);
        },
        error: function (xhr) {
            console.error("❌ Error loading reservation dates:", xhr.responseText);
        }
    });
}

function to12Hour(time) {
    if (!time) return "";
    let [hour, minute] = time.split(':').map(Number);
    let ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}
// Fixed Philippine Holidays (MM-DD)
const fixedHolidays = {
    "01-01": "New Year’s Day",
    "04-09": "Araw ng Kagitingan",
    "05-01": "Labor Day",
    "06-12": "Independence Day",
    "11-30": "Bonifacio Day",
    "12-25": "Christmas Day",
    "12-30": "Rizal Day",

    "08-21": "Ninoy Aquino Day",
    "11-01": "All Saints' Day",
    "11-02": "All Souls' Day",
    "12-08": "Immaculate Conception",
    "12-24": "Christmas Eve",
    "12-31": "Last Day of the Year",

    "08-30": "Mandaue City Charter Day"
};
// 1️⃣ Calculate Easter Sunday for a given year
function getEasterSunday(year) {
    const f = Math.floor,
        // Meeus/Jones algorithm
        G = year % 19,
        C = f(year / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);

    return new Date(year, month - 1, day);
}

// 2️⃣ Get Palm Sunday (1 week before Easter)
function getPalmSunday(year) {
    const easter = getEasterSunday(year);
    const palmSunday = new Date(easter);
    palmSunday.setDate(easter.getDate() - 6);
    return palmSunday;
}

// 3️⃣ Add days utility
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Compute Holy Week dates: Maundy, Good Friday, Black Saturday
function getHolyWeekHolidays(year) {
    const sunday = getPalmSunday(year); // returns a Date object
    const monday = addDays(sunday, 1);
    const tuesday = addDays(sunday, 2);
    const wednesday = addDays(sunday, 3);
    const thursday = addDays(sunday, 4);
    const friday = addDays(sunday, 5);
    const saturday = addDays(sunday, 6);
    const easter = addDays(sunday, 7);

    const format = d => d.toISOString().split("T")[0]; // YYYY-MM-DD

    return {
        [format(sunday)]: "Palm Sunday",
        [format(monday)]: "Holy Monday",
        [format(tuesday)]: "Holy Tuesday",
        [format(wednesday)]: "Holy Wednesday",
        [format(thursday)]: "Maundy Thursday",
        [format(friday)]: "Good Friday",
        [format(saturday)]: "Black Saturday",
        [format(easter)]: "Easter Sunday"
    };
}


// Detect National Heroes Day (Last Monday of August)
function isNationalHeroesDay(year, month, day) {
    if (month !== 7) return false; // August (index 7)
    const date = new Date(year, month, day);
    if (date.getDay() !== 1) return false; // Monday only
    const nextWeek = new Date(year, month, day + 7);
    return nextWeek.getMonth() !== 7; // last Monday if next week is September
}

function getChineseNewYear(year) {
    let formatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
        dateStyle: "short"
    });

    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    for (let d = new Date(year, 0, 20); d <= new Date(year, 1, 20); d.setDate(d.getDate() + 1)) {
        let parts = formatter.formatToParts(d);
        let lunarMonth = parts.find(p => p.type === "month").value;
        let lunarDay = parts.find(p => p.type === "day").value;

        if (lunarMonth == 1 && lunarDay == 1) {
            return formatDate(d);
        }
    }

    return null;
}


// Main holiday checker
function isHoliday(year, month, day) {
    const dateObj = new Date(year, month, day);
    const yyyy = dateObj.getFullYear();
    const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const dd = dateObj.getDate().toString().padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const mmdd = `${mm}-${dd}`;

    // 1️⃣ Fixed holidays
    if (fixedHolidays[mmdd]) return fixedHolidays[mmdd];

    // 2️⃣ Holy Week
    const holyWeek = getHolyWeekHolidays(year);
    if (holyWeek[dateStr]) return holyWeek[dateStr];
    console.log(holyWeek);
    // 3️⃣ Chinese New Year
    if (getChineseNewYear(year) === dateStr) return "Chinese New Year";

    // 4️⃣ National Heroes Day
    if (isNationalHeroesDay(year, month, day)) return "National Heroes Day";

    return null;
}

function isFullyReserved(dateStr) {
    return reservationDatesGlobal.some(res =>
        res.Date === dateStr &&
        res.StartTime <= "08:00" &&
        res.EndTime >= "22:00"
    );
}

function hasLessThan2HoursRemaining(dateStr) {
    const dayStart = 8 * 60;
    const dayEnd = 22 * 60;
    const totalDayMinutes = dayEnd - dayStart;

    const reservations = reservationDatesGlobal
        .filter(r => r.Date === dateStr)
        .map(r => ({
            start: parseInt(r.StartTime.split(":")[0]) * 60 + parseInt(r.StartTime.split(":")[1]),
            end: parseInt(r.EndTime.split(":")[0]) * 60 + parseInt(r.EndTime.split(":")[1])
        }))
        .sort((a, b) => a.start - b.start);

    let reservedMinutes = 0;
    let lastEnd = dayStart;

    reservations.forEach(r => {
        const start = Math.max(r.start, dayStart);
        const end = Math.min(r.end, dayEnd);
        if (end > lastEnd) {
            reservedMinutes += end - Math.max(start, lastEnd);
            lastEnd = end;
        }
    });

    return (totalDayMinutes - reservedMinutes) <= 120;
}


// ===== CALENDAR GENERATION =====
function generateCalendar(date) {
    let dayNote = "";
    const calendar = document.getElementById('calendar');
    if (!calendar) return;

    calendar.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();

    const today = new Date();
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);


    const header = document.createElement('div');
    header.className = 'calendar-header';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = "◀ Prev";
    prevBtn.className = 'calendar-nav';
    prevBtn.onclick = () => changeMonth(-1);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next ▶";
    nextBtn.className = 'calendar-nav';
    nextBtn.onclick = () => changeMonth(1);

    const monthTitle = document.createElement('h4');
    monthTitle.textContent = `${getMonthName(month)} ${year}`;

    header.appendChild(prevBtn);
    header.appendChild(monthTitle);
    header.appendChild(nextBtn);
    calendar.appendChild(header);

    // ---------------------------
    // DAY HEADERS
    // ---------------------------
    const dayHeaderGrid = document.createElement('div');
    dayHeaderGrid.className = "calendar-grid";
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => {
        const el = document.createElement('div');
        el.className = "calendar-day-header";
        el.textContent = d;
        dayHeaderGrid.appendChild(el);
    });
    calendar.appendChild(dayHeaderGrid);

    // ---------------------------
    // CALENDAR DAYS
    // ---------------------------
    const grid = document.createElement('div');
    grid.className = "calendar-grid";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
        const cell = createDayCell(daysInPrevMonth - i, true);
        cell.classList.add("disabled");
        grid.appendChild(cell);
    }

    // Current month
    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);

        const yyyy = dateObj.getFullYear();
        const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const dd = dateObj.getDate().toString().padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        // Get holiday name BEFORE creating the cell
        const holidayName = isHoliday(year, month, day);

        // Now create the cell WITH the holiday name
        const cell = createDayCell(day, false, holidayName);

        let disabled = false;
        let reason = [];

        // 1️⃣ Disable if before one month from today
        if (dateObj < oneMonthFromNow) {
            disabled = true;
            reason.push("Before one month from today");
        }

        // 2️⃣ Disable if holiday
        if (holidayName) {
            disabled = true;
            reason.push(holidayName);

            const safeClass = holidayName.toLowerCase().replace(/ /g, "-");
            cell.classList.add("holiday", safeClass);
        }

        // 3️⃣ Disable if fully booked
        if (isFullyReserved(dateStr)) {
            disabled = true;
            reason.push("Fully booked");
            cell.classList.add("fully-booked");
        }

        if (!disabled) {
            cell.onclick = () => selectDate(year, month, day);
        } else {
            cell.classList.add("disabled");
        }

        grid.appendChild(cell);
    }

    // Next month filler
    const filledCells = firstDay + daysInMonth;
    const remaining = 42 - filledCells;
    for (let i = 1; i <= remaining; i++) {
        const cell = createDayCell(i, true, dayNote);
        cell.classList.add("disabled");
        grid.appendChild(cell);
    }
    calendar.appendChild(grid);
}

function createDayCell(day, isOtherMonth, dayNote) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';

    // Use flex layout to stack day number and note vertically
    dayCell.style.display = 'flex';
    dayCell.style.flexDirection = 'column';
    dayCell.style.alignItems = 'center';
    dayCell.style.justifyContent = 'center';
    dayCell.style.height = '100%';

    // Main day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    // Extra text (holiday name)
    if (dayNote) {
        const note = document.createElement('div');
        note.className = 'day-note';
        note.textContent = dayNote;
        note.style.fontSize = '0.7em'; // smaller than the number
        note.style.marginTop = '2px';  // small spacing
        dayCell.appendChild(note);
    }

    // Other month
    if (isOtherMonth) {
        dayCell.classList.add('other-month');
    }

    // Holiday classes
    if (dayNote) {
        dayCell.classList.add('holiday');

        const safeClass = dayNote.toLowerCase().replace(/ /g, "-");
        dayCell.classList.add(safeClass);
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
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}


// ===== REGISTRATION FUNCTIONS =====
function submitRegistrationRequest() {
    console.log("submitRegistrationRequest called");

    let firstName = document.getElementById("firstName").value.trim();
    let lastName = document.getElementById("lastName").value.trim();
    let e_mail = document.getElementById("email").value.trim();
    let contactNumber = parseInt(document.getElementById("contactNumber").value.trim());
    let orgs = document.getElementById("organization").value.trim();
    let userName = document.getElementById("username").value.trim();
    let passWord = document.getElementById("password").value.trim();

    // Validate inputs
    if (!firstName || !lastName || !e_mail || !contactNumber || !orgs || !userName || !passWord) {
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
        ContactNumber: contactNumber,
        Organization: orgs,
        UserName: userName,
        PassWord: passWord
    };
    console.log(userData);
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
            if (result == "Username already exists. Please create another one.")
                alert(result);
            else {
                alert(result);
                resetRegistrationForm();
            }
            // Show success message
            //alert(`Registration Successful!\n\nWelcome, ${firstName} ${lastName}!\n\nYour reservation for ${formatDate(selectedDate)} has been recorded.\n\nOrganization: ${orgs}\nUsername: ${userName}\n\nThis is a FREE booking service. Please arrive on time for your event.`);

            
        })
        .catch(error => {x``
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
            //alert(`Registration Successful!\n\nWelcome, ${firstName} ${lastName}!\n\nYour reservation for ${formatDate(selectedDate)} has been recorded.\n\nOrganization: ${orgs}\nUsername: ${userName}\n\nThis is a FREE booking service. Please arrive on time for your event.`);
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
                //openOtpModal(user); // pass full object
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
            } else {
                alert("Login failed: " + user.Message);
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