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
using MCCSC_Scheduler.DTO;
using Newtonsoft.Json;
using static MCCSC_Scheduler.AdminDashboard1;

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
        public static object GetReservationsByPackage()
        {
            List<PackageReservationDTO> result = new List<PackageReservationDTO>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"
            SELECT 
                p.package_id,
                p.package_name,
                COUNT(r.reservation_id) AS Total
            FROM Reservation r
            INNER JOIN Packages p ON r.package_id = p.package_id
            GROUP BY p.package_id, p.package_name
            ORDER BY Total DESC";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    conn.Open();
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            result.Add(new PackageReservationDTO
                            {
                                PackageId = Convert.ToInt32(reader["package_id"]),
                                PackageName = reader["package_name"].ToString(),
                                Total = Convert.ToInt32(reader["Total"])
                            });
                        }
                    }
                }
            }

            return new { success = true, data = result };
        }
        [WebMethod]
        public static object GetChartData()
        {
            string conStr = ConfigurationManager.ConnectionStrings["MyConn"].ConnectionString;

            List<string> months = new List<string>();
            List<int> monthlyCounts = new List<int>();

            Dictionary<string, int> statusData = new Dictionary<string, int>();

            using (SqlConnection con = new SqlConnection(conStr))
            {
                con.Open();

                // Monthly reservations
                SqlCommand cmd = new SqlCommand(@"
            SELECT DATENAME(MONTH, reservation_date) + ' ' + CAST(YEAR(reservation_date) AS VARCHAR),
                   COUNT(*) 
            FROM Reservation
            GROUP BY YEAR(reservation_date), MONTH(reservation_date), reservation_date
            ORDER BY YEAR(reservation_date), MONTH(reservation_date)", con);

                SqlDataReader rdr = cmd.ExecuteReader();
                while (rdr.Read())
                {
                    months.Add(rdr[0].ToString());
                    monthlyCounts.Add(Convert.ToInt32(rdr[1]));
                }
                rdr.Close();

                // Reservation status breakdown
                cmd = new SqlCommand(@"
            SELECT s.status_name, COUNT(*) 
            FROM Reservation r
            JOIN Status s ON r.status_id = s.status_id
            GROUP BY s.status_name", con);

                rdr = cmd.ExecuteReader();
                while (rdr.Read())
                    statusData.Add(rdr[0].ToString(), Convert.ToInt32(rdr[1]));
            }

            return new { months, monthlyCounts, statusData };
        }

        [WebMethod]
        public static object GetMonthlyReservationTrend()
        {
            try
            {
                DBContext db = new DBContext();
                var data = db.GetMonthlyReservations();

                return new
                {
                    success = true,
                    data = data
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    success = false,
                    error = ex.Message
                };
            }
        }


        [WebMethod]
        public static object GetDashboardData()
        {
            var db = new DBContext();

            int totalReservations = db.GetTotalReservations();
            List<DashboardStatusDTO> statusCounts = db.GetReservationStatusCounts();

            return new
            {
                totalReservations,
                statusCounts
            };
        }
        [WebMethod]
        public static string CreateNotification(NotificationDTO notificationDTO)
        {
            try
            {
                // Call database or mock method
                var notification = dbContext.CreateNotification(notificationDTO);

                // Return JSON to client
                return JsonConvert.SerializeObject(notification);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        [WebMethod]
        public static object GetNotifications(NotificationDTO notificationDTO)
        {
            try
            {
                var dbContext = new DBContext();  // ← FIXED

                var json = dbContext.GetNotifications(notificationDTO);

                return json;
            }
            catch (Exception ex)
            {
                return new { error = ex.Message };
            }
        }
        [WebMethod]
        public static string MarkAsRead(NotificationDTO notificationDTO)
        {
            try
            {

                var notifications = dbContext.MarkAsRead(notificationDTO);

                return notifications;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
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
        [ScriptMethod(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public static string SaveCoordinationMeeting(CoordinationMeetingDTO meetingData)
        {
            try
            {
                // Validate input
                if (meetingData == null)
                    throw new Exception("Meeting data is missing.");

                // Set created date/time
                meetingData.CreatedAt = DateTime.Now;

                // Call database save method
                var result = dbContext.SaveCoordinationMeeting(meetingData);

                return JsonConvert.SerializeObject(new
                {
                    success = true,
                    message = "Coordination meeting saved successfully.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = ex.Message
                });
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
        public static string ApproveReservation(ReservationDTO reservationData)
        {
            try
            {
                var requests = dbContext.ApproveReservation(reservationData);
                return requests;
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
        public static object GetAssetCategories()
        {
            try
            {
                return dbContext.GetAssetCategories(); // will be serialized automatically
            }
            catch (Exception ex)
            {
                return new { error = ex.Message };
            }
        }

        [WebMethod]
        public static string AddAssetCategory(string categoryName, int? parentCategoryId)
        {
            try
            {
                int result = dbContext.AddAssetCategory(categoryName, parentCategoryId);

                if (result == -1)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        success = false,
                        message = "This category already exists under the selected parent."
                    });
                }

                return JsonConvert.SerializeObject(new
                {
                    success = true,
                    message = "Category added successfully.",
                    newCategoryId = result
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
        [WebMethod]
        public static string SetCategoryStatus(int categoryID, bool isActive)
        {
            try
            {
                var result = dbContext.SetCategoryStatus(categoryID, isActive);
                return JsonConvert.SerializeObject(new { message = result });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        [WebMethod]
        public static string SaveCategoryChanges(CategoryDTO categoryData) {
            try
            {
                var requests = dbContext.SaveCategoryChanges(categoryData);
                return JsonConvert.SerializeObject(requests);
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
        public static string GetPackages()
        {
            try
            {
                var requests = dbContext.GetPackages();
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string CreatePackage(PackageDTO packageDTO)
        {
            try
            {
                var requests = dbContext.CreatePackage(packageDTO);
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        [WebMethod]
        public static string SavePackage(PackageDTO packageDTO)
        {
            try
            {
                var requests = dbContext.SavePackage(packageDTO);
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string DeactivatePackage(PackageDTO packageDTO)
        {
            try
            {
                var requests = dbContext.DeactivatePackage(packageDTO);
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }

        }
        [WebMethod]
        public static string ActivatePackage(PackageDTO packageDTO)
        {
            try
            {
                var requests = dbContext.ActivatePackage(packageDTO);
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }

        }
        [WebMethod]
        public static string OngoingExpiredSearch()
        {
            try
            {
                var requests = dbContext.OngoingExpiredSearch();
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
        public static string RejectReservation(ReservationDTO reservationData)
        {
            try
            {
                var requests = dbContext.RejectReservation(reservationData);
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string CancelReservation(ReservationDTO reservationData) {
            try
            {
                var requests = dbContext.CancelReservation(reservationData);
                return JsonConvert.SerializeObject(requests);
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
        [WebMethod]
        [ScriptMethod(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]

        public static string GetReservationDates(ReservationDTO requestData)
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
        [WebMethod]
        public static string GetRatings(RatingDTO ratingDTO)
        {
            try
            {
                var requests = dbContext.GetRatings(ratingDTO);
                return requests;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }
        [WebMethod]
        public static string EditReservation(ReservationDTO reservationDTO)
        {
            try
            {
                var requests = dbContext.EditReservation(reservationDTO);
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

        [WebMethod]
        public static string MarkTodaysReservation(EventDateDTO eventDateDTO)
        {
            try
            {
                string message = dbContext.MarkTodaysReservation(eventDateDTO);
                return message;
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }

        }
    }
}