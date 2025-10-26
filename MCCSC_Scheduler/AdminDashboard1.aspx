<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AdminDashboard1.aspx.cs" Inherits="MCCSC_Scheduler.AdminDashboard1" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
   <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script type="text/javascript" src="Scripts/js/Admin1.js"></script>
    <title></title>
</head>
<body>
    <script>
    window.AppData = {
        roleId: '<%= Session["role_id"] %>',
        userId: '<%= Session["user_id"] %>',
        userEmail: '<%= Session["user_email"] %>'
        roleName: '<%= Session["role_name"] %>'
        roleTypeID: '<%= Session["role_type_id"] %>'
        roleTypeDescription: '<%= Session["role_type_description"] %>'
        firstName: '<%= Session["first_name"] %>'
        middleInitial: '<%= Session["middle_initial"] %>'
        lastName: '<%= Session["last_name"] %>'
    };
    </script>
    <form id="aspForm" runat="server">
        <div id="form1">
            <asp:Button ID="Button1" runat="server" class="btn btn-primary" Text="Connect DB" OnClientClick="connectDB();return false;" />
             <asp:Button ID="btnReserve" runat="server" class="btn btn-primary " OnClientClick="openReservationModal(); return false;" Text="Request +" />
        </div>
    </form>
    <h1>Hello <span id="fullname"></span></h1>
    <p id="roles"></p>
    <h3>Registration Requests</h3>
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
        </tbody>
    </table>
    <h3>Users</h3>
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
        </tbody>
    </table>
    <h3>Reservation Requests</h3>
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
    </tbody>
    </table>

    <h3>Accepted Reservations</h3>
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
    </tbody>
    </table>
    <h3>Assets</h3>
    <button onclick="openCreateAssetModal(); return false">Add asset</button>
    <table class="table table-striped table-bordered" id="assetTable">
        <thead>
            <tr>
                <th>Asset ID</th>
                <th>Asset Name</th>
                <th>Quantity Available</th>
                <th>CategoryID</th>
                <th>IsActive</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="assetTableBody">
        </tbody>
    </table>
    <h3>Event Management</h3>
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
        </tbody>
    </table>
</body>
</html>
