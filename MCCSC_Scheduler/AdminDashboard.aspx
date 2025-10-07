<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AdminDashboard.aspx.cs" Inherits="MCCSC_Scheduler.AdminDashboard" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
   <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script type="text/javascript" src="Scripts/js/Admin.js"></script>
    <title></title>
</head>
<body>
    <script>
    window.AppData = {
        roleId: '<%= Session["role_id"] %>',
        userId: '<%= Session["user_id"] %>',
        userEmail: '<%= Session["user_email"] %>'
    };
    </script>
    <form id="aspForm" runat="server">
        <div id="form1">
            <asp:Button ID="Button1" runat="server" class="btn btn-primary" Text="Connect DB" OnClientClick="connectDB();return false;" />
             <asp:Button ID="btnReserve" runat="server" class="btn btn-primary " OnClientClick="openReservationModal(); return false;" Text="Request +" />
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
            </tr>
        </thead>
        <tbody id="registrationTableBody">
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
                <th>IsActive</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="assetTableBody">
        </tbody>
    </table>
</body>
</html>
