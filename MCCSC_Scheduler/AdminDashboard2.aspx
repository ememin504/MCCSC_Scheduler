<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AdminDashboard2.aspx.cs" Inherits="MCCSC_Scheduler.AdminDashboard2" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script type="text/javascript" src="Scripts/js/Admin2.js"></script>
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <div>

        </div>
    </form>
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
    <h3>Accepted Reservation</h3>
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
    <h3>Reservations Bound for Coordination Meeting</h3>
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
    </tbody>
    </table>
    <h3>Cancelled Reservation</h3>
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
</body>
</html>
