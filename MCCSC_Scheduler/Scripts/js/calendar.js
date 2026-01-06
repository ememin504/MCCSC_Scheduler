// MCCSC Scheduler - JavaScript

// Global variables
let selectedDate = null;
let registeredUsers = [];
//let currentDate = new Date();
const DAY_START = 8 * 60;  // 8:00 AM
const DAY_END = 22 * 60;  // 10:00 PM
const TOTAL_MINUTES = DAY_END - DAY_START;
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
function timeToMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function minutesToPercent(minutes) {
    return (minutes / TOTAL_MINUTES) * 100;
}

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', function () {
    generateCalendar(currentDate);
});

// Navigation between sections
function showSection(sectionName, event) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) targetSection.classList.add('active');

    // Highlight clicked button
    if (event) event.target.classList.add('active');
}


// Calendar Generation
// ------------------- GENERATE CALENDAR -------------------
// ------------------- GENERATE CALENDAR -------------------
function generateCalendar(date, reservations = [], data = []) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    // Calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
        <button class="calendar-nav" onclick="changeMonth(-1)">◀ Prev</button>
        <h4>${getMonthName(month)} ${year}</h4>
        <button class="calendar-nav" onclick="changeMonth(1)">Next ▶</button>
    `;
    calendar.appendChild(header);

    // Day headers
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

    // Calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayCell = createDayCell(daysInPrevMonth - i, true, [], null, data);
        calendarGrid.appendChild(dayCell);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const holidayName = isHoliday(year, month, day);
        const dayCell = createDayCell(day, false, [], holidayName, data);

        if (isCurrentMonth && day === today.getDate()) {
            dayCell.classList.add('today');
        }

        if (!holidayName) {
            dayCell.addEventListener('click', function () {
                selectDate(year, month, day);
            });
        }

        calendarGrid.appendChild(dayCell);
    }

    // Next month's days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const dayCell = createDayCell(day, true, [], null, data);
        calendarGrid.appendChild(dayCell);
    }

    calendar.appendChild(calendarGrid);
}
function getEventsForDay(year, month, day, reservations) {
    return reservations.filter(r => {
        const d = new Date(r.Date);
        return (
            d.getFullYear() === year &&
            d.getMonth() === month &&
            d.getDate() === day
        );
    });
}

// ------------------- CREATE DAY CELL -------------------
function createDayCell(day, isOtherMonth, events = [], holidayName = null, data = []) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.style.position = 'relative';
    dayCell.style.display = 'flex';
    dayCell.style.flexDirection = 'column';
    dayCell.style.alignItems = 'center';
    dayCell.style.justifyContent = 'center';
    dayCell.style.padding = '5px';
    dayCell.style.boxSizing = 'border-box';
    dayCell.style.textAlign = 'center';

    if (isOtherMonth || holidayName) {
        dayCell.style.filter = 'blur(0.5px)';
        dayCell.style.opacity = '0.6';
        dayCell.style.pointerEvents = 'none';
    }

    const dateLabel = document.createElement('div');
    dateLabel.className = 'date-number';
    dateLabel.textContent = day;
    dateLabel.style.fontWeight = 'bold';
    dateLabel.style.marginBottom = holidayName ? '2px' : '0';
    dayCell.appendChild(dateLabel);

    if (holidayName) {
        const holidayLabel = document.createElement('div');
        holidayLabel.className = 'holiday-label';
        holidayLabel.textContent = holidayName;
        holidayLabel.style.fontSize = '10px';
        holidayLabel.style.color = '#FFB7B7';
        dayCell.appendChild(holidayLabel);
        dayCell.classList.add('holiday');
        dayCell.title = holidayName;
    }

    // Use full reservation objects
    if (!isOtherMonth && data.length > 0) {
        const columns = [];

        data.forEach(reservation => {
            reservation.EventDates.forEach(eventDate => {
                const eventDay = new Date(eventDate.Date);
                if (eventDay.getDate() !== day || eventDay.getMonth() !== eventDay.getMonth()) return;

                const start = timeToMinutes(eventDate.StartTime);
                const end = timeToMinutes(eventDate.EndTime);
                const clampedStart = Math.max(start, DAY_START);
                const clampedEnd = Math.min(end, DAY_END);

                const top = minutesToPercent(clampedStart - DAY_START);
                const height = minutesToPercent(clampedEnd - clampedStart);

                let colIndex = 0;
                while (columns[colIndex] && columns[colIndex].some(ev => !(clampedEnd <= ev.start || clampedStart >= ev.end))) {
                    colIndex++;
                }
                if (!columns[colIndex]) columns[colIndex] = [];
                columns[colIndex].push({ start: clampedStart, end: clampedEnd });

                const totalColumns = columns.length;
                const widthPercent = 100 / totalColumns;
                const leftPercent = colIndex * widthPercent;

                const block = document.createElement('div');
                block.className = 'event-block';
                block.style.position = 'absolute';
                block.style.left = `${leftPercent + 2}%`;
                block.style.width = `${widthPercent - 4}%`;
                block.style.top = `${top}%`;
                block.style.height = `${height}%`;
                block.style.background = '#0d6efd';
                block.style.color = '#fff';
                block.style.fontSize = '10px';
                block.style.borderRadius = '4px';
                block.style.padding = '2px';
                block.style.overflow = 'hidden';
                block.style.cursor = 'pointer';
                block.style.zIndex = 1;
                block.textContent = reservation.EventName;

                block.addEventListener('click', e => {
                    e.stopPropagation();
                    openReservationInfoModal(reservation); // full object intact
                    
                });
                console.log("gago",reservation);
                dayCell.appendChild(block);
            });
        });
    }

    if (isOtherMonth) dayCell.classList.add('other-month');
    return dayCell;
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);

    // Update selected date display
    const displayDate = document.getElementById('displayDate');
    displayDate.textContent = formatDate(selectedDate);

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
    generateCalendar(currentDate, calendarReservations);
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
// Utility Functions
function getTodayDate() {
    const today = new Date();
    return `${getMonthName(today.getMonth())} ${today.getDate()}, ${today.getFullYear()}`;
}

// Display current date on page load
window.addEventListener('load', function () {
    console.log('MCCSC Scheduler Loaded Successfully');
    console.log('Current Date:', getTodayDate());
});
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
