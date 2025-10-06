using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using MCCSC_Scheduler.Database;
using Newtonsoft.Json;

namespace MCCSC_Scheduler
{
    public partial class AdminDashboard : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            dbContext = new DBContext(".\\SQLEXPRESS", "MCCSC_SchedulerDB");
            ConnectDB();
        }
        private static DBContext dbContext;

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

        [WebMethod] // ✅ REQUIRED
        public static string GetRegistrationRequests() // ✅ MUST be static
        {
            try
            {
                var requests = dbContext.GetRegistrationRequestDB(); // should return List<RegistrationRequest>
                return requests;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        [WebMethod]
        public static string GetAssets() // ✅ MUST be static
        {
            try
            {
                var requests = dbContext.GetAssetRecords(); // should return List<RegistrationRequest>
                return requests;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        [WebMethod]
        public static string UpdateAsset(object assetData)
        {
            try
            {
                var requests = dbContext.UpdateAsset(assetData); // ✅ works now
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

    }
}