// MCCSC Scheduler - JavaScript

// Global variables
let currentDate = new Date();
let selectedDate = null;
let registeredUsers = [];

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
function generateCalendar(date, reservations = []) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();

    // Create calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
        <button class="calendar-nav" onclick="changeMonth(-1)">◀ Prev</button>
        <h4>${getMonthName(month)} ${year}</h4>
        <button class="calendar-nav" onclick="changeMonth(1)">Next ▶</button>
    `;
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
        const dayEvents = getEventsForDay(year, month, day, reservations);
        const dayCell = createDayCell(day, false, dayEvents);
        console.log(dayEvents);
        if (isCurrentMonth && day === today.getDate()) {
            dayCell.classList.add('today');
        }

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

function createDayCell(day, isOtherMonth, events = []) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.textContent = day;

    if (events.length > 0) {
        const label = document.createElement('div');
        label.className = 'event-label';
        label.textContent = events[0].EventName; // first event
        dayCell.appendChild(label);
    }

    if (isOtherMonth) {
        dayCell.classList.add('other-month');
    }

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

// Registration Form Handler
function handleRegistration(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const organization = document.getElementById('organization').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validate date selection
    if (!selectedDate) {
        alert('Please select a date from the calendar first!');
        return;
    }

    // Create user object
    const user = {
        firstName,
        lastName,
        email,
        organization,
        username,
        password,
        reservationDate: selectedDate,
        registeredOn: new Date()
    };

    // Store user (in memory)
    registeredUsers.push(user);

    // Success message
    alert(`Registration Successful!\n\nWelcome, ${firstName} ${lastName}!\n\nYour reservation for ${formatDate(selectedDate)} has been recorded.\n\nOrganization: ${organization}\nUsername: ${username}\n\nThis is a FREE booking service. Please arrive on time for your event.`);

    // Reset form
    document.getElementById('registrationForm').reset();
    document.getElementById('displayDate').textContent = 'Please select a date';

    // Clear calendar selection
    const allDays = document.querySelectorAll('.calendar-day');
    allDays.forEach(day => day.classList.remove('selected'));

    selectedDate = null;

    console.log('Registered Users:', registeredUsers);
}

// Login Form Handler
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Find user
    const user = registeredUsers.find(u => u.username === username && u.password === password);

    if (user) {
        alert(`Welcome back, ${user.firstName} ${user.lastName}!\n\nYour reservation: ${formatDate(user.reservationDate)}\nOrganization: ${user.organization}`);
        document.getElementById('loginForm').reset();
    } else {
        alert('Invalid username or password. Please try again or register first.');
    }
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