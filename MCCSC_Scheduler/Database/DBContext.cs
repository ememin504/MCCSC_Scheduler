using System;
using System.Collections.Generic;
using System.Configuration;
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

        // Default constructor
        public DBContext()
        {
            conn = null;
            connectionString = string.Empty;
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
                string query = @"SELECT user_id, username, role_id, email  
                                FROM Users 
                                WHERE username = @UserName AND hashed_password = @Password
                                ";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserName", username);
                    cmd.Parameters.AddWithValue("@Password", password);

                    conn.Open();
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new UserDTO
                            {
                                UserID = Convert.ToInt32(reader["user_id"]),
                                UserName = reader["username"].ToString(),
                                RoleID = Convert.ToInt32(reader["role_id"]),
                                Email = reader["email"].ToString(),
                            };
                        }
                    }
                }
            }
            return null;
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
            string query = @"SELECT * FROM reservation WHERE status_id != 1";
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
                                    AssetID = reader["asset_id"],
                                    AssetQuantity = reader["asset_quantity"],
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
        public string GetRequestInfo(int clientID, int statusID, int assetID, int eventID)
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

                // 6️⃣ Get asset_name
                string assetName = "";
                string getAssetNameQuery = @"SELECT asset_name FROM Assets WHERE asset_id = @AssetID";
                using (SqlCommand cmd = new SqlCommand(getAssetNameQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@AssetID", assetID);
                    assetName = cmd.ExecuteScalar()?.ToString() ?? "";
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
                    Asset = assetName,
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
                         SET asset_name = @name, quantity_available = @qty 
                         WHERE asset_id = @id";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@id", asset.AssetID);
                    cmd.Parameters.AddWithValue("@name", asset.AssetName);
                    cmd.Parameters.AddWithValue("@qty", asset.Quantity);
                    cmd.ExecuteNonQuery();
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
                                O.organization_name,
                                O.organization_type
                            FROM Users U
                            INNER JOIN Client C ON U.user_id = C.user_id
                            INNER JOIN Organization O ON C.organization_id = O.organization_id
                            WHERE U.user_id = @UserID";

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
                            clientID = reader["client_id"].ToString(),
                            organizationName = reader["organization_name"].ToString(),
                            organizationType = reader["organization_type"].ToString()
                        };

                        // Convert anonymous object to JSON string
                        return new JavaScriptSerializer().Serialize(result);
                    }
                }
            }

            // Return empty JSON if no match found
            var empty = new
            {
                name = "",
                clientID = "",
                organizationName = "",
                organizationType = ""
            };
            return new JavaScriptSerializer().Serialize(empty);
        }

        public string SubmitReservation(object reservationData)
        {
            var serializer = new JavaScriptSerializer();
            dynamic data = reservationData;

            string eventName = data["EventName"];
            string eventDesc = data["EventDescription"];
            string clientId = data["ClientID"];
            var assets = data["SelectedAssets"];
            var dates = data["EventDates"];

            int eventId;
            int reservationId;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                SqlTransaction trans = conn.BeginTransaction();

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
                            string insertEventQuery = "INSERT INTO Events (title, description) OUTPUT INSERTED.event_id VALUES (@Title, @Description)";
                            using (SqlCommand insertCmd = new SqlCommand(insertEventQuery, conn, trans))
                            {
                                insertCmd.Parameters.AddWithValue("@Title", eventName);
                                insertCmd.Parameters.AddWithValue("@Description", eventDesc);
                                eventId = (int)insertCmd.ExecuteScalar();
                            }
                        }
                    }

                    // 2️⃣ Insert Reservation
                    string insertReservation = @"
                INSERT INTO Reservation (client_id, status_id, event_id, hashed_reference)
                OUTPUT INSERTED.reservation_id
                VALUES (@ClientID, @StatusID, @EventID, @Reference)";

                    using (SqlCommand cmd = new SqlCommand(insertReservation, conn, trans))
                    {
                        cmd.Parameters.AddWithValue("@ClientID", clientId);
                        cmd.Parameters.AddWithValue("@StatusID", 1); // assume 1 = Reviewed
                        cmd.Parameters.AddWithValue("@EventID", eventId);
                        cmd.Parameters.AddWithValue("@Reference", Guid.NewGuid().ToString().Substring(0, 8));

                        reservationId = (int)cmd.ExecuteScalar();
                    }

                    // 3️⃣ Insert Assets
                    foreach (var asset in assets)
                    {
                        string insertAssetQuery = @"
                    INSERT INTO AssetOnReservation (reservation_id, asset_id, asset_quantity)
                    VALUES (@ReservationID, @AssetID, @Qty)";
                        using (SqlCommand assetCmd = new SqlCommand(insertAssetQuery, conn, trans))
                        {
                            assetCmd.Parameters.AddWithValue("@ReservationID", reservationId);
                            assetCmd.Parameters.AddWithValue("@AssetID", (int)asset["AssetId"]);
                            assetCmd.Parameters.AddWithValue("@Qty", (int)asset["Qty"]);
                            assetCmd.ExecuteNonQuery();
                        }
                    }

                    // 4️⃣ Insert Dates
                    foreach (var d in dates)
                    {
                        string insertDateQuery = @"
                    INSERT INTO Reservation_Dates (reservation_id, date, start_time, end_time)
                    VALUES (@ReservationID, @Date, @StartTime, @EndTime)";
                        using (SqlCommand dateCmd = new SqlCommand(insertDateQuery, conn, trans))
                        {
                            dateCmd.Parameters.AddWithValue("@ReservationID", reservationId);
                            dateCmd.Parameters.AddWithValue("@Date", (string)d["date"]);
                            dateCmd.Parameters.AddWithValue("@StartTime", (string)d["startTime"]);
                            dateCmd.Parameters.AddWithValue("@EndTime", (string)d["endTime"]);
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
}