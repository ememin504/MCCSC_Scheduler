var clientID = 0;
const roleId = sessionStorage.getItem("role_id");
const userIdStr = sessionStorage.getItem("user_id");
const userId = userIdStr ? Number(userIdStr) : 0;
const userEmail = sessionStorage.getItem("user_email");
const roleName = sessionStorage.getItem("role_name");
const roleTypeIDStr = sessionStorage.getItem("role_type_id");
const roleTypeID = roleTypeIDStr ? Number(roleTypeIDStr) : 0;
const roleTypeDescription = sessionStorage.getItem("role_type_description");
var organizationID = 0;
console.log(roleId, userId, userEmail);p
let selectedAssets = []; // use array in case multiple assets are checked
let n = 0;
let noteFor = "Admin";
let pageType = "Client"

console.log(roleId, userId, userEmail);

document.addEventListener("DOMContentLoaded", function () {

    // Inject modals
    const alertModalDiv = document.getElementById("form1");
    if (alertModalDiv) {
        alertModalDiv.insertAdjacentHTML("afterend", alertModalEl);
        alertModalDiv.insertAdjacentHTML("afterend", reservationModalEl);
    }
    // Load data
    getReservationDates();
});


function getClientInfo() {
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/GetClientInfo",
        data: JSON.stringify({ clientData: { UserID: userId } }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {

            let info = JSON.parse(response.d);
            console.log(info);
            clientID = info.clientID;
            organizationID = info.organizationID;


            /* ===== POPULATE HEADER HERE ===== */
            const fullnameEl = document.getElementById("fullname");
            const orgEl = document.getElementById("org");

            if (fullnameEl) {
                fullnameEl.textContent =
                    `${info.name}`.trim();
            }

            if (orgEl) {
                orgEl.textContent = info.organizationName;
            }
            /* ===== END HEADER ===== */
            /* ===== CLIENT PROFILE CARD ===== */
            const profileCard = document.getElementById("clientProfileCard");

            document.getElementById("profile-fullname").textContent =
                `Full Name: ${info.name}`;

            document.getElementById("profile-org").textContent =
                `Organization: ${info.organizationName}`;

            document.getElementById("profile-email").textContent =
                `Email: ${userEmail}`;

            profileCard.style.display = "block";
            /* ===== END CLIENT PROFILE ===== */


            /* ===== SIDEBAR ===== */
            const sidebarNameEl = document.getElementById("sidebarFullName");
            const sidebarOrgEl = document.getElementById("user-org");

            if (sidebarNameEl) {
                sidebarNameEl.textContent =
                    `${info.name}`.trim();
            }

            if (sidebarOrgEl) {
                sidebarOrgEl.textContent = info.organizationName;
            }

            getReservation();
        },
        error: function (xhr) {
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
            // Render reservations table
            renderReservations(data);
            console.log("Reservations: ", data);
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
        }
    });
}
function getPackages() {
    console.log("Loading Packages");

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/GetPackages",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            let package = JSON.parse(response.d);
            console.log(package);
            generateCalendar(package);
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
        }
    })
}
let selectedDaysPrior = 0;
let reservationDatesGlobal = [];

let selectedPackageID; // store only the selected PackageID
let currentPackages = [];

