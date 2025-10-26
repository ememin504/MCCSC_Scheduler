using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Runtime.Remoting.Messaging;
using System.Web.Script.Serialization;
using MCCSC_Scheduler.DTO;
using MCCSC_Scheduler.Model;
using MCCSC_Scheduler.ViewModel;
using Newtonsoft.Json;



namespace MCCSC_Scheduler.Database
{
    public class DBContext
    {
        private SqlConnection conn;
        private string connectionString;

        // ✅ Default constructor (always initializes the connection string)
        public DBContext()
        {
            conn = null;

            // 🔹 Replace with your actual SQL Server instance name and DB
            // Example: DESKTOP-12345\\SQLEXPRESS
            string dbServerName = "LAPTOP-OOTCMHFI\\SQLEXPRESS";
            string dbName = "MCCSC_SchedulerDB";

            // Use Windows Authentication (Integrated Security)
            connectionString = $"Data Source={dbServerName};Initial Catalog={dbName};Integrated Security=True;";
        }

        // Overloaded constructor with SQL authentication
        public DBContext(string dbServerName, string userID, string password, string dbName)
        {
            connectionString = $"Data Source={dbServerName};Initial Catalog={dbName};User ID={userID};Password={password}";
        }

        // Overloaded constructor with Windows authentication
        public DBContext(string dbServerName, string dbName)
        {
            connectionString = $"Data Source={dbServerName};Initial Catalog={dbName};Integrated Security=True;";
        }


        // Connect to DB
        public bool ConnectDB()
        {
            if (string.IsNullOrEmpty(connectionString))
                throw new InvalidOperationException("Connection string is not initialized.");

            conn = new SqlConnection(connectionString);

            try
            {
                conn.Open();

                // ✅ Log which DB and login you’re connected as
                using (SqlCommand cmd = new SqlCommand("SELECT DB_NAME()", conn))
                {
                    string currentDb = (string)cmd.ExecuteScalar();
                    System.Diagnostics.Debug.WriteLine(">>> Connected to DB: " + currentDb);
                }

                using (SqlCommand cmd = new SqlCommand("SELECT SUSER_SNAME()", conn))
                {
                    string currentLogin = (string)cmd.ExecuteScalar();
                    System.Diagnostics.Debug.WriteLine(">>> Connected as Login: " + currentLogin);
                }

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in ConnectDB: " + ex.Message, ex);
            }
        }

        // Close connection safely
        public void CloseDB()
        {
            if (conn != null && conn.State == System.Data.ConnectionState.Open)
            {
                conn.Close();
                conn.Dispose();
            }
        }
        // Authenticate User
        // Authenticate User (instance method, not static)
        public UserDTO AuthenticateUser(string username, string password)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // First: get user info
                string queryUser = @"
                                    SELECT user_id, username, role_id, email, first_name, middle_initial, last_name
                                    FROM Users 
                                    WHERE username = @UserName AND hashed_password = @Password;
                                ";

                UserDTO user = null;
                int userId = 0;
                int roleID = 0;

