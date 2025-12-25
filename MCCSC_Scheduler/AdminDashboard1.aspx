<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AdminDashboard1.aspx.cs" Inherits="MCCSC_Scheduler.AdminDashboard1" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <link rel="stylesheet" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <link rel="stylesheet" href="Scripts/css/AdminDashboard1.css" />
    <link rel="stylesheet" href="Scripts/css/Sidebar.css" />
    <link rel="stylesheet" href="Scripts/css/default.css" />
    <script src="Scripts/js/global.js"></script>
    <script src="Scripts/js/calendar.js"></script>
    <script src="Scripts/js/Admin1.js"></script>

    <script src="Lib/jquery/3.6.4/jquery-3.6.4.min.js"></script>
    <script src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script src="Lib/chartjs/chart.min.js"></script>

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


        // Section navigation configurations
        const sectionConfigs = {
            reservationSubmenu: {
                tabs: [
                    { id: 'reservationRequestSection', icon: '📝', text: 'Requests' },
                    { id: 'acceptedSection', icon: '✅', text: 'Accepted' },
                    { id: 'statusSection', icon: '🤝', text: 'Coordination' },
                    { id: 'approvedSection', icon: '✔️', text: 'Approved' },
                    { id: 'cancellationSection', icon: '⚠️', text: 'Cancellation' },
                    { id: 'calendarViewSection', icon: '📆', text: 'View Calendar'}
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
                    { id: 'finishedSection', icon: '✅', text: 'Finished' },
                    { id: 'unfinishedSection', icon: '', text: 'Unfinished' },
                    { id: 'cancelledSection', icon: '❌', text: 'Cancelled' },
                    { id: 'rejectedSection', icon: '-', text: 'Rejected' }
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

            // If no submenu specified (like Event Management), hide header nav
            if (!submenuId) {
                document.getElementById('headerNav').style.display = 'none';
            }
        }

        // Helper function to match section IDs to tab text
        function getTabTextForSection(sectionId) {
            const mapping = {
                'dashboardSection': 'Dashboard',
                'reservationRequestSection': 'Requests',
                'acceptedSection': 'Accepted',
                'statusSection': 'Coordination',
                'approvedSection': 'Approved',
                'cancellationSection': 'Cancellation',
                'assetsSection': 'Assets',
                'categoriesSection': 'Categories',
                'packagesSection': 'Packages',
                'registrationRequestSection': 'Registration',
                'usersSection': 'Users',
                'eventsSection': 'Event',
                'finishedSection': 'Finished',
                'unfinishedSection': 'Unfinished',
                'cancelledSection': 'Cancelled',
                'rejectedSection': 'Rejected',
                'calendarViewSection': 'Calendar'
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
                url: "AdminDashboard1.aspx/GetNotifications",
                data: JSON.stringify({ notificationDTO: notificationInfo }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    let responseData = JSON.parse(response.d);

                    if (!responseData.success) {
                        console.error(responseData.error);
                        return;
                    }

                    let notifications = responseData.data;
                    const sidebarNotifications = notifications.map(n => {
                        let message = "";
                        switch (n.StatusID) {
                            case 2:
                                message = "New reservation request submitted";
                                getReservationRequests();
                                break;
                            case 8:
                                message = "Cancellation request received";
                                getReservationRequests();
                                getAcceptedReservation();
                                getStatusCMReservation();
                                getReservationCancellationRequests();
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
                url: "AdminDashboard1.aspx/MarkAsRead",
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
        function ongoingExpiredSearch() {
            $.ajax({
                type: "POST",
                url: "AdminDashboard1.aspx/OngoingExpiredSearch",
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
        
        // Initialize
        window.addEventListener('DOMContentLoaded', function () {
            // Set user info in sidebar

            // Load initial notification count
            loadNotificationsUI();

            // Poll for new notifications every 5 seconds
            setInterval(loadNotificationsUI, 5000);
            setInterval(ongoingExpiredSearch, 5000);
            showSection('dashboardSection');

            
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
                    <div class="logo-section">
                        <img src="Images/SportsOfficeLogo.png" class="logo"/>
                        <span class="logo-text"><b>MCCSC</b></span>
                    </div>
                    <div class="sidebar-user">
                        <div id="sidebarFullname"></div>
                        <div id="sidebarRole" style="font-size: 0.8rem; opacity: 0.9;"></div>
                    </div>
                </div>
                <ul class="sidebar-menu">
                    <!-- ADMIN DASHBOARD -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="event.preventDefault(); showSection('dashboardSection', this)">
                            <span class="sidebar-icon">🏠</span>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <!-- RESERVATION MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="event.preventDefault(); toggleSubmenu('reservationSubmenu', this)">
                            <span class="sidebar-icon">📅</span>
                            <span>Reservation Management</span>
                        </a>
                    </li>

                    <!-- PACKAGE MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="event.preventDefault(); showSection('packagesSection', this)">
                            <span class="sidebar-icon">📦</span>
                            <span>Package Management</span>
                        </a>
                    </li>

                    <!-- USER MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="event.preventDefault(); toggleSubmenu('userSubmenu', this)">
                            <span class="sidebar-icon">👥</span>
                            <span>User Management</span>
                        </a>
                    </li>

                    <!-- EVENT MANAGEMENT -->
                    <li class="sidebar-item">
                        <a class="sidebar-link" onclick="event.preventDefault(); showSection('eventsSection', this)">
                            <span class="sidebar-icon">🎉</span>
                            <span>Event Management</span>
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
                        <a class="sidebar-link" onclick="event.preventDefault(); toggleNotificationSidebar(), this">
                            <span class="sidebar-icon">🔔</span>
                            <span>Notifications</span>
                            <span class="notification-badge" id="sidebarNotificationBadge" style="display: none; margin-left: auto; background: #e74c3c; color: white; border-radius: 50%; width: 22px; height: 22px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;">0</span>
                        </a>
                    </li>
                </ul>

                <div class="sidebar-logout">
                    <button type="button" class="btn-logout-sidebar" onclick="confirmLogout(); return false">
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
                            <h1>Hello, Admin</h1>
                            <p id="roles"></p>
                        </div>
                        <div class="header-actions">
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
                    <!-- RESERVATION CALENDAR -->
                    <div id="calendarViewSection" class="section-card" style="display: none;">
                    <h3>Calendar</h3>
                    <div class="calendar-container">
                        <div id="calendar"></div>
                    </div>
                </div>
                    <div id="dashboardSection" class="section-card" style="display: none;">
                        <h3>Insights</h3>
                        <!-- KPI Cards -->
                        <div class="dashboard-cards">

                       </div>

                    </div>
                    <!-- RESERVATIONS REQUESTS -->
                    <div id="reservationRequestSection" class="section-card" style="display: none;">
                        <h3>Requests</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="reservationTable">
                                <thead>
                                    <tr>
                                        <th>Event Title</th>
                                        <th>Package</th>
                                        <th>Organization</th>
                                        <th>Dates</th>
                                        <th>Suggestions</th>
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
                                    <th>Event Title</th>
                                    <th>Package</th>
                                    <th>Organization</th>
                                    <th>Dates</th>
                                    <th>Suggestions</th>
                                    <th>Reference</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="acceptedReservationTableBody">
                                <tr>
                                    <td colspan="5" class="text-center">No approved reservations</td>
                                </tr>
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
                                        <th>Event Title</th>
                                        <th>Package</th>
                                        <th>Organization</th>
                                        <th>Event Dates</th>
                                        <th>Meeting Date & Time</th>
                                        <th>Meeting Remarks</th>
                                        <th>Suggestions</th>
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
                                        <th>Event Title</th>
                                        <th>Package</th>
                                        <th>Organization</th>
                                        <th>Dates</th>
                                        <th>Suggestions</th>
                                        <th>Reference</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="approvedReservationTableBody">
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
                                        <th>Event Title</th>
                                        <th>Package</th>
                                        <th>Organization</th>
                                        <th>Dates</th>
                                        <th>Suggestions</th>
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

                    <!-- PACKAGES -->
                    <div id="packagesSection" class="section-card" style="display: none;">
                        <h3>Packages</h3>
                        <button class="btn-add" onclick="openCreatePackageModal(); return false">+ Add Package</button>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="packageTable">
                                <thead>
                                    <tr>
                                        <th>Asset ID</th>
                                        <th>Asset Name</th>
                                        <th>Quantity Available</th>
                                        <th>Consecutive Days Allowed</th>
                                        <th>Days Before Event</th>
                                        <th>Price</th>
                                        <th>IsActive</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="packageTableBody">
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
                                        <th>FirstName</th>
                                        <th>LastName</th>
                                        <th>Organization</th>
                                        <th>Username</th>
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

                    <!-- FINISHED RESERVATIONS -->
                    <div id="finishedSection" class="section-card" style="display: none;">
                        <h3>Finished Reservations</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="finishedReservationTable">
                                <thead>
                                    <tr>
                                        <th>Event Title</th>
                                         <th>Package</th>
                                        <th>Organization</th>
                                        <th>Date</th>
                                        <th>Reference</th>
                                        <th>Rating</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="finishedReservationTableBody">
                                    <tr>
                                        <td colspan="6" class="text-center">No reservation found</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- UNFINISHED RESERVATIONS -->
                    <div id="unfinishedSection" class="section-card" style="display: none;">
                        <h3>Unfinished Reservations</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="unfinishedReservationTable">
                                <thead>
                                    <tr>
                                        <th>Event Title</th>
                                        <th>Package</th>
                                        <th>Organization</th>
                                        <th>Date</th>
                                        <th>Reference</th>
                                        <th>Rating</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="unfinishedReservationTableBody">
                                    <tr>
                                        <td colspan="6" class="text-center">No reservation found</td>
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
                                        <th>Event Title</th>
                                        <th>Package</th>
                                        <th>Organization</th>
                                        <th>Date</th>
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

                    <!-- REJECTED RESERVATIONS -->
                    <div id="rejectedSection" class="section-card" style="display: none;">
                        <h3>Cancelled Reservation</h3>
                        <div class="table-container">
                            <table class="table table-striped table-bordered" id="rejectedReservationTable">
                                <thead>
                                    <tr>
                                        <th>Event Title</th>
                                        <th>Package</th>
                                        <th>Organization</th>
                                        <th>Date</th>
                                        <th>Reference</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="rejectedReservationTableBody">
                                    <!-- Data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
    <script src="Scripts/js/global.js"></script>
    <script src="Scripts/js/Admin1.js"></script>
</body>
</html>