function generateCalendar(packages) {
    // Only include active packages
    const activePackages = packages.filter(p => p.IsActive);

    currentPackages = activePackages;
    let tabButtons = "";
    let tabContents = "";

    activePackages.forEach((p, index) => {
        const isActive = index === 0 ? "active" : "";
        const showActive = index === 0 ? "show active" : "";

        tabButtons += `
            <li class="nav-item" role="presentation">
                <button class="nav-link ${isActive}"
                    data-bs-toggle="tab"
                    data-bs-target="#package-${p.PackageID}"
                    type="button"
                    role="tab"
                    onclick="selectPackage(${p.PackageID}, ${p.DaysPrior})">
                    ${p.PackageName}
                </button>
            </li>
        `;

        let itemsHTML = "";
        p.ItemIncluded?.forEach(item => {
            itemsHTML += `<div>✔ ${item.ItemName} (${item.QuantityAvailable})</div>`;
        });

        tabContents += `
            <div class="tab-pane fade ${showActive}"
                id="package-${p.PackageID}"
                role="tabpanel">
                <h6 class="mb-2"><strong>${p.PackageName}</strong></h6>
                <label><strong>Items Included:</strong></label>
                <div class="mt-1 mb-3">${itemsHTML}</div>
                <p><strong>Consecutive Days Allowed:</strong> ${p.ConsecutiveDaysAllowed}</p>
                <p><strong>Days before the event:</strong> ${p.DaysPrior}</p>
                <p><strong>Price:</strong> ${p.Price}</p>
            </div>
        `;
    });

    document.getElementById("packageTabs").innerHTML = tabButtons;
    document.getElementById("packageTabContent").innerHTML = tabContents;

    // Auto-select first active package
    if (activePackages.length > 0) {
        const firstPackage = activePackages[0];
        selectedPackageID = firstPackage.PackageID;
        selectedDaysPrior = firstPackage.DaysPrior;
    }
    generateCalendarDays();
}
getClientInfo();
function showProfile() {
    document.getElementById("notificationSection").classList.add("d-none");
    document.getElementById("clientProfileCard").classList.remove("d-none");
}
function showDashboard(){
    document.getElementById("clientProfileCard").classList.add("d-none");
    document.getElementById("notificationSection").classList.remove("d-none");
}
function selectPackage(packageID, daysPrior) {
    selectedPackageID = packageID;
    selectedDaysPrior = daysPrior;
    generateCalendarDays();
}


