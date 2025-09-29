<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="MCCSC_Scheduler.Default" %>

<!DOCTYPE html>
<html>
<head runat="server">
    <title>User Login</title>
    <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="Scripts/css/default.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script src="Scripts/js/default.js"></script>
</head>
<body>
    <form id="aspForm" runat="server">    
        <div class="container mt-5">
            <div class="card p-4 shadow">
                <h2 class="mb-4">Log In</h2>

                <div class="form-group mb-3">
                    <label for="username">Username:</label>
                    <input type="text" id="username" class="form-control" required />
                </div>

                <div class="form-group mb-3">
                    <label for="password">Password:</label>
                    <input type="password" id="password" class="form-control" required />
                </div>

                <button type="button" class="btn btn-primary w-100" onclick="authenticateUser()">
                    Log In
                </button>
            </div>
        </div>
        <div>
    <!-- JS-only actions for now -->
            <asp:Button ID="Button1" runat="server" CssClass="btn btn-primary" 
                Text="Connect DB" OnClientClick="connectDB(); return false;" />

            <asp:Button ID="Button2" runat="server" CssClass="btn btn-primary" 
                Text="Create an Account" OnClientClick="openRegistrationModal(); return false;" />
        </div>
    </form>
     <form id="form1">
     </form>
</body>
</html>
