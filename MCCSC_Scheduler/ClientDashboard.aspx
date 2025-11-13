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
        userEmail: '<%= Session["user_email"] %>'
        roleName: '<%= Session["role_name"] %>'
        roleTypeID: '<%= Session["type_id"] %>'
        roleTypeDescription: '<%= Session["type_description"] %>'
        firstName: '<%= Session["first_name"] %>'
        middleInitial: '<%= Session["middle_initial"] %>'
        lastName: '<%= Session["last_name"] %>'
    };
    </script>

    <form id="aspForm" runat="server">
        <div id="form1">
             <asp:Button ID="btnReserve" runat="server" class="btn btn-primary " OnClientClick="openReservationModal(); return false;" Text="Request +" />
        </div>
        <div id="assetTableBody">
        </div>
        <div id="clientProfile">
        </div>
        <h3>Reservation Tracking</h3>
        <table class="table table-striped table-bordered" id="reservationTable">
            <thead>
                <tr>
                    <th>EventName</th>
                    <th>Event Description</th>
                    <th>Assets To be borrowed</th>
                    <th>Status</th>
                    <th>Event Dates</th>
                    <th>Reference</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="reservationTableBody">
            </tbody>
        </table>
    </form>
</body>
</html>
