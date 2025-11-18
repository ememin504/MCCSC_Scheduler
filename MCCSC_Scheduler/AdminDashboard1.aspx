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

        // Function to show specific section
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section-card').forEach(section => {
                section.style.display = 'none';
            });

            // Remove active class from all nav items
            document.querySelectorAll('.header-nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Show selected section
            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) {
                selectedSection.style.display = 'block';
            }

            // Add active class to clicked nav item
            const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }
        }

        // Initialize on page load
        window.addEventListener('DOMContentLoaded', function () {
            // Show first section by default
            showSection('registrationSection');
        });

        // Toggle mobile menu
        function toggleMobileMenu() {
            const mobileMenu = document.querySelector('.mobile-dropdown');
            mobileMenu.classList.toggle('show');
        }

        // Logout function with confirmation
        function confirmLogout() {
            // Create custom modal
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

            // Fade in animation
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
            // Clear session and redirect to login
            window.location.href = 'Default.aspx';
        }

        // Close modal on background click
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('logout-modal')) {
                closeLogoutModal();
            }
        });
    </script>

    <!-- WRAP EVERYTHING IN FORM TAG -->
    <form id="aspForm" runat="server">
        <!-- HEADER WITH NAVIGATION -->
        <header class="admin-header">
            <div class="header-top">
                <div class="welcome-section">
                    <h1>Hello <span id="fullname"></span></h1>
                    <p id="roles"></p>
                </div>
                <div class="header-actions">
                    <asp:Button ID="btnReserve" runat="server" class="btn-primary" OnClientClick="openReservationModal(); return false;" Text="Request +" />
                    <button type="button" class="btn-logout" onclick="confirmLogout()">
                        <span class="logout-icon">🚪</span>
                        <span class="logout-text">Logout</span>
                    </button>
                </div>
            </div>

            <!-- NAVIGATION BAR -->
            <nav class="header-nav">
                <button type="button" class="header-nav-item active" data-section="registrationSection" onclick="showSection('registrationSection')">
                    <span class="nav-icon">📝</span>
                    <span class="nav-text">Registration Requests</span>
                </button>
                <button type="button" class="header-nav-item" data-section="usersSection" onclick="showSection('usersSection')">
                    <span class="nav-icon">👥</span>
                    <span class="nav-text">Users</span>
                </button>
                <button type="button" class="header-nav-item" data-section="reservationSection" onclick="showSection('reservationSection')">
                    <span class="nav-icon">📅</span>
                    <span class="nav-text">Reservation Requests</span>
                </button>
                <button type="button" class="header-nav-item" data-section="acceptedSection" onclick="showSection('acceptedSection')">
                    <span class="nav-icon">✅</span>
                    <span class="nav-text">Accepted Reservations</span>
                </button>
                <button type="button" class="header-nav-item" data-section="cancellationSection" onclick="showSection('cancellationSection')">
                    <span class="nav-icon">⚠️</span>
                    <span class="nav-text">Cancellation Request</span>
                </button>
                <button type="button" class="header-nav-item" data-section="statusSection" onclick="showSection('statusSection')">
                    <span class="nav-icon">🤝</span>
                    <span class="nav-text">Coordination Meeting Reservation</span>
                </button>
                <button type="button" class="header-nav-item" data-section="cancelledSection" onclick="showSection('cancelledSection')">
                    <span class="nav-icon">❌</span>
                    <span class="nav-text">Cancelled Reservation</span>
                </button>
                <button type="button" class="header-nav-item" data-section="assetsSection" onclick="showSection('assetsSection')">
                    <span class="nav-icon">📦</span>
                    <span class="nav-text">Assets</span>
                </button>
                <button type="button" class="header-nav-item" data-section="categoriesSection" onclick="showSection('categoriesSection')">
                    <span class="nav-icon">🏷️</span>
                    <span class="nav-text">Asset Categories</span>
                </button>
                <button type="button" class="header-nav-item" data-section="eventsSection" onclick="showSection('eventsSection')">
                    <span class="nav-icon">🎉</span>
                    <span class="nav-text">Event Management</span>
                </button>
            </nav>

          
        </header>

        <!-- MAIN DASHBOARD CONTAINER -->
        <div class="dashboard-container">
            <!-- REGISTRATION REQUESTS SECTION -->
            <div id="registrationSection" class="section-card">
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

            <!-- USERS SECTION -->
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

            <!-- RESERVATION REQUESTS SECTION -->
            <div id="reservationSection" class="section-card" style="display: none;">
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

            <!-- ACCEPTED RESERVATIONS SECTION -->
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

                        <!-- STATUS RESERVATIONS SECTION -->
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

                                    <!-- CANCELLATION RESERVATIONS SECTION -->
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

                                                <!-- CANCELLED RESERVATIONS SECTION -->
            <div id="cancelledSection" class="section-card" style="display: none;">
                <h3>Cancellation Request</h3>
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

            <!-- ASSETS SECTION -->
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

            <!-- ASSET CATEGORIES SECTION -->
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

            <!-- EVENT MANAGEMENT SECTION -->
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
        </div>
    </form>
</body>
</html>