                using (SqlCommand cmd = new SqlCommand(queryUser, conn))
                {
                    cmd.Parameters.AddWithValue("@UserName", username);
                    cmd.Parameters.AddWithValue("@Password", password);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            userId = Convert.ToInt32(reader["user_id"]);
                            roleID = Convert.ToInt32(reader["role_id"]);
                            string roleName = roleID == 1 ? "Client" : "Admin";

                            user = new UserDTO
                            {
                                UserID = userId,
                                UserName = reader["username"].ToString(),
                                RoleID = roleID,
                                Email = reader["email"].ToString(),
                                FirstName = reader["first_name"].ToString(),
                                MiddleInitial = reader["middle_initial"].ToString(),
                                LastName = reader["last_name"].ToString(),
                            };
                        }
                        else
                        {
                            return null; // user not found
                        }
                    }
                }

                // Determine table names based on roleID
                string typeTable = roleID == 1 ? "Client" : "Admins";
                string descriptionTable = roleID == 1 ? "Client_type" : "Admin_type";

                // Combined query: get RoleTypeID and its description in one go
                string queryType = $@"
                                        SELECT t.type_id, d.type_description
                                        FROM {typeTable} t
                                        INNER JOIN {descriptionTable} d ON t.type_id = d.type_id
                                        WHERE t.user_id = @UserID;
                                    ";

                using (SqlCommand cmd = new SqlCommand(queryType, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", userId);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            user.RoleTypeID = Convert.ToInt32(reader["type_id"]);
                            user.RoleTypeDescription = reader["type_description"].ToString();
                        }
                    }
                }
                return user;
            }
        }


        /*public UserDTO GetUserInfo(int userId)
        {
            UserDTO user = null;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string query = "SELECT user_id, username, role_id, email FROM Users WHERE user_id = @userId";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@userId", userId);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            user = new UserDTO
                            {
                                UserID = reader.GetInt32(reader.GetOrdinal("user_id")),
                                UserName = reader.GetString(reader.GetOrdinal("username")),
                                RoleID = reader.GetInt32(reader.GetOrdinal("role_id")),
                                Email = reader.GetString(reader.GetOrdinal("email"))
                            };
                        }
                    }
                }
            }

            return user;
        }*/

        public List<AssetDTO> GetAssets()
        {
            List<AssetDTO> assets = new List<AssetDTO>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string query = "SELECT asset_id, asset_name, quantity_available, isActive FROM Assets";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        assets.Add(new AssetDTO
                        {
                            AssetId = reader.GetInt32(0),
                            AssetName = reader.GetString(1),
                            Quantity = reader.GetInt32(2),
                            IsActive = reader.GetBoolean(3)
                        });
                    }
                }
            }

            return assets; // ✅ returns List<AssetDTO>
        }




        public string GenerateOTP(int userID)
        {
            Random rnd = new Random();
            string otpCode = rnd.Next(100000, 999999).ToString();

            // Store OTP
            string storeResult = StoreOtp(userID, otpCode);
            // Send OTP via email
            //string emailResult = OTPtoEmail(userID, otpCode);

            return $"Generated OTP: {otpCode}, Store Result: {storeResult}";
            // Email Result: { emailResult}
        }


        public string StoreOtp(int userID, string otp)
        {
            string checkQuery = "SELECT COUNT(*) FROM UserOTP WHERE otp_code = @otp";
            string insertQuery = "INSERT INTO UserOTP (user_id, otp_code, expiration_time) VALUES (@userID, @otp, @expire_time)";
            string expire_time = DateTime.Now.AddMinutes(5).ToString("yyyy-MM-dd HH:mm:ss"); // OTP valid for 5 minutes
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // Step 1: Check if OTP already exists
                    using (SqlCommand checkCmd = new SqlCommand(checkQuery, conn))
                    {
                        checkCmd.Parameters.AddWithValue("@otp", otp);
                        int count = (int)checkCmd.ExecuteScalar();

                        if (count > 0)
                        {
                            return "Duplicate OTP detected. Please generate a new one.";
                        }
                    }

                    // Step 2: Insert new OTP if not duplicate
                    using (SqlCommand insertCmd = new SqlCommand(insertQuery, conn))
                    {
                        insertCmd.Parameters.AddWithValue("@userID", userID);
                        insertCmd.Parameters.AddWithValue("@otp", otp);
                        insertCmd.Parameters.AddWithValue("@expire_time", expire_time);

                        int rowsAffected = insertCmd.ExecuteNonQuery();

                        return rowsAffected > 0 ? "OTP stored successfully." : "Failed to store OTP.";
                    }
                }
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }
        public string StoreRegistration(UserDTO userDTO) {
            Console.WriteLine(userDTO);
            string query = @"INSERT INTO RegistrationRequests
                    (FirstName, MiddleInitial, LastName, Email, Organization, UserName, PassWord)
                    VALUES (@FirstName, @MiddleInitial, @LastName, @Email, @Organization, @UserName, @PassWord)";
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString)) {
                    conn.Open() ;
                    using (SqlCommand cmd = new SqlCommand(query, conn)) {
                        cmd.Parameters.AddWithValue("@FirstName", userDTO.FirstName);
                        cmd.Parameters.AddWithValue("@MiddleInitial", userDTO.MiddleInitial ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@LastName", userDTO.LastName);
                        cmd.Parameters.AddWithValue("@Email", userDTO.Email);
                        cmd.Parameters.AddWithValue("@Organization", userDTO.Organization ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@UserName", userDTO.UserName);
                        cmd.Parameters.AddWithValue("@PassWord", userDTO.PassWord);
                        int rows = cmd.ExecuteNonQuery();

                        return rows > 0 ? "Registration request stored successfully!" : "Failed to store registration.";
                    }
                }
            }
            catch (Exception ex) {
                return $"Error in StoreRegistration: {ex.Message}";
            }
           
        }
        public string GetRegistrationRequestDB()
        {
            string query = "SELECT RequestID, FirstName, MiddleInitial, LastName, Email, Organization, UserName, Status, DateRequested FROM RegistrationRequests WHERE Status = 'Pending'";
            List<object> requests = new List<object>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                requests.Add(new
                                {
                                    RequestID = reader["RequestID"],
                                    FirstName = reader["FirstName"],
                                    MiddleInitial = reader["MiddleInitial"] == DBNull.Value ? "" : reader["MiddleInitial"].ToString(),
                                    LastName = reader["LastName"],
                                    Email = reader["Email"],
                                    Organization = reader["Organization"],
                                    UserName = reader["UserName"],
                                    Status = reader["Status"],
                                    DateRequested = reader["DateRequested"]
                                });
                            }
                        }
                    }
                }

                // Serialize to JSON for easy return to JS
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return $"Error in GetRegistrationRequests: {ex.Message}";
            }
        }
        public string GetReservationRequest() {
            string query = @"SELECT * FROM Reservation WHERE status_id = 2";
            List<object> requests = new List<object>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {

                            while (reader.Read())
                            {
                                requests.Add(new
                                {
                                    ReservationID = reader["reservation_id"],
                                    ClientID = reader["client_id"],
                                    StatusID = reader["status_id"],
                                    Remarks = reader["remarks"],
                                    EventID = reader["event_id"],
                                    Reference = reader["hashed_reference"]
                                });                        
                            }
                        }
                    }
                }
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return $"Error in GetReservationRequest: {ex.Message}";
            }
        }
        public string GetRequestInfo(int reservationID, int clientID, int statusID, int eventID)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // 1️⃣ Get user_id using ClientID
                string getUserIdQuery = @"SELECT user_id FROM Client WHERE client_id = @ClientID";
                int userID;
                using (SqlCommand cmd = new SqlCommand(getUserIdQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@ClientID", clientID);
                    userID = Convert.ToInt32(cmd.ExecuteScalar());
                }

                // 2️⃣ Get client info using user_id
                string firstName = "", middleInitial = "", lastName = "";
                string getClientInfoQuery = @"SELECT first_name, middle_initial, last_name FROM Users WHERE user_id = @UserID";
                using (SqlCommand cmd = new SqlCommand(getClientInfoQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", userID);
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            firstName = reader["first_name"].ToString();
                            middleInitial = reader["middle_initial"].ToString();
                            lastName = reader["last_name"].ToString();
                        }
                    }
                }

                // 3️⃣ Get organization_id
                int organizationID;
                string getOrgIdQuery = @"SELECT organization_id FROM Client WHERE client_id = @ClientID";
                using (SqlCommand cmd = new SqlCommand(getOrgIdQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@ClientID", clientID);
                    organizationID = Convert.ToInt32(cmd.ExecuteScalar());
                }

                // 4️⃣ Get organization_name
                string organizationName = "";
                string getOrgNameQuery = @"SELECT organization_name FROM Organization WHERE organization_id = @OrganizationID";
                using (SqlCommand cmd = new SqlCommand(getOrgNameQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@OrganizationID", organizationID);
                    organizationName = cmd.ExecuteScalar()?.ToString() ?? "";
                }

                // 5️⃣ Get status_name
                string statusName = "";
                string getStatusNameQuery = @"SELECT status_name FROM reservation_status WHERE status_id = @StatusID";
                using (SqlCommand cmd = new SqlCommand(getStatusNameQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@StatusID", statusID);
                    statusName = cmd.ExecuteScalar()?.ToString() ?? "";
                }
                // 5️⃣ Get status_name and quantity
                List<object> assets = new List<object>();

                string query = @"
                            SELECT a.asset_name, aor.asset_quantity
                            FROM AssetOnReservation aor
                            INNER JOIN Assets a ON aor.asset_id = a.asset_id
                            WHERE aor.reservation_id = @ReservationID";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@ReservationID", reservationID);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            assets.Add(new
                            {
                                AssetName = reader["asset_name"].ToString(),
                                Quantity = Convert.ToInt32(reader["asset_quantity"])
                            });
                        }
                    }
                }

                List<object> date = new List<object>();

                string dateQuery = @"SELECT date, start_time, end_time FROM Reservation_Dates WHERE reservation_id = @ReservationID";

                 using (SqlCommand cmd = new SqlCommand(dateQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@ReservationID", reservationID);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            date.Add(new
                            {
                                Date = reader["date"].ToString(),
                                StartTime = reader["start_time"].ToString(),
                                EndTime = reader["end_time"].ToString(),
                            });
                        }
                    }
                }
                string eventName = "";
                string getEventNameQuery = @"SELECT title FROM Events WHERE event_id = @EventID";
                using (SqlCommand cmd = new SqlCommand(getEventNameQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@EventID", eventID);
                    eventName = cmd.ExecuteScalar()?.ToString() ?? "";
                }
                // ✅ Combine all data into JSON
                var result = new
                {
                    Client = new
                    {
                        FirstName = firstName,
                        MiddleInitial = middleInitial,
                        LastName = lastName
                    },
                    Organization = organizationName,
                    Status = statusName,
                    Date = date,
                    Asset = assets,
                    Event = eventName
                };

                return JsonConvert.SerializeObject(result, Formatting.Indented);
            }
        }
        public string GetUser()
        {
            string query = @"SELECT user_id, first_name, middle_initial, last_name, role_id, username, email FROM Users";
            List<object> users = new List<object>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            users.Add(new
                            {
                                UserID = reader["user_id"],
                                FirstName = reader["first_name"],
                                MiddleInitial = reader["middle_initial"] == DBNull.Value ? "" : reader["middle_initial"].ToString(),
                                LastName = reader["last_name"],
                                RoleID = reader["role_id"],
                                UserName = reader["username"],
                                Email = reader["email"]
                            });
                        }
                    }
                }

                return JsonConvert.SerializeObject(users);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = $"Error in GetUser: {ex.Message}" });
            }
        }

        public string ConfirmUser(object UserData)
        {
            var dict = UserData as Dictionary<string, object>;
            if (dict == null || !dict.ContainsKey("RequestID"))
                throw new Exception("Invalid UserData: missing RequestID.");

            int requestId = Convert.ToInt32(dict["RequestID"]);


            string selectRequestQuery = @"SELECT * FROM RegistrationRequests WHERE RequestID = @id";
            string selectOrgQuery = @"SELECT organization_id FROM Organization WHERE organization_name = @orgName";
            string insertOrgQuery = @"INSERT INTO Organization (organization_name, organization_type)
                              OUTPUT INSERTED.organization_id
                              VALUES (@orgName, 'Unknown')";
            string insertUserQuery = @"
                                INSERT INTO Users (first_name, middle_initial, last_name, email, role_id, username, hashed_password)
                                OUTPUT INSERTED.user_id
                                VALUES (@FirstName, @MiddleInitial, @LastName, @Email, @RoleID, @UserName, @Password)";

            string insertClientQuery = @"INSERT INTO Client (user_id, organization_id)
                                 VALUES (@UserID, @OrganizationID)";
            string updateStatusQuery = @"UPDATE RegistrationRequests SET Status = 'Confirmed' WHERE RequestID = @id";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                SqlTransaction transaction = conn.BeginTransaction();

                try
                {
                    // 1️⃣ Get registration request data
                    dynamic request = null;
                    using (SqlCommand cmd = new SqlCommand(selectRequestQuery, conn, transaction))
                    {
                        cmd.Parameters.AddWithValue("@id", requestId);
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                request = new
                                {
                                    FirstName = reader["FirstName"].ToString(),
                                    MiddleInitial = reader["MiddleInitial"] == DBNull.Value ? "" : reader["MiddleInitial"].ToString(),
                                    LastName = reader["LastName"].ToString(),
                                    Email = reader["Email"].ToString(),
                                    Organization = reader["Organization"].ToString(),
                                    UserName = reader["UserName"].ToString(),
                                    PassWord = reader["PassWord"].ToString()
                                };
                            }
                        }
                    }

                    if (request == null)
                        throw new Exception("Request record not found.");

                    // 2️⃣ Check if organization exists or insert a new one
                    int organizationId;
                    using (SqlCommand checkOrgCmd = new SqlCommand(selectOrgQuery, conn, transaction))
                    {
                        checkOrgCmd.Parameters.AddWithValue("@orgName", request.Organization);
                        object result = checkOrgCmd.ExecuteScalar();

                        if (result != null)
                        {
                            organizationId = Convert.ToInt32(result);
                        }
                        else
                        {
                            using (SqlCommand insertOrgCmd = new SqlCommand(insertOrgQuery, conn, transaction))
                            {
                                insertOrgCmd.Parameters.AddWithValue("@orgName", request.Organization);
                                organizationId = Convert.ToInt32(insertOrgCmd.ExecuteScalar());
                            }
                        }
                    }

                    // 3️⃣ Insert into Users (no password hashing yet)
                    int userId;
                    using (SqlCommand insertUserCmd = new SqlCommand(insertUserQuery, conn, transaction))
                    {
                        insertUserCmd.Parameters.AddWithValue("@FirstName", request.FirstName);
                        insertUserCmd.Parameters.AddWithValue("@MiddleInitial", request.MiddleInitial);
                        insertUserCmd.Parameters.AddWithValue("@LastName", request.LastName);
                        insertUserCmd.Parameters.AddWithValue("@Email", request.Email);
                        insertUserCmd.Parameters.AddWithValue("@RoleID", 1);
                        insertUserCmd.Parameters.AddWithValue("@UserName", request.UserName);
                        insertUserCmd.Parameters.AddWithValue("@Password", request.PassWord); // temporary plain password

                        object userResult = insertUserCmd.ExecuteScalar();
                        userId = Convert.ToInt32(userResult);
                    }

                    // 4️⃣ Insert into Client
                    using (SqlCommand insertClientCmd = new SqlCommand(insertClientQuery, conn, transaction))
                    {
                        insertClientCmd.Parameters.AddWithValue("@UserID", userId);
                        insertClientCmd.Parameters.AddWithValue("@OrganizationID", organizationId);
                        insertClientCmd.ExecuteNonQuery();
                    }

                    // 5️⃣ Update RegistrationRequests status
                    using (SqlCommand updateStatusCmd = new SqlCommand(updateStatusQuery, conn, transaction))
                    {
                        updateStatusCmd.Parameters.AddWithValue("@id", requestId);
                        updateStatusCmd.ExecuteNonQuery();
                    }

                    // ✅ Commit all changes
                    transaction.Commit();
                    return JsonConvert.SerializeObject(new { success = true, message = "User confirmed and distributed successfully." });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return JsonConvert.SerializeObject(new { success = false, error = ex.Message });
                }
            }
        }

        public string GetAssetRecords()
        {
            string query = "SELECT asset_id, asset_name, quantity_available, isActive FROM Assets";
            List<object> requests = new List<object>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                requests.Add(new
                                {
                                    AssetId = reader["asset_id"],
                                    AssetName = reader["asset_name"],
                                    Quantity = reader["quantity_available"] == DBNull.Value ? "" : reader["quantity_available"].ToString(),
                                    IsActive = reader["isActive"],
                                });
                            }
                        }
                    }
                }

                // Serialize to JSON for easy return to JS
                return JsonConvert.SerializeObject(requests);
            }
            catch (Exception ex)
            {
                return $"Error in GetRegistrationRequests: {ex.Message}";
            }

        }
        public string AddAsset(object assetData)
        {
            try
            {
                string json = JsonConvert.SerializeObject(assetData);
                var asset = JsonConvert.DeserializeObject<AssetModel>(json);

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = @"INSERT INTO Assets (asset_name, quantity_available)
                             VALUES (@name, @qty)";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@name", asset.AssetName);
                        cmd.Parameters.AddWithValue("@qty", asset.Quantity);
                        cmd.ExecuteNonQuery();
                    }
                }

                return "Asset record added successfully.";
            }
            catch (Exception ex)
            {
                return $"Error adding asset: {ex.Message}";
            }
        }

        public string UpdateAsset(object assetData)
        {
            string json = JsonConvert.SerializeObject(assetData);
            var asset = JsonConvert.DeserializeObject<AssetModel>(json);

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                string query = @"UPDATE Assets 
                         SET asset_name = @name, quantity_available = @qty, updated_at = @update_date
                         WHERE asset_id = @id";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.Add("@id", SqlDbType.Int).Value = asset.AssetID;
                    cmd.Parameters.Add("@name", SqlDbType.NVarChar, 255).Value = asset.AssetName;
                    cmd.Parameters.Add("@qty", SqlDbType.Int).Value = asset.Quantity;
                    cmd.Parameters.Add("@update_date", SqlDbType.DateTime).Value = DateTime.Now;

                    int rowsAffected = cmd.ExecuteNonQuery();
                    if (rowsAffected == 0)
                        return "No asset found with the specified ID.";
                }
            }

            return "Asset record updated successfully.";
        }

        public string ActivateAsset(object assetData)
        {
            try
            {
                // Convert the incoming object to your AssetModel
                string json = JsonConvert.SerializeObject(assetData);
                var asset = JsonConvert.DeserializeObject<AssetModel>(json);

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string query = @"UPDATE Assets 
                             SET isActive = 1 
                             WHERE asset_id = @id";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@id", asset.AssetID);
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return JsonConvert.SerializeObject(new
                            {
                                success = true,
                                message = "Asset Activated successfully."
                            });
                        }
                        else
                        {
                            return JsonConvert.SerializeObject(new
                            {
                                success = false,
                                message = "No matching asset found."
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = $"Error: {ex.Message}"
                });
            }
        }
        public string DeactivateAsset(object assetData)
        {
            try
            {
                // Convert the incoming object to your AssetModel
                string json = JsonConvert.SerializeObject(assetData);
                var asset = JsonConvert.DeserializeObject<AssetModel>(json);

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string query = @"UPDATE Assets 
                             SET isActive = 0 
                             WHERE asset_id = @id";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@id", asset.AssetID);
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return JsonConvert.SerializeObject(new
                            {
                                success = true,
                                message = "Asset deactivated successfully."
                            });
                        }
                        else
                        {
                            return JsonConvert.SerializeObject(new
                            {
                                success = false,
                                message = "No matching asset found."
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = $"Error: {ex.Message}"
                });
            }
        }

        public string OTPtoEmail(int UserID, string Otp) { 
            string email = "";
            string getEmailQuery = "SELECT email FROM Users WHERE user_id = @UserID";
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand(getEmailQuery, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserID", UserID);
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                email = reader.GetString(reader.GetOrdinal("email"));
                            }
                        }
                    }
                }
                if (!string.IsNullOrEmpty(email))
                {
                    string subject = "Your OTP Code";
                    string body = $"Your OTP code is: {Otp}. It is valid for 5 minutes.";
                    string emailResult = EmailHelper.SendEmail(email, subject, body);
                    return emailResult;
                }
                else
                {
                    return "Email address not found for the user.";
                }
            }
            catch (Exception ex)
            {
                return $"Error in OTPtoEmail: {ex.Message}";
            }
        }
        internal int ValidateOTP(OtpDTO otpDto)
        {
            string query = @"SELECT COUNT(*) 
                     FROM MCCSC_SchedulerDB.dbo.UserOTP
                     WHERE user_id = @userID
                     AND otp_code = @otp
                     AND expiration_time > GETDATE()";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@userID", otpDto.UserID);
                    cmd.Parameters.AddWithValue("@otp", otpDto.OtpCode);

                    object result = cmd.ExecuteScalar();
                    return (result != null) ? Convert.ToInt32(result) : 0;
                }
            }

        }
        public string GetClientInfo(object clientData)
        {
            var data = clientData as Dictionary<string, object>;
            if (data == null || !data.ContainsKey("UserID"))
                throw new ArgumentException("Invalid clientData: missing UserID");

            int userId = Convert.ToInt32(data["UserID"]);

            string query = @"
        SELECT 
            (U.first_name + ' ' + U.middle_initial + ' ' + U.last_name) AS FullName,
            C.client_id,
            O.organization_id,
            O.organization_name,
            O.organization_type
        FROM Users U
        INNER JOIN Client C ON U.user_id = C.user_id
        INNER JOIN Organization O ON C.organization_id = O.organization_id
        WHERE U.user_id = @UserID
    ";

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@UserID", userId);
                conn.Open();

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        var result = new
                        {
                            name = reader["FullName"].ToString(),
                            clientID = Convert.ToInt32(reader["client_id"]),
                            organizationID = Convert.ToInt32(reader["organization_id"]),
                            organizationName = reader["organization_name"].ToString(),
                            organizationType = reader["organization_type"].ToString()
                        };

                        // Convert anonymous object to JSON string
                        return new JavaScriptSerializer().Serialize(result);
                    }
                }
            }

            // Return empty if not found
            return new JavaScriptSerializer().Serialize(new { error = "Client not found" });
        }


        public string SubmitReservation(ReservationDTO reservationData)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    error = "Database connection string is not initialized."
                });
            }

            string eventName = reservationData.EventName;
            string eventDesc = reservationData.EventDescription;
            int clientId = reservationData.ClientID;
            var assets = reservationData.SelectedAssets;
            var dates = reservationData.EventDates;
            var orgID = reservationData.OrganizationID;

            int eventId;
            int reservationId;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                using (SqlTransaction trans = conn.BeginTransaction())
                {
                    try
                    {
                        // 1️⃣ Check or insert event
                        string checkEventQuery = "SELECT event_id FROM Events WHERE title = @Title";
                        using (SqlCommand checkCmd = new SqlCommand(checkEventQuery, conn, trans))
                        {
                            checkCmd.Parameters.AddWithValue("@Title", eventName);
                            object result = checkCmd.ExecuteScalar();

                            if (result != null)
                                eventId = Convert.ToInt32(result);
                            else
                            {
                                string insertEventQuery = "INSERT INTO Events (title, description, organization_id) OUTPUT INSERTED.event_id VALUES (@Title, @Description, @OrganizationID)";
                                using (SqlCommand insertCmd = new SqlCommand(insertEventQuery, conn, trans))
                                {
                                    insertCmd.Parameters.AddWithValue("@Title", eventName);
                                    insertCmd.Parameters.AddWithValue("@Description", eventDesc);
                                    insertCmd.Parameters.AddWithValue("@OrganizationID", orgID);
                                    eventId = (int)insertCmd.ExecuteScalar();
                                }
                            }
                        }

                        // 2️⃣ Insert Reservation
                        string insertReservation = @"INSERT INTO Reservation (client_id, status_id, event_id, hashed_reference)
                                           OUTPUT INSERTED.reservation_id VALUES (@ClientID, @StatusID, @EventID, @Reference)";
                        using (SqlCommand cmd = new SqlCommand(insertReservation, conn, trans))
                        {
                            cmd.Parameters.AddWithValue("@ClientID", clientId);
                            cmd.Parameters.AddWithValue("@StatusID", 2); // Pending
                            cmd.Parameters.AddWithValue("@EventID", eventId);
                            string reference = Guid.NewGuid().ToString().Substring(0, 8);
                            cmd.Parameters.AddWithValue("@Reference", reference);

                            reservationId = (int)cmd.ExecuteScalar();
                        }

                        // 3️⃣ Insert Assets
                        foreach (var asset in assets)
                        {
                            string insertAssetQuery = @"INSERT INTO AssetOnReservation (reservation_id, asset_id, asset_quantity)
                                             VALUES (@ReservationID, @AssetID, @Qty)";
                            using (SqlCommand assetCmd = new SqlCommand(insertAssetQuery, conn, trans))
                            {
                                assetCmd.Parameters.AddWithValue("@ReservationID", reservationId);
                                assetCmd.Parameters.AddWithValue("@AssetID", asset.AssetId);
                                assetCmd.Parameters.AddWithValue("@Qty", asset.Quantity);
                                assetCmd.ExecuteNonQuery();
                            }
                        }

                        // 4️⃣ Insert Dates (Check if date already exists)
                        foreach (var d in dates)
                        {
                            string checkDateQuery = @"SELECT COUNT(*) FROM Reservation_Dates 
                                              WHERE date = @Date 
                                              AND ((@StartTime BETWEEN start_time AND end_time)
                                               OR (@EndTime BETWEEN start_time AND end_time)
                                               OR (start_time BETWEEN @StartTime AND @EndTime)
                                               OR (end_time BETWEEN @StartTime AND @EndTime))";
                            using (SqlCommand checkDateCmd = new SqlCommand(checkDateQuery, conn, trans))
                            {
                                checkDateCmd.Parameters.AddWithValue("@Date", d.Date);
                                checkDateCmd.Parameters.AddWithValue("@StartTime", d.StartTime);
                                checkDateCmd.Parameters.AddWithValue("@EndTime", d.EndTime);

                                int exists = (int)checkDateCmd.ExecuteScalar();
                                if (exists > 0)
                                {
                                    trans.Rollback();
                                    return JsonConvert.SerializeObject(new
                                    {
                                        success = false,
                                        error = $"The event date {d.Date:yyyy-MM-dd} ({d.StartTime} - {d.EndTime}) is already booked."
                                    });
                                }
                            }

                            string insertDateQuery = @"INSERT INTO Reservation_Dates (reservation_id, date, start_time, end_time)
                                             VALUES (@ReservationID, @Date, @StartTime, @EndTime)";
                            using (SqlCommand dateCmd = new SqlCommand(insertDateQuery, conn, trans))
                            {
                                dateCmd.Parameters.AddWithValue("@ReservationID", reservationId);
                                dateCmd.Parameters.AddWithValue("@Date", d.Date);
                                dateCmd.Parameters.AddWithValue("@StartTime", d.StartTime);
                                dateCmd.Parameters.AddWithValue("@EndTime", d.EndTime);
                                dateCmd.ExecuteNonQuery();
                            }
                        }

                        trans.Commit();
                        return "{\"success\":true,\"message\":\"Reservation submitted successfully.\"}";
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        return "{\"success\":false,\"error\":\"" + ex.Message + "\"}";
                    }
                }
            }
        }


        public string AcceptReservation(ReservationDTO reservationData)
        {
            string updateStatus = @"UPDATE Reservation SET status_id = 3 WHERE reservation_id = @reservationID";
            try
            {
                // Get the reservation ID from the DTO
                int reservationID = reservationData.ReservationID;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand(updateStatus, conn))
                    {
                        cmd.Parameters.AddWithValue("@reservationID", reservationID);

                        conn.Open();
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                            return JsonConvert.SerializeObject(new { success = true });
                        else
                            return JsonConvert.SerializeObject(new { success = false, error = "Reservation not found." });
                    }
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, error = ex.Message });
            }
        }
        public string GetAcceptedReservation() {
            try {
                string query = @"SELECT * FROM Reservation WHERE status_id = 3";
                List<object> result = new List<object>();

                using (SqlConnection conn = new SqlConnection(connectionString)) {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand(query, conn)) { 
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.Add(new
                                {
                                    ReservationID = reader["reservation_id"],
                                    ClientID = reader["client_id"],
                                    StatusID = reader["status_id"] == DBNull.Value ? "" : reader["status_id"].ToString(),
                                    Remarks = reader["remarks"],
                                    EventID = reader["event_id"],
                                    Reference = reader["hashed_reference"],
                                });
                            }
                        }
                        return JsonConvert.SerializeObject(result);
                    }
                }
            }
            catch (Exception ex) {
                return $"Error in GetAcceptedReservation: {ex.Message}";
            }
        }
        public string GetEvents()
        {
            List<EventDTO> events = new List<EventDTO>();

            // get the entire event records especially the organization_id 
            string query = @"SELECT 
                                e.event_id,
                                e.title,
                                e.description,
                                e.isPrioritized,
                                e.isRecurring,
                                e.organization_id,
                                o.organization_name,
                                o.organization_type
                            FROM Events e
                            LEFT JOIN Organization o ON e.organization_id = o.organization_id";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            EventDTO ev = new EventDTO
                            {
                                EventID = Convert.ToInt32(reader["event_id"]),
                                EventTitle = reader["title"].ToString(),
                                Description = reader["description"].ToString(),
                                OrganizationID = reader["organization_id"] == DBNull.Value ? 0 : Convert.ToInt32(reader["organization_id"]),
                                OrganizationType = reader["organization_type"].ToString(),
                                OrganizationName = reader["organization_name"].ToString(),
                                IsPrioritized = Convert.ToBoolean(reader["isPrioritized"]),
                                IsRecurring = Convert.ToBoolean(reader["isRecurring"])
                            };

                            events.Add(ev);
                        }
                    }
                }
            }

            // Return as JSON string
            return JsonConvert.SerializeObject(events);
        }

        public bool PrioritizeEvent(int eventID) {
            string query = @"UPDATE Events SET isPrioritized = 1 WHERE event_id = @eventID";
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@eventID", eventID); // ✅ Add parameter

                    int rowsAffected = cmd.ExecuteNonQuery(); // ✅ ExecuteNonQuery for UPDATE
                    return rowsAffected > 0; // ✅ Return true if update succeeded
                }
            }
        }
        public bool UnprioritizeEvent(int eventID)
        {
            string query = @"UPDATE Events SET isPrioritized = 0 WHERE event_id = @eventID";
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@eventID", eventID); // ✅ Add parameter

                    int rowsAffected = cmd.ExecuteNonQuery(); // ✅ ExecuteNonQuery for UPDATE
                    return rowsAffected > 0; // ✅ Return true if update succeeded
                }
            }
        }

    }
}
