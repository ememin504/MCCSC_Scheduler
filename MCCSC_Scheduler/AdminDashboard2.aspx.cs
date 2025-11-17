using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Web;
using System.Web.Configuration;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using MCCSC_Scheduler.Database;
using Newtonsoft.Json;
using static MCCSC_Scheduler.AdminDashboard2;

namespace MCCSC_Scheduler
{
    public partial class AdminDashboard2 : System.Web.UI.Page
    {
        private static DBContext dbContext;
        protected void Page_Load(object sender, EventArgs e)
        {
            dbContext = new DBContext(@".\SQLEXPRESS", "MCCSC_SchedulerDB");
            ConnectDB();
        }
        [WebMethod]
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
        public static string GetReservation(ReservationDTO requestData)
        {
            try
            {
                var requests = dbContext.GetReservation(requestData);
                return requests;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        public class RequestData
        {
            public int ReservationID { get; set; }
            public int ClientID { get; set; }
            public int StatusID { get; set; }
            public string Remarks { get; set; }
            public int AssetID { get; set; }
            public int AssetQuantity { get; set; }
            public int EventID { get; set; }
            public string Reference { get; set; }
        }
        [WebMethod]
        public static string GetRequestInfo(object requestData)
        {
            try
            {
                // Deserialize incoming JSON to a strongly typed C# object
                var jsonString = JsonConvert.SerializeObject(requestData);
                var data = JsonConvert.DeserializeObject<RequestData>(jsonString);

                string result = dbContext.GetRequestInfo(data.ReservationID, data.ClientID, data.StatusID, data.EventID);

                return result;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string GetUser()
        {
            try
            {
                var requests = dbContext.GetUser();
                return requests;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
    }
}