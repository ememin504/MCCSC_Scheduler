using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using MCCSC_Scheduler.Database;
using MCCSC_Scheduler.DTO;

namespace MCCSC_Scheduler
{
    public partial class Default : System.Web.UI.Page
    {
        private static DBContext dbContext;
        protected void Page_Load(object sender, EventArgs e)
        {
            dbContext = new DBContext(".\\SQLEXPRESS", "MCCSC_SchedulerDB");
        }
        [WebMethod(Description = "A web method that will check the DB connection")]
        [ScriptMethod(UseHttpGet = true)]
        public static string ConnectDB()
        {
            string status = "Connected to DB successfully!";
            try
            {
                //attempt DB connection
                if (!dbContext.ConnectDB())
                    status = "Could not connect to DB!";
            }
            catch (Exception ex)
            {
                status = "Connection error: " + ex.Message;
            }

            return status;
        }

        [WebMethod]
        [ScriptMethod(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public static string AuthenticationResult(UserDTO userDTO )
        {
            string message = "Unable to verify username and password!";
            try
            {
                if (dbContext.AuthenticateUser(userDTO))
                    message = "User Login Successful!";
            }

            catch (Exception ex)
            {
                message = "Connection error: " + ex.Message;
            }

            return message;
        }
    }
}