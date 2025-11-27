<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AdminDashboard2.aspx.cs" Inherits="MCCSC_Scheduler.AdminDashboard2" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script type="text/javascript" src="Scripts/js/Admin2.js"></script>
    <link rel="stylesheet" type="text/css" href="Scripts/css/AdminDashboard2.css" />
    <link rel="stylesheet" type="text/css" href="Scripts/css/Sidebar.css" />
    <title>Admin Dashboard</title>
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
                    { id: 'reservationSection', icon: '📝', text: 'Requests' },
                    { id: 'acceptedSection', icon: '✅', text: 'Accepted' },
                    { id: 'coordinationSection', icon: '🤝', text: 'Coordination' }
                ]
            },
            userSubmenu: {
                tabs: [
                    { id: 'registrationSection', icon: '📝', text: 'Registration' },
                    { id: 'usersSection', icon: '👥', text: 'Users' }
                ]
            },
            historySubmenu: {
                tabs: [
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
                button.type = 'button';
                button.className = 'header-nav-item';
                button.innerHTML = `<span>${tab.icon}</span> <span>${tab.text}</span>`;
                button.onclick = (e) => {
                    e.preventDefault();
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

            // If no submenu specified, hide header nav
            if (!submenuId) {
                document.getElementById('headerNav').style.display = 'none';
            }
        }

        // Helper function to match section IDs to tab text
        function getTabTextForSection(sectionId) {
            const mapping = {
                'reservationSection': 'Requests',
                'acceptedSection': 'Accepted',
                'coordinationSection': 'Coordination',
                'registrationSection': 'Registration',
                'usersSection': 'Users',
                'cancelledSection': 'Cancelled'
            };
            return mapping[sectionId] || '';
        }

        // Toggle sidebar on mobile
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('show');
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
                PageType: "Admin",
                UserID: parseInt(window.AppData.userId) || 0,
                ClientID: 0
            };

            $.ajax({
                type: "POST",
                url: "AdminDashboard2.aspx/GetNotifications",
                data: JSON.stringify({ notificationDTO: notificationInfo }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    let notifications = JSON.parse(response.d);
                    console.log(notifications);
                    // Transform to sidebar format
                    const sidebarNotifications = notifications.map(n => {
                        let message = "";
                        switch (n.StatusID) {
                            case 2:
                                message = "New reservation request submitted";
                                break;
                            case 8:
                                message = "Cancellation request received";
                                break;
                            default:
                                message = "Status updated";
                                break;
                        }

                        let formattedDate = new Date(n.CreatedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });

                        return {
                            id: n.NotificationID,
                            message: message,
                            time: formattedDate,
                            isRead: n.IsRead,
                            clientName: n.ClientName
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

        // Display notifications in sidebar
        function displayNotificationsInSidebar(notifications) {
            const notificationBody = document.getElementById('notificationBody');

            if (notifications.length === 0) {
                notificationBody.innerHTML = '<div class="notification-empty">No notifications</div>';
                updateNotificationBadge(0);
                return;
            }

            const unreadCount = notifications.filter(n => !n.isRead).length;
            updateNotificationBadge(unreadCount);

            notificationBody.innerHTML = notifications.map(notif => `
                <div class="notification-item ${notif.isRead ? '' : 'unread'}" onclick="markNotificationAsRead(${notif.id})">
                    <div class="notification-content">
                        ${!notif.isRead ? '<span class="notification-dot"></span>' : ''}
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-message">${notif.clientName}</div>
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

        // Mark notification as read
        function markNotificationAsRead(notificationID) {
            let notificationData = {
                NotificationID: notificationID
            }
            $.ajax({
                type: "POST",
                url: "AdminDashboard2.aspx/MarkAsRead",
                data: JSON.stringify({ notificationDTO: notificationData }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    console.log('Marked as read:', notificationID);
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

        // Initialize
        window.addEventListener('DOMContentLoaded', function() {
            // Set user info in sidebar
            document.getElementById('sidebarFullname').textContent = `${window.AppData.firstName} ${window.AppData.lastName}`;
            document.getElementById('sidebarRole').textContent = `${window.AppData.roleName}`;

            // Set header info
            document.getElementById('fullname').textContent = `${window.AppData.firstName} ${window.AppData.lastName}`;
            document.getElementById('roles').textContent = `${window.AppData.roleName}`;

            // Load initial notification count
            loadNotificationsUI();

            // Poll for new notifications every 5 seconds
            setInterval(loadNotificationsUI, 5000);
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
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

    <form id="form1" runat="server">
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
                        <a class="sidebar-link" onclick="event.preventDefault(); toggleSubmenu('reservationSubmenu', this)">
                            <span class="sidebar-icon">📅</span>
                            <span>Reservation Management</span>
                        </a>
                    </li>

                    <!-- USER MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="event.preventDefault(); toggleSubmenu('userSubmenu', this)">
                            <span class="sidebar-icon">👥</span>
                            <span>User Management</span>
                        </a>
                    </li>

                    <!-- RESERVATION HISTORY -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="event.preventDefault(); toggleSubmenu('historySubmenu', this)">
                            <span class="sidebar-icon">📋</span>
                            <span>Reservation History</span>
                        </a>
                    </li>

                    <!-- NOTIFICATIONS -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="event.preventDefault(); toggleNotificationSidebar()">
                            <span class="sidebar-icon">🔔</span>
                            <span>Notifications</span>
                            <span class="notification-badge" id="sidebarNotificationBadge" style="display: none; margin-left: auto; background: #e74c3c; color: white; border-radius: 50%; width: 22px; height: 22px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;">0</span>
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
                    </div>

                    <!-- HORIZONTAL TABS (shown when relevant) -->
                    <nav class="header-nav" id="headerNav" style="display: none;">
                        <!-- Tabs will be populated dynamically -->
                    </nav>
                </header>

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

                <div class="dashboard-container">
                    <!-- DASHBOARD OVERVIEW (Default Section) -->
                    <div class="section-card" id="dashboardSection">
                        <h3>Dashboard Overview</h3>
                        <p>Welcome to the Admin Dashboard! Use the sidebar menu to navigate through different sections.</p>
                    </div>

                    <!-- REGISTRATION REQUESTS SECTION -->
                    <section id="registrationSection" class="section-card" style="display: none;">
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
            </div>
        </div>
    </form>
</body>
</html>