function getReservationDates() {
    let requestInfo = { ReservationType: "Approved Reservation" };

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/GetReservationDates",
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
            console.log(data);
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
function to12Hour(time) {
    if (!time) return "";
    let [hour, minute] = time.split(':').map(Number);
    let ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function isFullyReserved(dateStr) {
    return reservationDatesGlobal.some(res =>
        res.Date === dateStr &&
        res.StartTime <= "08:00" &&
        res.EndTime >= "22:00"
    );
    console.log("Reservation Dates: ", reservationDatesGlobal);
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
    // 3️⃣ Chinese New Year
    if (getChineseNewYear(year) === dateStr) return "Chinese New Year";

    // 4️⃣ National Heroes Day
    if (isNationalHeroesDay(year, month, day)) return "National Heroes Day";

    return null;
}


// 🔥 Updates selectedDaysPrior and refreshes calendar
function setDaysPrior(days) {
    selectedDaysPrior = days;
    generateCalendarDays();
}
let allEventDates = [];
let eventDates;
function saveTime() {
    const container = document.getElementById("dateRowsContainer");
    if (!container) return;

    const rows = container.querySelectorAll(".date-group");
    if (!rows.length) return;

    rows.forEach(row => {
        const date = row.dataset.date;
        const startTime = row.querySelector(".start-time").value;
        const endTime = row.querySelector(".end-time").value;

        if (!startTime || !endTime) {
            console.log(`Skipping ${date} as start or end time is missing`);
            return; // skip incomplete rows
        }

        const existing = allEventDates.find(d => d.date === date);
        if (existing) {
            existing.startTime = startTime;
            existing.endTime = endTime;
        } else {
            allEventDates.push({ date, startTime, endTime });
        }
    });

    console.log("All saved event dates:", allEventDates);

    // Hide time modal
    const timeModalEl = document.getElementById("timePickerModal");
    bootstrap.Modal.getInstance(timeModalEl)?.hide();

    // Reset consecutive days if needed
    setConsecutiveDays();
}


let consecutiveTriggered = false;
let allowedDates = []; // globally
let consecutiveDaysAllowed = 0;

function setConsecutiveDays() {
    if (consecutiveTriggered) return;

    if (allEventDates.length > 0) {
        const firstDate = new Date(allEventDates[0].date);

        allowedDates = [];
        for (let i = 0; i < consecutiveDaysAllowed; i++) {
            const d = new Date(firstDate);
            d.setDate(d.getDate() + i);
            allowedDates.push(formatDate(d));
        }

        consecutiveTriggered = true;
        generateCalendarDays();
    }
}

function generateCalendarDays() {
    const calendar = document.getElementById("modalCalendar");
    if (!calendar) return;

    calendar.innerHTML = "";

    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + selectedDaysPrior);

    // 📌 Use currentDate for navigation
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Header...
    const header = document.createElement("div");
    header.className = "calendar-header";

    const prevBtn = document.createElement('button');
    prevBtn.textContent = "◀ Prev";
    prevBtn.className = 'calendar-nav';
    prevBtn.onclick = () => changeMonth(-1);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next ▶";
    nextBtn.className = 'calendar-nav';
    nextBtn.onclick = () => changeMonth(1);

    const monthTitle = document.createElement("h4");
    monthTitle.textContent = `${getMonthName(month)} ${year}`;

    header.appendChild(prevBtn);
    header.appendChild(monthTitle);
    header.appendChild(nextBtn);
    calendar.appendChild(header);

    // ---------------------------
    // Day headers
    // ---------------------------
    const dayHeaderGrid = document.createElement("div");
    dayHeaderGrid.className = "calendar-grid";

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => {
        const el = document.createElement("div");
        el.className = "calendar-day-header";
        el.textContent = d;
        dayHeaderGrid.appendChild(el);
    });
    calendar.appendChild(dayHeaderGrid);

    // ---------------------------
    // Calendar days
    // ---------------------------
    const grid = document.createElement("div");
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
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);

        let disabled = false;
        let reason = [];

        // 1️⃣ Disable if before minDate (DaysPrior)
        if (dateObj < minDate) {
            disabled = true;
            reason.push(`Must reserve ${selectedDaysPrior} days prior`);
        }

        // 2️⃣ Disable if holiday
        const holidayName = isHoliday(year, month, day);
        if (holidayName) {
            disabled = true;
            reason.push(holidayName);
        }

        // 3️⃣ Disable if fully booked
        const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`;

        if (isFullyReserved(dateStr)) {
            disabled = true;
            reason.push("Fully booked");
        }
        if (hasLessThan2HoursRemaining(dateStr)) {
            disabled = true;
            reason.push("Less than 2 hours remaining");
            console.log(dateStr, reason);
        }

        /*if (consecutiveTriggered) {
            const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            if (!allowedDates.includes(formatted)) {
                disabled = true;
                reason.push("Only consecutive days allowed");
            }
        }*/

        // Create the cell
        const cell = createDayCell(day, false, holidayName);

        if (disabled) {
            cell.classList.add("disabled");
            if (reason.length) {
                cell.title = reason.join(", "); // tooltip
            }
        } else {
            cell.onclick = () => selectDate(year, month, day);
        }

        grid.appendChild(cell);
    }

    // Next month filler
    const filledCells = firstDay + daysInMonth;
    const remaining = 42 - filledCells;
    for (let i = 1; i <= remaining; i++) {
        const cell = createDayCell(i, true);
        cell.classList.add("disabled");
        grid.appendChild(cell);
    }

    calendar.appendChild(grid);
}

function createDayCell(day, isOtherMonth, dayNote) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';

    // Flex column
    dayCell.style.display = 'flex';
    dayCell.style.flexDirection = 'column';
    dayCell.style.alignItems = 'center';
    dayCell.style.justifyContent = 'center';
    dayCell.style.height = '100%';
    dayCell.style.padding = '2px'; // helps fit text neatly

    // Main day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    // Holiday description
    if (dayNote) {
        const note = document.createElement('div');
        note.className = 'day-note';
        note.textContent = dayNote;

        note.style.fontSize = '0.65em';
        note.style.marginTop = '2px';
        note.style.textAlign = 'center';
        note.style.lineHeight = '1.1';
        note.style.wordBreak = 'break-word'; // PREVENTS LAYOUT BREAKING

        dayCell.appendChild(note);
    }

    if (isOtherMonth) {
        dayCell.classList.add('other-month');
    }

    // Add holiday class
    if (dayNote) {
        dayCell.classList.add('holiday');

        const safeClass = dayNote.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        dayCell.classList.add(safeClass);
    }

    return dayCell;
}
let currentDate = new Date();

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendarDays(currentDate);
}

function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

let selectedDate = null; // set when clicking calendar

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    const formattedDate = formatDate(selectedDate); // e.g., "2025-12-08"

    // Highlight selected day
    document.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayCell => {
        dayCell.classList.remove('selected');
        if (parseInt(dayCell.textContent) === day) dayCell.classList.add('selected');
    });

    // Ensure time modal exists
    openTimeModal();

    // Add a new row for the date if it doesn't already exist
    const container = document.getElementById("dateRowsContainer");
    if (!container.querySelector(`[data-date='${formattedDate}']`)) {
        const row = document.createElement("div");
        row.className = "date-group mb-2";
        row.dataset.date = formattedDate;

        row.innerHTML = `
            <small class="time-error text-danger d-none mb-1"></small>

            <div class="d-flex align-items-center gap-2">
                <span class="fw-bold">${formattedDate}</span>

                <input type="time"
                       class="start-time form-control"
                       min="08:00"
                       max="22:00">

                <input type="time"
                       class="end-time form-control"
                       min="08:00"
                       max="22:00"
                       disabled>

                <button type="button"
                        class="btn btn-sm btn-danger"
                        onclick="removeDateRow('${formattedDate}')">
                    Remove
                </button>
            </div>
        `;



        container.appendChild(row);
    }
}
document.addEventListener("input", function (e) {
    if (!e.target.matches(".start-time, .end-time")) return;

    const row = e.target.closest(".date-group");
    if (!row) return;

    const startInput = row.querySelector(".start-time");
    const endInput = row.querySelector(".end-time");
    const errorEl = row.querySelector(".time-error");

    const start = startInput.value;
    const end = endInput.value;

    errorEl.classList.add("d-none");
    errorEl.textContent = "";

    const showError = (msg) => {
        errorEl.textContent = msg;
        errorEl.classList.remove("d-none");
    };

    if (start && (start < "08:00" || start > "22:00")) {
        startInput.value = "";
        endInput.disabled = true;
        showError("Allowed time is 8:00 AM – 10:00 PM");
    }

    if (end && (end < "08:00" || end > "22:00")) {
        endInput.value = "";
        showError("Allowed time is 8:00 AM – 10:00 PM");
    }

    if (start) {
        endInput.disabled = false;
        endInput.min = start;
    }

    if (start && end && end <= start) {
        endInput.value = "";
        showError("End time must be later than start time");
    }

    if (start && end) {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);

        if ((eh * 60 + em) - (sh * 60 + sm) < 180) {
            showError("Minimum reservation time is 3 hours");
        }
    }

    // 🔒 FINAL AUTHORITY
    updateSaveButtonState();
});

function updateSaveButtonState() {
    const saveBtn = document.getElementById("saveTimeBtn");
    const rows = document.querySelectorAll(".date-group");

    let hasError = false;

    rows.forEach(row => {
        const errorEl = row.querySelector(".time-error");
        const start = row.querySelector(".start-time")?.value;
        const end = row.querySelector(".end-time")?.value;

        // visible error
        if (errorEl && !errorEl.classList.contains("d-none")) {
            hasError = true;
        }

        // incomplete time selection
        if (!start || !end) {
            hasError = true;
        }
    });

    saveBtn.disabled = hasError;
}


function removeDateRow(date) {
    // Remove the row from the DOM
    const row = document.querySelector(`[data-date='${date}']`);
    if (row) row.remove();

    // Remove from allEventDates array
    allEventDates = allEventDates.filter(d => d.date !== date);

    console.log("Removed date:", date);
    console.log("Remaining allEventDates:", allEventDates);
}



function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
function renderReservations(data) {

    $("#reservationTableBody").empty();

    function to12Hour(time) {
        if (!time) return "";
        let [hour, minute] = time.split(':').map(Number);
        let ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    // ✅ Handle empty data
    if (!Array.isArray(data) || data.length === 0) {
        $("#reservationTableBody").append(`
            <tr>
                <td colspan="7" class="text-center">No Reservation Found</td>
            </tr>
        `);
        return;
    }

    data.forEach(res => {

        let dates = res.EventDates?.length
            ? res.EventDates.map(d => {
                let formattedDate = d.Date.split('T')[0];
                return `${formattedDate} (${to12Hour(d.StartTime)} - ${to12Hour(d.EndTime)})`;
            }).join("<br>")
            : "No dates";

        let row = `
            <tr>
                <td>${res.EventName}</td>
                <td>${res.EventDescription}</td>
                <td>${res.PackageName}</td>
                <td>${res.StatusName}</td>
                <td>${dates}</td>
                <td>${res.Reference}</td>
                <td>
                    <button
                        type="button"
                        class="btn btn-primary btn-sm view-info-btn"
                        data-id="${res.ReservationID}">
                        View Info
                    </button>
                </td>
            </tr>
        `;

        $("#reservationTableBody").append(row);
    });

    // ✅ Attach click event once
    $(".view-info-btn").off("click").on("click", function () {
        let reservationId = $(this).data("id");
        let reservation = data.find(r => r.ReservationID === reservationId);
        viewInfo(reservation, reservationId);
    });
}

function viewInfo(res, reservationID) {
    let buttonText = "";
    let buttonClass = "";
    let callFunction = "";
    switch (res.StatusName) {
        case "Accepted":
        case "Coordination Meeting":
        case "Reschedule":
            buttonText = "Request Cancellation";
            buttonClass = "btn btn-warning btn";
            callFunction = "requestCancellation";
            break;

        case "Pending":
            buttonText = "Cancel Reservation";
            buttonClass = "btn btn-danger btn";
            callFunction = "openCancellationModal";
            break;

        case "Cancellation Request":
            buttonText = "Undo Cancellation";
            buttonClass = "btn btn-warning btn";
            callFunction = "undoCancellation";
            break;

        default:
            buttonText = "";
            buttonClass = "";
            callFunction = "";
            break;
    }

    if (Array.isArray(res)) {
        res = res[0];
    }

    let assetDetails = "";
    let dateDetails = "";

    res.EventDates.forEach(d => {
        dateDetails += `
            <p><strong>Date:</strong> ${d.Date.split("T")[0]}</p>
            <p><strong>Start:</strong> ${d.StartTime}</p>
            <p><strong>End:</strong> ${d.EndTime}</p>
        `;
    });

    // Encode the object safely for onclick
    const safeRes = encodeURIComponent(JSON.stringify(res));

    // Decide which status ID to pass
    let lastStatusParam =
        callFunction === "undoCancellation"
            ? res.PreviousStatusID
            : res.StatusID;

    let modalHTML = `
    <div class='modal fade' id='viewReservationModal'>
        <div class='modal-dialog'>
            <div class='modal-content'>
                <div class='modal-header'>
                    <h4>Reservation Info</h4>
                    <button class='btn-close' data-bs-dismiss='modal'></button>
                </div>
                <div class='modal-body'>
                    <p><strong>Event:</strong> ${res.EventName}</p>  
                    <p><strong>Package:</strong> ${res.PackageName}</p>
                    <p><strong>Status:</strong> ${res.StatusName}</p>
                    ${dateDetails}
                    <p><strong>Reference:</strong> ${res.Reference}</p>
                    ${res.Suggestions !== null && res.Suggestions !== ""
                        ? `<p><strong>Suggestions:</strong> ${res.Suggestions}</p>`
                        : ""
                    }
                    ${res.Remarks !== ""
                        ? `<p><strong>Remarks:</strong> ${res.Remarks}</p>`
                        : ""
                    }
                </div>
                <div class='modal-footer'>
                    ${buttonText
            ? `<button class="${buttonClass}"
                                onclick="${callFunction}('${safeRes}', ${res.ReservationID}, ${lastStatusParam}); return false;">
                                ${buttonText}
                               </button>`
            : ""
        }
                    <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
