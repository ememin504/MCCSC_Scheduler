<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Homepage.aspx.cs" Inherits="MCCSC_Scheduler.Homepage" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
   <script type="text/javascript" src="Scripts/js/default.js"></script>
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
       
    </form>
    <form id="log-in "onsubmit="UserLogin(); return false;">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username"/><br/><br/>
        <label for="password">Password:</label>
        <input type="text" id="password" name="password"/><br/><br/>
        <button>Log-in</button>
    </form>
</body>
</html>
