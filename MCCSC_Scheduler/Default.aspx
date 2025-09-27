<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="MCCSC_Scheduler.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="Scripts/css/default.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script type="text/javascript" src="Scripts/js/default.js"></script>
    <title>Home Page</title>
</head>
<body>

    <form id="aspForm" runat="server">    
            <div id="loginSection">
                <h2>Log In</h2>
                <div class="form-group">
                    <label for="loginUsername">Username:</label>
                    <input type="text" id="loginUsername" name="username" required />
                </div>
        
                <div class="form-group">
                    <label for="loginPassword">Password:</label>
                    <input type="password" id="loginPassword" name="password" required />
                </div>
        
                <div class="form-actions">
                    <button type="submit" id="btnLogIn" class="btn btn-primary" 
                            onclick="authenticateUser(); return false;">
                        Log In
                    </button>
                </div>
            </div>
        <div id="form1">
            <asp:Button ID="Button1" runat="server" class="btn btn-primary" Text="Connect DB" OnClientClick="connectDB();return false;" />
            <asp:Button ID="Button2" runat="server" class="btn btn-primary" Text="Create an Account" OnClientClick="openRegistrationModal();return false;" />
        </div>
    </form>
</body>
</html>
