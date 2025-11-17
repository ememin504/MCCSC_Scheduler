<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AdminDashboard2.aspx.cs" Inherits="MCCSC_Scheduler.AdminDashboard2" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="Styles/AdminDashboard2.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script type="text/javascript" src="Scripts/js/Admin2.js"></script>
    <link rel="stylesheet" type="text/css" href="Scripts/css/AdminDashboard2.css" />
    <title>Admin Dashboard</title>
</head>
<body>
    <form id="form1" runat="server">
        <!-- ADMIN HEADER -->
        <header class="admin-header">
            <!-- HEADER TOP SECTION -->
            <div class="header-top">
                <div class="welcome-section">
                    <h1>Admin Dashboard</h1>
                    <p>Manage requests and reservations</p>
                </div>
                <div class="header-actions">
                    <button type="button" class="btn-logout" onclick="showLogoutModal()">
                        <span class="logout-icon">🚪</span>
                        <span class="logout-text">Logout</span>
                    </button>
                    <button type="button" class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                        ☰
                    </button>
                </div>
            </div>

            <!-- HEADER NAVIGATION -->
            <nav class="header-nav">
                <button type="button" class="header-nav-item active" onclick="showSection('registration')">
                    <span class="nav-icon">📝</span>
                    <span class="nav-text">Registration Requests</span>
                </button>
                <button type="button" class="header-nav-item" onclick="showSection('reservation')">
                    <span class="nav-icon">📅</span>
                    <span class="nav-text">Reservation Requests</span>
                </button>
                <button type="button" class="header-nav-item" onclick="showSection('accepted')">
                    <span class="nav-icon">✅</span>
                    <span class="nav-text">Accepted Reservations</span>
                </button>
                <button type="button" class="header-nav-item" onclick="showSection('coordination')">
                    <span class="nav-icon">🤝</span>
                    <span class="nav-text">Coordination Meetings</span>
                </button>
                <button type="button" class="header-nav-item" onclick="showSection('cancelled')">
                    <span class="nav-icon">❌</span>
                    <span class="nav-text">Cancelled Reservations</span>
                </button>
                <button type="button" class="header-nav-item" onclick="showSection('users')">
                    <span class="nav-icon">👥</span>
                    <span class="nav-text">Users</span>
                </button>
            </nav>

            <!-- MOBILE DROPDOWN MENU -->
            <div class="mobile-dropdown" id="mobileDropdown">
                <button type="button" onclick="showSection('registration'); toggleMobileMenu()">
                    📝 Registration Requests
                </button>
                <button type="button" onclick="showSection('reservation'); toggleMobileMenu()">
                    📅 Reservation Requests
                </button>
                <button type="button" onclick="showSection('accepted'); toggleMobileMenu()">
                    ✅ Accepted Reservations
                </button>
                <button type="button" onclick="showSection('coordination'); toggleMobileMenu()">
                    🤝 Coordination Meetings
                </button>
                <button type="button" onclick="showSection('cancelled'); toggleMobileMenu()">
                    ❌ Cancelled Reservations
                </button>
                <button type="button" onclick="showSection('users'); toggleMobileMenu()">
                    👥 Users
                </button>
            </div>
        </header>

        <!-- LOGOUT CONFIRMATION MODAL -->
        <div class="logout-modal" id="logoutModal">
            <div class="logout-modal-content">
                <div class="logout-modal-header">
                    <h3>Confirm Logout</h3>
                </div>
                <div class="logout-modal-body">
                    <p>Are you sure you want to logout?</p>
                </div>
                <div class="logout-modal-footer">
                    <button type="button" class="btn-cancel" onclick="hideLogoutModal()">Cancel</button>
                    <button type="button" class="btn-confirm" onclick="confirmLogout()">Logout</button>
                </div>
            </div>
        </div>

        <!-- DASHBOARD CONTAINER -->
        <div class="dashboard-container">
            <!-- REGISTRATION REQUESTS SECTION -->
            <section id="registrationSection" class="section-card">
                <h3>Registration Requests</h3>
                <div class="table-container">
                    <table class="table table-striped table-bordered" id="registrationTable">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>FirstName</th>
                                <th>Middle Initial</th>
                                <th>LastName</th>
                                <th>Email</th>
                                <th>Organization</th>
                                <th>Username</th>
                                <th>Status</th>
                                <th>Date Requested</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="registrationTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- RESERVATION REQUESTS SECTION -->
            <section id="reservationSection" class="section-card" style="display: none;">
                <h3>Reservation Requests</h3>
                <div class="table-container">
                    <table class="table table-striped table-bordered" id="reservationTable">
                        <thead>
                            <tr>
                                <th>Reservation ID</th>
                                <th>Client ID</th>
                                <th>Status ID</th>
                                <th>Remarks</th>
                                <th>Event ID</th>
                                <th>Reference</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="reservationTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- ACCEPTED RESERVATION SECTION -->
            <section id="acceptedSection" class="section-card" style="display: none;">
                <h3>Accepted Reservations</h3>
                <div class="table-container">
                    <table class="table table-striped table-bordered" id="acceptedReservationTable">
                        <thead>
                            <tr>
                                <th>Reservation ID</th>
                                <th>Client ID</th>
                                <th>Status ID</th>
                                <th>Remarks</th>
                                <th>Event ID</th>
                                <th>Reference</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="acceptedReservationTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- COORDINATION MEETINGS SECTION -->
            <section id="coordinationSection" class="section-card" style="display: none;">
                <h3>Reservations Bound for Coordination Meeting</h3>
                <div class="table-container">
                    <table class="table table-striped table-bordered" id="statusCMReservationTable">
                        <thead>
                            <tr>
                                <th>Reservation ID</th>
                                <th>Client ID</th>
                                <th>Status ID</th>
                                <th>Remarks</th>
                                <th>Event ID</th>
                                <th>Meeting Date</th>
                                <th>Meeting Time</th>
                                <th>Reference</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="statusCMReservationTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- CANCELLED RESERVATION SECTION -->
            <section id="cancelledSection" class="section-card" style="display: none;">
                <h3>Cancelled Reservations</h3>
                <div class="table-container">
                    <table class="table table-striped table-bordered" id="CancelledReservationTable">
                        <thead>
                            <tr>
                                <th>Reservation ID</th>
                                <th>Client ID</th>
                                <th>Status ID</th>
                                <th>Remarks</th>
                                <th>Event ID</th>
                                <th>Reason</th>
                                <th>Reference</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="CancelledReservationTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- USERS SECTION -->
            <section id="usersSection" class="section-card" style="display: none;">
                <h3>Users</h3>
                <div class="table-container">
                    <table class="table table-striped table-bordered" id="userTable">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>FirstName</th>
                                <th>Middle Initial</th>
                                <th>LastName</th>
                                <th>Role ID</th>
                                <th>Username</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody id="userTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </form>

    <script>
        // Function to show specific section
        function showSection(sectionName) {
            // Hide all sections
            document.getElementById('registrationSection').style.display = 'none';
            document.getElementById('reservationSection').style.display = 'none';
            document.getElementById('acceptedSection').style.display = 'none';
            document.getElementById('coordinationSection').style.display = 'none';
            document.getElementById('cancelledSection').style.display = 'none';
            document.getElementById('usersSection').style.display = 'none';

            // Remove active class from all nav items
            const navItems = document.querySelectorAll('.header-nav-item');
            navItems.forEach(item => item.classList.remove('active'));

            // Show selected section and activate nav item
            switch(sectionName) {
                case 'registration':
                    document.getElementById('registrationSection').style.display = 'block';
                    navItems[0].classList.add('active');
                    break;
                case 'reservation':
                    document.getElementById('reservationSection').style.display = 'block';
                    navItems[1].classList.add('active');
                    break;
                case 'accepted':
                    document.getElementById('acceptedSection').style.display = 'block';
                    navItems[2].classList.add('active');
                    break;
                case 'coordination':
                    document.getElementById('coordinationSection').style.display = 'block';
                    navItems[3].classList.add('active');
                    break;
                case 'cancelled':
                    document.getElementById('cancelledSection').style.display = 'block';
                    navItems[4].classList.add('active');
                    break;
                case 'users':
                    document.getElementById('usersSection').style.display = 'block';
                    navItems[5].classList.add('active');
                    break;
            }
        }

        // Toggle mobile menu
        function toggleMobileMenu() {
            const dropdown = document.getElementById('mobileDropdown');
            dropdown.classList.toggle('show');
        }

        // Show logout modal
        function showLogoutModal() {
            const modal = document.getElementById('logoutModal');
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
        }

        // Hide logout modal
        function hideLogoutModal() {
            const modal = document.getElementById('logoutModal');
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }

        // Confirm logout
        function confirmLogout() {
            // Add your logout logic here
            window.location.href = 'Default.aspx'; // Adjust to your logout page
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('logoutModal');
            if (event.target === modal) {
                hideLogoutModal();
            }
        }
    </script>
</body>
</html>