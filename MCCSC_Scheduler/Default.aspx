<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="MCCSC_Scheduler.Homepage" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
   <script type="text/javascript" src="Scripts/js/default.js"></script>
    <title></title>
</head>
<body>
    <form id="LogIn" runat="server">
   
        <label for="username">Username:</label>
        <input type="text" id="username" name="username"/><br/><br/>
        <label for="password">Password:</label>
        <input type="text" id="password" name="password"/><br/><br/>
        <button onclick="connectDB(); return false;">Log-in</button>
        <asp:Button ID="btnTestConnect" runat="server" class="btn btn-primary" Text="Connect DB" OnClientClick="connectDB();return false;" />
    </form>
</body>
</html>