`;

    document.getElementById("viewReservationModal")?.remove();
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    new bootstrap.Modal(document.getElementById("viewReservationModal"), {
        backdrop: "static"
    }).show();
}


function undoCancellation(data, reservationID, previousStatusID) {

    let reservationInfo = {
        PreviousStatusID: previousStatusID,
        ReservationID: reservationID
    }
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/UndoCancellation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert(response.d);
            $('#viewReservationModal').modal('hide');
            console.log("Undoing Cancellation", );
            getReservation();
        },
        error: function (xhr, status, error) {
            openAlertModal("Error", "An error occurred while sending your request. Please try again.");
            console.error(xhr.responseText);
        }
    });
}

function requestCancellation(res, reservationID, status_id) {
    document.getElementById("viewReservationModal")?.remove();
    openReservationCancellationModal();

    // Wait for modal to render before binding the button
    setTimeout(() => {
        document.getElementById("cancelRequestBtn").onclick = function () {
            const reason = document.getElementById("cancelReasonInput").value.trim();

            if (!reason) {
                alert("Missing Reason", "Please provide a reason before submitting.");
                return;
            }

            sendCancellationRequest(reservationID, status_id, reason);
        };
    }, 200);
}

function sendCancellationRequest(reservationID, statusID, reason) {
    const reservationInfo = {
        ReservationID: reservationID,
        StatusID: statusID,
        Reason: reason,
        ClientID: clientID
    };
    console.log(reservationInfo);

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/RequestCancellation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",

        success: function (response) {
            $("#reservationCancellationModal").modal("hide");

            alert("Success", "Your cancellation request has been submitted successfully.");
            getReservation();
            addNotification(reservationID, userId, 8);
            let modalEl = document.getElementById('reservationCancellationModal');
            if (modalEl) {
                let cancellationModal = bootstrap.Modal.getInstance(modalEl);
                if (cancellationModal) cancellationModal.hide();
            }
        },

        error: function (xhr, status, error) {
            openAlertModal("Error", "An error occurred while sending your request. Please try again.");
            console.error(xhr.responseText);
        }
    });
}
function openCancellationModal(res, reservationID, statusID) {
    // Hide viewReservationModal properly
    let viewModalEl = document.getElementById("viewReservationModal");
    if (viewModalEl) {
        let viewModal = bootstrap.Modal.getInstance(viewModalEl);
        if (viewModal) viewModal.hide();
    }

    // Remove existing cancellation modal
    $('#cancellationModal').remove();

    // Create modal
    let modal = `<div class='modal fade' id='cancellationModal' role='dialog'>
                    <div class='modal-dialog'>
                        <div class='modal-content'>
                            <div class='modal-header'>
                                <h4 class='modal-title'>Cancellation</h4>
                                <button type='button' class='btn-close' data-bs-dismiss='modal'></button>
                            </div>
                            <div class='modal-body'>
                                <p>Please provide your reason for cancellation:</p>
                                <textarea id='ReasonInput' class='form-control' rows='3' placeholder='Reason...'></textarea>
                            </div>
                            <div class='modal-footer'>
                                <button type='button' id='cancelBtn' class='btn btn-danger'>Submit</button>
                                <button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Close</button>
                            </div>
                        </div>
                    </div>
                </div>`;

    // Append to body
    $('body').append(modal);

    // Show modal
    let cancellationModal = new bootstrap.Modal(document.getElementById('cancellationModal'));
    cancellationModal.show();

    // Handle submit button click (remove previous handlers first)
    $('#cancelBtn').off('click').on('click', function () {
        let remarks = $('#ReasonInput').val().trim();
        if (!remarks) {
            alert("Please provide a reason for cancellation.");
            return;
        }
        cancelReservation(res, reservationID, statusID, res.EventID, res.Reference, remarks);
    });
}

function cancelReservation(res, reservationID, statusID, eventID, referenc, remarks) {
    console.log("Cancelling Reservation");
    let reservationInfo = {
        ReservationID: reservationID,
        Remarks: remarks
    }
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/CancelReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);
            let result = JSON.parse(response.d);
            if (result.success) {
                alert("Your reservation is successfully cancelled");
                getReservation();
                addNotification(reservationID, 7);
                // Close the modal here
                let modalEl = document.getElementById('cancellationModal');
                if (modalEl) {
                    let cancellationModal = bootstrap.Modal.getInstance(modalEl);
                    if (cancellationModal) cancellationModal.hide();
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
        }
    })
}

function formatDates(dates) {
    if (!dates || dates.length === 0) return "No Dates";

    return dates
        .map(d => {
            let date = new Date(d.date);
            let formatted = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            return `${formatted} <br><small>${d.startTime} - ${d.endTime}</small>`;
        })
        .join("<br><br>");
}


function formatAssets(assets) {
    if (!assets || assets.length === 0) return "No Assets";

    return assets
        .map(a => `${a.AssetName} (${a.Quantity})`)
        .join("<br>");
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
function submitRatings() {
    //const reservationID = document.getElementById("ratingReservationID").value;
    //const organizationID = document.getElementById("ratingOrganizationID").value;
    const feedback = document.getElementById("ratingFeedback").value;
    if (selectedRating === 0) {
        alert("Please select a rating");
        return;
    }

    const ratingDTO = {
        ClientID: clientID,
        ReservationID: reservation_Id,
        OrganizationID: organizationID,
        NumberOfStars: selectedRating,
        Feedback: feedback
    };
    console.log(ratingDTO);

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/SubmitRatings",
        data: JSON.stringify({ ratingDTO }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Rating submitted:", response);
            bootstrap.Modal.getInstance(document.getElementById("ratingModal")).hide();
            // Optional: reload notifications or update UI
        },
        error: function (xhr) {
            console.error("Error submitting rating:", xhr.responseText);
        }
    });
}
function submitReservation() {
    console.log("Submitting these assets:", selectedAssets);
    const packageId = selectedPackageID;
    console.log(packageId);
    const eventName = document.getElementById("eventName").value.trim();
    const eventDescription = document.getElementById("eventDescription").value.trim();
    //const alleventDates = eventDates; // assuming this is an array of objects
    const suggestions = document.getElementById("suggestions").value.trim();
    console.log(allEventDates);

    // ✅ VALIDATION SECTION
    if (isNaN(packageId)) {
        alert("Please select a package.");
        return;
    }
    if (!eventName) {
        alert("Please enter the event name.");
        return;
    }
    if (!allEventDates || allEventDates.length === 0) {
        alert("Please add at least one event date.");
        return;
    }
    if (!clientID) {
        alert("Client ID is missing. Please log in again.");
        return;
    }

    // ⏱ Validate each event duration
    for (let i = 0; i < allEventDates.length; i++) {
        let date = allEventDates[i];
        let start = date.startTime.split(":"); // e.g., "15:26"
        let end = date.endTime.split(":");     // e.g., "15:27"

        let startDate = new Date();
        startDate.setHours(parseInt(start[0]), parseInt(start[1]), 0, 0);

        let endDate = new Date();
        endDate.setHours(parseInt(end[0]), parseInt(end[1]), 0, 0);

        let diffHours = (endDate - startDate) / (1000 * 60 * 60); // difference in hours

        if (diffHours < 3) {
            alert(`The event on ${date.date} must be at least 3 hours long.`);
            return;
        }
    }

    // Continue if validation passed
    let reservationInfo = {
        EventName: eventName,
        EventDescription: eventDescription,
        SelectedAssets: selectedAssets,
        PackageID: packageId,
        EventDates: allEventDates,
        ClientID: parseInt(clientID),
        organizationID: organizationID,
        Suggestions: suggestions
    };

    reservationInfo = sanitizeObject(reservationInfo);

    console.log("Data to be submitted:", reservationInfo);

    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/SubmitReservation",
        data: JSON.stringify({ reservationData: reservationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log("Raw response:", response.d);

            let result = JSON.parse(response.d);

            if (result.success) {
                let reservationID = parseInt(result.reservation_id); // match server key
                alert(result.message || "Reservation submitted successfully!");
                $('#reservationModal').modal('hide');
                getReservation();

                // ✅ Use the reservation_id returned from the server
                addNotification(reservationID, userId, 2);
            } else {
                alert(result.error || "An error occurred while submitting the reservation.");
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            alert("A system error occurred. Please try again later.");
        }
    });
}

function addNotification(reservationID, userId, statusID) {
    let notificationInfo = {
        ReservationID: reservationID,
        UserID: userId,
        StatusID: statusID,
        NoteFor: noteFor
    }
    $.ajax({
        type: "POST",
        url: "ClientDashboard.aspx/CreateNotification",
        data: JSON.stringify({ notificationDTO: notificationInfo }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response.d);
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            alert("A system error occurred. Please try again later.");
        }
    });
}

function sanitizeObject(obj) {
    if (typeof obj === "string") {
        return obj.replace(/'/g, '`'); // replace all single quotes
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === "object" && obj !== null) {
        let cleanObj = {};
        for (let key in obj) {
            cleanObj[key] = sanitizeObject(obj[key]);
        }
        return cleanObj;
    }

    return obj; // numbers, booleans, null
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