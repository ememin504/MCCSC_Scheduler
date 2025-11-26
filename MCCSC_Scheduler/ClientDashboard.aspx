<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ClientDashboard.aspx.cs" Inherits="MCCSC_Scheduler.ClientDashboard" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <link rel="stylesheet" href="Scripts/css/client.css" />
    <!-- jQuery (must be loaded before any script using it) -->
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <!-- Bootstrap JS (depends on jQuery for some features like modals) -->
    <script src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <!-- Your custom scripts -->
    <script src="Scripts/js/global.js"></script>
    <script src="Scripts/js/Client.js"></script>
    <title>Client Dashboard</title>
</head>
<body>
    <script>
        window.AppData = {
            roleId: '<%= Session["role_id"] %>',
            userId: '<%= Session["user_id"] %>',
            userEmail: '<%= Session["user_email"] %>',
            roleName: '<%= Session["role_name"] %>',
            roleTypeID: '<%= Session["type_id"] %>',
            roleTypeDescription: '<%= Session["type_description"] %>',
            firstName: '<%= Session["first_name"] %>',
            middleInitial: '<%= Session["middle_initial"] %>',
            lastName: '<%= Session["last_name"] %>'
        };

        // Logout function with confirmation
        function confirmLogout() {
            const modal = document.createElement('div');
            modal.className = 'logout-modal';
            modal.innerHTML = `
                <div class="logout-modal-content">
                    <div class="logout-modal-header">
                        <h3>Confirm Logout</h3>
                    </div>
                    <div class="logout-modal-body">
                        <p>Are you sure you want to logout?</p>
                    </div>
                    <div class="logout-modal-footer">
                        <button type="button" class="btn-cancel" onclick="closeLogoutModal()">Cancel</button>
                        <button type="button" class="btn-confirm" onclick="performLogout()">Yes, Logout</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }

        function closeLogoutModal() {
            const modal = document.querySelector('.logout-modal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        }

        function performLogout() {
            window.location.href = 'Default.aspx';
        }

        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('logout-modal')) {
                closeLogoutModal();
            }
        });

        // Sidebar toggle
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }

        // Navigate sections
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section-card').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }

            // Update active menu item
            document.querySelectorAll('.sidebar-menu li').forEach(item => {
                item.classList.remove('active');
            });
            event.target.closest('li').classList.add('active');
        }
    </script>

    <form id="aspForm" runat="server">
        <!-- SIDEBAR -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="logo-section">
                    <span class="logo-text">MCCSC</span>
                </div>
            </div>

            <div class="user-profile">
                <div class="user-avatar">
                    <span id="userInitials"></span>
                </div>
                <div class="user-info">
                    <div class="user-name" id="sidebarFullName"></div>
                    <div class="user-role">Client</div>
                </div>
            </div>

            <nav class="sidebar-menu">
                <ul>
                    <li class="active" onclick="showSection('notificationSection')">
                        <span class="menu-icon">🔔</span>
                        <span class="menu-text">Notifications</span>
                    </li>
                    <li onclick="showSection('clientProfileCard')">
                        <span class="menu-icon">👤</span>
                        <span class="menu-text">My Profile</span>
                    </li>
                    <li onclick="showSection('reservationSection')">
                        <span class="menu-icon">📅</span>
                        <span class="menu-text">Reservations</span>
                    </li>
                    <li onclick="showSection('historySection')">
                        <span class="menu-icon">📜</span>
                        <span class="menu-text">History</span>
                    </li>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" onclick="confirmLogout()">
                    <span class="menu-icon">🚪</span>
                    <span class="menu-text">Logout</span>
                </button>
            </div>
        </div>

        <!-- MAIN CONTENT -->
        <div class="main-content">
            <!-- HEADER -->
            <header class="client-header">
                <div class="header-content">
                    <div class="welcome-section">
                        <h1>Hello! <span id="fullname"></span></h1>
                        <p id="roles">Client Dashboard</p>
                    </div>
                    <div class="header-actions">
                        <asp:Button ID="btnReserve" runat="server" class="btn-primary" OnClientClick="openReservationModal(); return false;" Text="Request +" />
                    </div>
                </div>
            </header>

            <!-- DASHBOARD CONTAINER -->
            <div class="dashboard-container">
                <div class="section-card" id="notificationSection">
                    <h3>Notification</h3>
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

                <!-- CLIENT PROFILE SECTION -->
                <div class="section-card" id="clientProfileCard" style="display: none;">
                    <h3>My Profile</h3>
                    <div id="clientProfile" class="profile-content">
                        <!-- Profile data will be populated by JavaScript -->
                    </div>
                </div>

                <!-- RESERVATION TRACKING SECTION -->
                <div class="section-card" id="reservationSection" style="display: none;">
                    <h3>Reservation Tracking</h3>
                    <div class="table-container">
                        <table class="table table-striped table-bordered" id="reservationTable">
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>Event Description</th>
                                    <th>Assets To Be Borrowed</th>
                                    <th>Status</th>
                                    <th>Event Dates</th>
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

                <div class="section-card" id="historySection" style="display: none;">
                    <h3>Reservation History</h3>
                    <div class="table-container">
                        <table class="table table-striped table-bordered" id="reservationHistoryTable">
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>Event Description</th>
                                    <th>Assets To Be Borrowed</th>
                                    <th>Status</th>
                                    <th>Event Dates</th>
                                    <th>Reference</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="reservationHistoryTableBody">
                                <!-- Data will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <script>
        // Initialize user display
        document.addEventListener('DOMContentLoaded', function () {
            const firstName = window.AppData.firstName || '';
            const lastName = window.AppData.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();

            // Set full name in header
            document.getElementById('fullname').textContent = fullName;
            document.getElementById('sidebarFullName').textContent = fullName;

            // Set user initials
            const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
            document.getElementById('userInitials').textContent = initials;
        });
    </script>
</body>
</html>