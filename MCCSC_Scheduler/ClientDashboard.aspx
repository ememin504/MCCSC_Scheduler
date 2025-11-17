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

    <form id="aspForm" runat="server">
        <!-- HEADER -->
        <header class="client-header">
            <div class="header-content">
                <div class="welcome-section">
                    <h1>Hello! <span id="fullname"></span></h1>
                    <p id="roles">Client Dashboard</p>
                </div>
                <div class="header-actions">
                    <asp:Button ID="btnReserve" runat="server" class="btn-primary" OnClientClick="openReservationModal(); return false;" Text="Request +" />
                    <button type="button" class="btn-logout" onclick="confirmLogout()">
                        <span class="logout-icon">🚪</span>
                        <span class="logout-text">Logout</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- MAIN DASHBOARD CONTAINER -->
        <div class="dashboard-container">
            <!-- CLIENT PROFILE SECTION -->
            <div class="section-card" id="clientProfileCard">
                <h3>My Profile</h3>
                <div id="clientProfile" class="profile-content">
                    <!-- Profile data will be populated by JavaScript -->
                </div>
            </div>
            <!-- RESERVATION TRACKING SECTION -->
            <div class="section-card">
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
        </div>
    </form>
</body>
</html>