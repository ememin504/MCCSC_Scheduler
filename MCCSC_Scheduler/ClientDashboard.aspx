<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ClientDashboard.aspx.cs" Inherits="MCCSC_Scheduler.ClientDashboard" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <!-- Your custom styles - ORDER MATTERS -->
    <link rel="stylesheet" href="Scripts/css/sidebar.css" />
    <link rel="stylesheet" href="Scripts/css/client.css" />
    <link rel="stylesheet" type="text/css" href="Scripts/css/default.css" />
    <!-- Flatpickr CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"/>
    <!-- jQuery (must be loaded before any script using it) -->
    <script src="Lib/jquery/3.6.4/jquery-3.6.4.min.js"></script>
    <!-- Bootstrap JS (depends on jQuery for some features like modals) -->

    <!-- Flatpickr JS -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

    <script src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <!-- Your custom scripts -->
    <script src="Scripts/js/Client.js"></script>
    <script src="Scripts/js/global.js"></script>
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
 
            // Load initial notification count after clientID is set
            setTimeout(() => {
                if (typeof clientID !== 'undefined' && clientID) {
                    loadNotificationsUI();
                    // Poll for new notifications every 5 seconds
                    setInterval(loadNotificationsUI, 5000);
                    setInterval(ongoingExpiredSearch, 5000);
                }
            }, 1000);
        });
        function ongoingExpiredSearch() {
            $.ajax({
                type: "POST",
                url: "ClientDashboard.aspx/OngoingExpiredSearch",
                data: "{}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                },
                error: function (xhr, status, error) {
                    console.error("Error:", xhr.responseText);
                }
            });
        }
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
            localStorage.clear();
            sessionStorage.clear();
        }

        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('logout-modal')) {
                closeLogoutModal();
            }
        });

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
            if (event && event.target) {
                const listItem = event.target.closest('li');
                if (listItem) {
                    listItem.classList.add('active');
                }
            }
        }

        // Toggle notification sidebar
        function toggleNotificationSidebar() {
            const sidebar = document.getElementById('notificationSidebar');
            const overlay = document.getElementById('notificationOverlay');

            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');

            // Load notifications when opening
            if (sidebar.classList.contains('show')) {
                loadNotificationsUI();
            }
        }

        // Load notifications for UI
        function loadNotificationsUI() {
            const notificationBody = document.getElementById('notificationBody');
            notificationBody.innerHTML = '<div class="notification-loading">Loading notifications...</div>';

            // Get notifications from your backend
            let notificationInfo = {
                PageType: "Client",
                UserID: parseInt(window.AppData.userId) || 0,
                ClientID: clientID
            };

            $.ajax({
                type: "POST",
                url: "ClientDashboard.aspx/GetNotifications",
                data: JSON.stringify({ notificationDTO: notificationInfo }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    let responseData = JSON.parse(response.d);

                    if (!responseData.success) {
                        console.error(responseData.error);
                        return;
                    }

                    let notifications = responseData.data; // <- this is now the array
                    //console.log(notifications);

                    const sidebarNotifications = notifications.map(n => {

                        let message = "";
                        switch (n.StatusID) {
                            case 2: message = "Your reservation request has been submitted"; break;
                            case 3: message = "Your reservation has been accepted";
                                    getReservation();
                                    break;
                            case 4: message = "Your reservation was rejected";
                                    getReservation();
                                    break;
                            case 5: message = "Coordination has been set for your reservation";
                                    getReservation();
                                    break;
                            case 6: message = "Your reservation has been rescheduled";
                                    getReservation();
                                    break;
                            case 7: message = "Your reservation has been cancelled";
                                    getReservation();
                                    break;
                            case 9: message = "Your reservation is now approved";
                                    getReservation();
                                    break;
                            case 10: message = "Your reservation is now ongoing";
                                    getReservation();
                                    break;
                            case 11: message = "Your reservation is now expired"; 
                                    getReservation();
                                    break;
                            default: message = "Status updated"; break;
                        }

                        let formattedDate = new Date(n.CreatedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });

                        // FIXED: Loop reservation dates
                        let formattedResDate = "";

                        if (Array.isArray(n.ReservationDates) && n.ReservationDates.length > 0) {
                            let first = n.ReservationDates[0];
                            let last = n.ReservationDates[n.ReservationDates.length - 1];

                            let firstFormatted = new Date(first).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            });

                            let lastFormatted = new Date(last).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            });

                            formattedResDate =
                                (first === last) ? firstFormatted : `${firstFormatted} - ${lastFormatted}`;
                        }

                        return {
                            id: n.NotificationID,
                            resID: n.ReservationID,
                            eventName: n.EventName,
                            message: message,
                            time: formattedDate,
                            isRead: n.IsRead,
                            isRated: n.IsRated,
                            reservationDates: formattedResDate
                        };
                    });

                    displayNotificationsInSidebar(sidebarNotifications);
                },

                error: function (xhr, status, error) {
                    console.error("Error loading notifications:", xhr.responseText);
                    notificationBody.innerHTML = '<div class="notification-empty">Failed to load notifications</div>';
                }
            });
        }
        function formatDate(date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }

        // Display notifications in sidebar
        function displayNotificationsInSidebar(notifications) {
            //console.log(notifications);
            const notificationBody = document.getElementById('notificationBody');

            if (notifications.length === 0) {
                notificationBody.innerHTML = '<div class="notification-empty">No notifications</div>';
                updateNotificationBadge(0);
                return;
            }

            const unreadCount = notifications.filter(n => !n.isRead).length;
            updateNotificationBadge(unreadCount);
            console.log(notifications);
            notificationBody.innerHTML = notifications.map(notif => `
                <div class="notification-item ${notif.isRead ? '' : 'unread'}" onclick="markNotificationAsRead(${notif.id}, '${notif.message}', ${notif.resID}, ${notif.isRated})">
                    <div class="notification-content">
                        ${!notif.isRead ? '<span class="notification-dot"></span>' : ''}
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-eventName">${notif.eventName}</div>
                        <div class="notification-time">${notif.time}</div>
                    </div>
                </div>
            `).join('');
        }

        // Update notification badge
        function updateNotificationBadge(count) {
            const badge = document.getElementById('sidebarNotificationBadge');
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
        let notificationId = 0;
        
        // Mark notification as read
        function markNotificationAsRead(notificationID, notificationMessage, reservationID, isRated) {
            let notificationData = {
                NotificationID: notificationID
            }
            //console.log(reservationID);
            $.ajax({
                type: "POST",
                url: "ClientDashboard.aspx/MarkAsRead",
                data: JSON.stringify({ notificationDTO: notificationData }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    //console.log('Marked as read:', notificationID);
                    reservation_Id = reservationID;
                    //console.log(reservation_Id);
                    notificationId = notificationID;
                    if (notificationMessage === "Your reservation is now expired" && isRated === false) {
                        console.log(reservation_Id);
                        openRatingModal(reservation_Id);
                    }
                    
                    // Reload notifications
                    setTimeout(() => {
                        loadNotificationsUI();
                    }, 300);
                },
                error: function (xhr, status, error) {
                    console.error("Error:", xhr.responseText);
                }
            });
        }
    </script>

    <form id="aspForm" runat="server">
        <!-- SIDEBAR -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="logo-section">
                    <img src="Images/SportsOfficeLogo.png" class="logo"/>
                    <span class="logo-text">MCCSC</span>
                </div>
            </div>

            <div class="user-profile">
            <div class="user-avatar">
                <span id="userInitials"></span>
            </div>
            <div class="user-info">
                <div class="user-name" id="sidebarFullName"></div>
                <div class="user-role">
                    Client/<span id="user-org"></span>
                </div>
            </div>
        </div>


            <nav class="sidebar-menu">
                <ul>
                    <li class="active" onclick="showSection('notificationSection');  showDashboard();">
                        <span class="menu-icon">🏠</span>
                        <span class="menu-text">Dashboard</span>
                    </li>
                    <li onclick="showSection('reservationSection')">
                        <span class="menu-icon">📅</span>
                        <span class="menu-text">Reservations</span>
                    </li>
                    <li onclick="showSection('clientProfileCard');  showProfile();">
                        <span class="menu-icon">👤</span>
                        <span class="menu-text">My Profile</span>
                    </li>
                    <li onclick="event.preventDefault(); toggleNotificationSidebar()">
                        <span class="menu-icon">🔔</span>
                        <span class="menu-text">Notifications</span>
                        <span class="notification-badge" id="sidebarNotificationBadge" style="display: none;">0</span>
                    </li>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" onclick="confirmLogout(); return false">
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
                        <h1>Hello, <span id="fullname"></span></h1>
                    </div>
                    <div class="header-actions">
                        <asp:Button ID="btnReserve" runat="server" class="btn-primary" OnClientClick="openReservationModal(); return false;" Text="Request +" />
                    </div>
                </div>
            </header>

            <!-- DASHBOARD CONTAINER -->
            <div class="dashboard-container">
               <div class="section-card" id="notificationSection">
                    <h3>Dashboard Overview</h3>
                    <p>Welcome to your Client Dashboard! Use the menu to navigate through different sections.</p>
                </div>

                <!-- CLIENT PROFILE SECTION -->
                <div class="section-card d-none" id="clientProfileCard">
                    <h3>My Profile</h3>
                    <div id="clientProfile" class="profile-content">
                        <div id="profile-fullname"></div>
                        <div id="profile-org"></div>
                        <div id="profile-email"></div>
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
                                    <th>Package</th>
                                    <th>Status</th>
                                    <th>Event Dates</th>
                                    <th>Reference</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="reservationTableBody">
                                <tr>
                                    <td colspan="7" class="text-center">No reservation found</td>
                                </tr>
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
                                <tr>
                                    <td colspan="7" class="text-center">No reservation found</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- NOTIFICATION SIDEBAR -->
            <div class="notification-sidebar" id="notificationSidebar">
                <div class="notification-header">
                    <h3>Notifications</h3>
                    <button type="button" class="btn-close-notification" onclick="toggleNotificationSidebar()">×</button>
                </div>
                <div class="notification-body" id="notificationBody">
                    <div class="notification-loading">Loading notifications...</div>
                </div>
            </div>

            <!-- NOTIFICATION OVERLAY -->
            <div class="notification-overlay" id="notificationOverlay" onclick="toggleNotificationSidebar()"></div>
        </div>
    </form>

    <script>
    </script>
</body>
</html>