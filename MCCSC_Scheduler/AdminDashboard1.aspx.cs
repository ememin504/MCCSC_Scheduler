using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using MCCSC_Scheduler.Database;
using Newtonsoft.Json;

namespace MCCSC_Scheduler
{
    public partial class AdminDashboard1 : System.Web.UI.Page
    {
        private static readonly string connectionString = WebConfigurationManager.ConnectionStrings["MCCSC_SchedulerDB"].ConnectionString;
        private static DBContext dbContext;
        protected void Page_Load(object sender, EventArgs e)
        {
            // ✅ Initialize database context (make sure DBContext sets up correctly)
            dbContext = new DBContext(@".\SQLEXPRESS", "MCCSC_SchedulerDB");
            ConnectDB();
        }

        [WebMethod]
        public static string GetLatestUpdateTime(string tableName)
        {
            string latest = string.Empty;
            string connectionString = ConfigurationManager.ConnectionStrings["MCCSC_SchedulerDB"].ConnectionString;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                string query;

                if (tableName == "Reservation")
                {
                    query = "SELECT MAX(updated_at) FROM Reservation";
                }
                else if (tableName == "RegistrationRequests")
                {
                    query = @"
                SELECT MAX(LatestDate)
                FROM (
                    SELECT MAX(DateRequested) AS LatestDate FROM RegistrationRequests
                    UNION ALL
                    SELECT MAX(DateReviewed) FROM RegistrationRequests WHERE DateReviewed IS NOT NULL
                ) AS CombinedDates";
                }
                else
                {
                    throw new ArgumentException("Invalid table name specified.");
                }

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    object result = cmd.ExecuteScalar();

                    if (result != DBNull.Value && result != null)
                    {
                        DateTime latestUpdate = Convert.ToDateTime(result);
                        latest = latestUpdate.ToString("yyyy-MM-dd HH:mm:ss.fff");
                    }
                }
            }

            // ✅ Return as JSON-safe string
            var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            return serializer.Serialize(new { LatestUpdate = latest });
        }
        [WebMethod]
        public static object CheckForUpdate()
        {
            return new
            {
                Reservation = GetLatestUpdateTime("Reservation"),
                Registration = GetLatestUpdateTime("RegistrationRequests")
            };
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
        public static string GetReservationRequest() {
            try
            {
                var requests = dbContext.GetReservationRequest();
                return requests;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
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
        [WebMethod] // ✅ REQUIRED
        public static string ConfirmUser(object UserData)
        {
            try
            {
                var requests = dbContext.ConfirmUser(UserData); // should return List<RegistrationRequest>
                return JsonConvert.SerializeObject(requests);
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
                var requests = dbContext.UpdateAsset(assetData); 
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        [WebMethod]
        public static string AddAsset(object assetData) {
            try {
                var requests = dbContext.AddAsset(assetData); 
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        [WebMethod]
        public static string DeactivateAsset(object assetData) {
            try
            {
                var requests = dbContext.DeactivateAsset(assetData);
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string ActivateAsset(object assetData) {
            try
            {
                var requests = dbContext.ActivateAsset(assetData);
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        [WebMethod]
        public static string AcceptReservation(ReservationDTO reservationData)
        {
            int reservationID = reservationData.ReservationID;
            // Do DB update
            string result = dbContext.AcceptReservation(reservationData);
            //return "{\"success\":true}";
            return result.ToString();
        }
        [WebMethod]
        public static string GetAcceptedReservation()
        {
            try
            {
                var requests = dbContext.GetAcceptedReservation();
                return requests;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string GetEvents()
        {
            try
            {
                DBContext dbContext = new DBContext();
                return dbContext.GetEvents();
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string PrioritizeEvent(int eventID) {
            try
            {
                DBContext dbContext = new DBContext();
                bool success = dbContext.PrioritizeEvent(eventID); // ✅ pass eventID

                var result = new
                {
                    success = success,
                    message = success ? "Event prioritized successfully." : "Failed to prioritize event."
                };

                return JsonConvert.SerializeObject(result);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string UnprioritizeEvent(int eventID)
        {
            try
            {
                DBContext dbContext = new DBContext();
                bool success = dbContext.UnprioritizeEvent(eventID); // ✅ pass eventID

                var result = new
                {
                    success = success,
                    message = success ? "Event unprioritized successfully." : "Failed to unprioritize event."
                };
                return JsonConvert.SerializeObject(result);

            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
    }
}