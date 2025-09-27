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
        <div id="LogIn">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username"/><br/><br/>
            <label for="password">Password:</label>
            <input type="text" id="password" name="password"/><br/><br/>
            <button id="btnLogIn" class="btn btn-primary" onclick="authenticateUser(); return false;" >Log-in</button>
            
        </div>
        <div id="form1">
            <asp:Button ID="Button1" runat="server" class="btn btn-primary" Text="Connect DB" OnClientClick="connectDB();return false;" />
        </div>
    </form>
</body>
</html>
