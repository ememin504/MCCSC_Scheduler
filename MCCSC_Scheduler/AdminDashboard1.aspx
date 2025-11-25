<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AdminDashboard1.aspx.cs" Inherits="MCCSC_Scheduler.AdminDashboard1" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script type="text/javascript" src="Scripts/js/Admin1.js"></script>
    <link rel="stylesheet" type="text/css" href="Scripts/css/AdminDashboard1.css" />
    <link rel="stylesheet" type="text/css" href="Scripts/css/Sidebar.css" />
    <title>MCCSC Admin Dashboard</title>
</head>
<body>
    <script>
        window.AppData = {
            roleId: '<%= Session["role_id"] %>',
            userId: '<%= Session["user_id"] %>',
            userEmail: '<%= Session["user_email"] %>',
            roleName: '<%= Session["role_name"] %>',
            roleTypeID: '<%= Session["role_type_id"] %>',
            roleTypeDescription: '<%= Session["role_type_description"] %>',
            firstName: '<%= Session["first_name"] %>',
            middleInitial: '<%= Session["middle_initial"] %>',
            lastName: '<%= Session["last_name"] %>'
        };

        // Logout confirmation
        function confirmLogout() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'Default.aspx';
            }
        }

        // Section navigation configurations
        const sectionConfigs = {
            reservationSubmenu: {
                tabs: [
                    { id: 'registrationSection', icon: '📝', text: 'Requests' },
                    { id: 'acceptedSection', icon: '✅', text: 'Accepted' },
                    { id: 'statusSection', icon: '🤝', text: 'Coordination' },
                    { id: 'approvedSection', icon: '✔️', text: 'Approved' },
                    { id: 'cancellationSection', icon: '⚠️', text: 'Cancellation' }
                ]
            },
            assetSubmenu: {
                tabs: [
                    { id: 'assetsSection', icon: '📦', text: 'Assets' },
                    { id: 'categoriesSection', icon: '🏷️', text: 'Categories' }
                ]
            },
            userSubmenu: {
                tabs: [
                    { id: 'registrationRequestSection', icon: '📝', text: 'Registration' },
                    { id: 'usersSection', icon: '👥', text: 'Users' }
                ]
            },
            historySubmenu: {
                tabs: [
                    { id: 'successfulSection', icon: '✅', text: 'Successful' },
                    { id: 'cancelledSection', icon: '❌', text: 'Cancelled' }
                ]
            }
        };

        // Toggle submenu
        function toggleSubmenu(submenuId, linkElement) {
            // Remove active from all parent links
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('active');
            });

            // Set active on clicked link
            linkElement.classList.add('active');

            // Show header tabs if configured
            if (sectionConfigs[submenuId]) {
                showHeaderTabs(sectionConfigs[submenuId].tabs, submenuId);
                // Automatically show the first section
                showSection(sectionConfigs[submenuId].tabs[0].id, submenuId);
            }
        }

        // Show header tabs
        function showHeaderTabs(tabs, submenuId) {
            const headerNav = document.getElementById('headerNav');
            headerNav.innerHTML = '';

            tabs.forEach(tab => {
                const button = document.createElement('button');
                button.type = 'button'; // Prevent form submission
                button.className = 'header-nav-item';
                button.innerHTML = `<span>${tab.icon}</span> <span>${tab.text}</span>`;
                button.onclick = (e) => {
                    e.preventDefault(); // Prevent any default action
                    showSection(tab.id, submenuId);
                };
                headerNav.appendChild(button);
            });

            headerNav.style.display = 'flex';
        }

        // Show specific section
        function showSection(sectionId, submenuId) {
            // Hide all sections
            document.querySelectorAll('.section-card').forEach(section => {
                section.style.display = 'none';
            });

            // Show selected section
            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) {
                selectedSection.style.display = 'block';
            }

            // Update active tab in header nav
            document.querySelectorAll('.header-nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Find and activate the corresponding header tab
            const headerNav = document.getElementById('headerNav');
            const tabs = headerNav.querySelectorAll('.header-nav-item');
            tabs.forEach(tab => {
                if (tab.textContent.includes(getTabTextForSection(sectionId))) {
                    tab.classList.add('active');
                }
            });

            // If no submenu specified (like Event Management), hide header nav
            if (!submenuId) {
                document.getElementById('headerNav').style.display = 'none';
            }
        }

        // Helper function to match section IDs to tab text
        function getTabTextForSection(sectionId) {
            const mapping = {
                'registrationSection': 'Requests',
                'acceptedSection': 'Accepted',
                'statusSection': 'Coordination',
                'approvedSection': 'Approved',
                'cancellationSection': 'Cancellation',
                'assetsSection': 'Assets',
                'categoriesSection': 'Categories',
                'registrationRequestSection': 'Registration',
                'usersSection': 'Users',
                'eventsSection': 'Event',
                'successfulSection': 'Successful',
                'cancelledSection': 'Cancelled'
            };
            return mapping[sectionId] || '';
        }

        // Toggle sidebar on mobile
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('show');
        }

        // Initialize
        window.addEventListener('DOMContentLoaded', function () {
            // Set user info in sidebar
            document.getElementById('sidebarFullname').textContent = `${window.AppData.firstName} ${window.AppData.lastName}`;
            document.getElementById('sidebarRole').textContent = `${window.AppData.roleName}`;

            // Set header info
            document.getElementById('fullname').textContent = `${window.AppData.firstName} ${window.AppData.lastName}`;
            document.getElementById('roles').textContent = `${window.AppData.roleName}/${window.AppData.roleTypeDescription}`;

            // DO NOT open any section by default - let user choose
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function (event) {
            const sidebar = document.getElementById('sidebar');
            const toggle = document.querySelector('.mobile-toggle');

            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('show') &&
                !sidebar.contains(event.target) &&
                !toggle.contains(event.target)) {
                sidebar.classList.remove('show');
            }
        });
    </script>

    <button class="mobile-toggle" onclick="toggleSidebar()">☰</button>

    <!-- WRAP EVERYTHING IN FORM TAG -->
    <form id="aspForm" runat="server">
        <div class="layout-container">
            <!-- SIDEBAR -->
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <h2>MCCSC Admin</h2>
                    <div class="sidebar-user">
                        <div id="sidebarFullname"></div>
                        <div id="sidebarRole" style="font-size: 0.8rem; opacity: 0.9;"></div>
                    </div>
                </div>

                <ul class="sidebar-menu">
                    <!-- RESERVATION MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="toggleSubmenu('reservationSubmenu', this)">
                            <span class="sidebar-icon">📅</span>
                            <span>Reservation Management</span>
                        </a>
                    </li>

                    <!-- ASSET MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="toggleSubmenu('assetSubmenu', this)">
                            <span class="sidebar-icon">📦</span>
                            <span>Asset Management</span>
                        </a>
                    </li>

                    <!-- USER MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="toggleSubmenu('userSubmenu', this)">
                            <span class="sidebar-icon">👥</span>
                            <span>User Management</span>
                        </a>
                    </li>

                    <!-- EVENT MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="showSection('eventsSection')">
                            <span class="sidebar-icon">🎉</span>
                            <span>Event Management</span>
                        </a>
                    </li>

                    <!-- RESERVATION HISTORY -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="toggleSubmenu('historySubmenu', this)">
                            <span class="sidebar-icon">📋</span>
                            <span>Reservation History</span>
                        </a>
                    </li>
                </ul>

                <div class="sidebar-logout">
                    <button type="button" class="btn-logout-sidebar" onclick="confirmLogout()">
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <!-- MAIN CONTENT -->
            <div class="main-content">
                <header class="admin-header">
                    <div class="header-top">
                        <div class="welcome-section">
                            <h1>Hello <span id="fullname"></span></h1>
                            <p id="roles"></p>
                        </div>
                        <div class="header-actions">
                            <asp:Button ID="btnReserve" runat="server" class="btn-primary" OnClientClick="openReservationModal(); return false;" Text="Request +" />
                        </div>
                    </div>

                    <!-- HORIZONTAL TABS (shown when relevant) -->
                    <nav class="header-nav" id="headerNav" style="display: none;">
                        <!-- Tabs will be populated dynamically -->
                    </nav>
                </header>
                <div class="dashboard-container">
                    <!-- RESERVATION REQUESTS -->
                    <div id="notificationSection" class="section-card" style="display: none;">
                        <h3>Notifications</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="notificationTable">
                                <thead>
                                    <tr>
                                        <th>Record Updated/Added</th>
                                        <th>Message</th>
                                        <th>View</th>
                                    </tr>
                                </thead>
                                <tbody id="notificationTableBody">
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                <div class="dashboard-container">
                    <!-- RESERVATION REQUESTS -->
                    <div id="registrationSection" class="section-card" style="display: none;">
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
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ACCEPTED RESERVATIONS -->
                    <div id="acceptedSection" class="section-card" style="display: none;">
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
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- COORDINATION MEETING -->
                    <div id="statusSection" class="section-card" style="display: none;">
                        <h3>Bound to Coordination Meeting Reservations</h3>
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
                                <tbody id="stautsCMReservationTableBody">
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- APPROVED RESERVATIONS -->
                    <div id="approvedSection" class="section-card" style="display: none;">
                        <h3>Approved Reservations</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="approvedReservationTable">
                                <thead>
                                    <tr>
                                        <th>Reservation ID</th>
                                        <th>Client ID</th>
                                        <th>Event ID</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="approvedReservationTableBodu">
                                    <tr>
                                        <td colspan="5" class="text-center">No approved reservations</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- CANCELLATION REQUESTS -->
                    <div id="cancellationSection" class="section-card" style="display: none;">
                        <h3>Cancellation Request</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="cancellationRequestTable">
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
                                <tbody id="cancellationRequestTableBody">
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ASSETS -->
                    <div id="assetsSection" class="section-card" style="display: none;">
                        <h3>Assets</h3>
                        <button class="btn-add" onclick="openCreateAssetModal(); return false">+ Add Asset</button>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="assetTable">
                                <thead>
                                    <tr>
                                        <th>Asset ID</th>
                                        <th>Asset Name</th>
                                        <th>Quantity Available</th>
                                        <th>Category ID</th>
                                        <th>Category Name</th>
                                        <th>IsActive</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="assetTableBody">
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ASSET CATEGORIES -->
                    <div id="categoriesSection" class="section-card" style="display: none;">
                        <h3>Asset Categories</h3>
                        <button class="btn-add" onclick="openAddAssetCategoryModal(); return false">+ Add Category</button>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="categoryTable">
                                <thead>
                                    <tr>
                                        <th>Category ID</th>
                                        <th>Category Name</th>
                                        <th>Parent Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="categoryTableBody">
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- REGISTRATION REQUESTS -->
                    <div id="registrationRequestSection" class="section-card" style="display: none;">
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
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- USERS -->
                    <div id="usersSection" class="section-card" style="display: none;">
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
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- EVENTS -->
                    <div id="eventsSection" class="section-card" style="display: none;">
                        <h3>Event Management</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="eventTable">
                                <thead>
                                    <tr>
                                        <th>Event ID</th>
                                        <th>Event Title</th>
                                        <th>Description</th>
                                        <th>Organization ID</th>
                                        <th>Organization Name</th>
                                        <th>Organization Type</th>
                                        <th>IsPrioritized</th>
                                        <th>IsRecurring</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="eventTableBody">
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- SUCCESSFUL RESERVATIONS -->
                    <div id="successfulSection" class="section-card" style="display: none;">
                        <h3>Successful Reservations</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th>Reservation ID</th>
                                        <th>Client ID</th>
                                        <th>Event ID</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="5" class="text-center">No successful reservations</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- CANCELLED RESERVATIONS -->
                    <div id="cancelledSection" class="section-card" style="display: none;">
                        <h3>Cancelled Reservation</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="cancelledReservationTable">
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
                                <tbody id="cancelledReservationTableBody">
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</body>
</html>