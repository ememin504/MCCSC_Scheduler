<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ClientDashboard.aspx.cs" Inherits="MCCSC_Scheduler.ClientDashboard" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
     <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />

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
    };
    </script>

    <form id="aspForm" runat="server">
        <div id="form1">
            <asp:Button ID="Button1" runat="server" class="btn btn-primary" Text="Connect DB" OnClientClick="connectDB();return false;" />
             <asp:Button ID="btnReserve" runat="server" class="btn btn-primary " OnClientClick="openReservationModal(); return false;" Text="Request +" />
        </div>
        <div id="assetTableBody">
        </div>
        <div id="clientProfile">
        </div>
    </form>
</body>
</html>
