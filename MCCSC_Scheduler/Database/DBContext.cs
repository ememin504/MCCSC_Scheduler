using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Runtime.Remoting.Messaging;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.Services.Description;
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
        
 //User Section ========================================================================================================================

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
                                RoleName = roleName,
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

                string typeTable = roleID == 1 ? "Client" : "Admin";
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

//Asset Section========================================================================================================================
        public string SaveCategoryChanges(CategoryDTO categoryData) {
            string query = @"UPDATE AssetCategory 
                     SET category_name = @categoryName, 
                         parent_category_id = @parentCategoryID 
                     WHERE category_id = @categoryID";

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@categoryName", categoryData.CategoryName);

                        if (categoryData.ParentCategoryID.HasValue)
                            cmd.Parameters.AddWithValue("@parentCategoryID", categoryData.ParentCategoryID.Value);
                        else
                            cmd.Parameters.AddWithValue("@parentCategoryID", DBNull.Value);

                        cmd.Parameters.AddWithValue("@categoryID", categoryData.CategoryID);

                        conn.Open();
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                            return JsonConvert.SerializeObject(new { success = true, message = "Category updated successfully." });
                        else
                            return JsonConvert.SerializeObject(new { success = false, message = "No category found with the provided ID." });
                    }
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, error = ex.Message });
            }

        }
        public List<CategoryDTO> GetAssetCategories()
        {
            var categories = new List<CategoryDTO>();

            using (var conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string query = "SELECT category_id, category_name, parent_category_id, isActive FROM AssetCategory";

                using (var cmd = new SqlCommand(query, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        categories.Add(new CategoryDTO
                        {
                            CategoryID = Convert.ToInt32(reader["category_id"]),
                            CategoryName = reader["category_name"].ToString(),
                            ParentCategoryID = reader["parent_category_id"] == DBNull.Value
                                ? (int?)null
                                : Convert.ToInt32(reader["parent_category_id"]),
                            IsActive = reader["isActive"] != DBNull.Value && Convert.ToBoolean(reader["isActive"])
                        });
                    }
                }
            }

            return categories;
        }
        public string SetCategoryStatus(int categoryID, bool isActive)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = @"UPDATE AssetCategory 
                             SET IsActive = @status 
                             WHERE category_id = @categoryID";

                    // Convert bool to int (1 = true, 0 = false)
                    int statusValue = isActive ? 1 : 0;

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        // Add parameters properly
                        cmd.Parameters.AddWithValue("@status", statusValue);
                        cmd.Parameters.AddWithValue("@categoryID", categoryID);

                        conn.Open();
                        int rowsAffected = cmd.ExecuteNonQuery(); // Execute the UPDATE
                        conn.Close();

                        return rowsAffected > 0
                            ? (isActive ? "Category activated" : "Category deactivated")
                            : "Category not found";
                    }
                }
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }


        public int AddAssetCategory(string categoryName, int? parentCategoryId)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // Step 1: Check if category already exists (case-insensitive)
                string checkQuery = @"
            SELECT COUNT(*) 
            FROM AssetCategory 
            WHERE LOWER(category_name) = LOWER(@name)
              AND ((parent_category_id IS NULL AND @parentId IS NULL)
                   OR parent_category_id = @parentId)";

                using (SqlCommand checkCmd = new SqlCommand(checkQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@name", categoryName);
                    checkCmd.Parameters.AddWithValue("@parentId", (object)parentCategoryId ?? DBNull.Value);

                    int count = Convert.ToInt32(checkCmd.ExecuteScalar());
                    if (count > 0)
                    {
                        // Return -1 to indicate duplicate
                        return -1;
                    }
                }

                // Step 2: Insert new category if not duplicate
                string insertQuery = @"
            INSERT INTO AssetCategory (category_name, parent_category_id)
            VALUES (@name, @parentId);
            SELECT SCOPE_IDENTITY();";

                using (SqlCommand cmd = new SqlCommand(insertQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@name", categoryName);
                    cmd.Parameters.AddWithValue("@parentId", (object)parentCategoryId ?? DBNull.Value);

                    int newId = Convert.ToInt32(cmd.ExecuteScalar());
                    return newId;
                }
            }
        }



        public List<AssetDTO> GetAssets()
        {
            List<AssetDTO> assets = new List<AssetDTO>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                string query = @"
                                SELECT 
                                    a.asset_id,
                                    a.asset_name,
                                    a.quantity_available,
                                    a.isActive,
                                    a.category_id,
                                    c.category_name
                                FROM Assets a
                                INNER JOIN AssetCategory c ON a.category_id = c.category_id
                                WHERE a.isActive = 1 AND c.isActive = 1";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        assets.Add(new AssetDTO
                        {
                            AssetId = reader.GetInt32(reader.GetOrdinal("asset_id")),
                            AssetName = reader.GetString(reader.GetOrdinal("asset_name")),
                            Quantity = reader.GetInt32(reader.GetOrdinal("quantity_available")),
                            IsActive = reader.GetBoolean(reader.GetOrdinal("isActive")),
                            CategoryID = reader.GetInt32(reader.GetOrdinal("category_id")),
                            CategoryName = reader.GetString(reader.GetOrdinal("category_name"))
                        });
                    }
                }
            }

            return assets;
        }

        public string GetAssetRecords()
        {
            string query = @"
                            SELECT 
                                a.asset_id, 
                                a.asset_name, 
                                a.quantity_available, 
                                a.isActive, 
                                a.category_id, 
                                c.category_name
                            FROM Assets a
                            LEFT JOIN AssetCategory c ON a.category_id = c.category_id";

            List<object> assets = new List<object>();

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
                                assets.Add(new
                                {
                                    AssetId = reader["asset_id"],
                                    AssetName = reader["asset_name"],
                                    Quantity = reader["quantity_available"] == DBNull.Value ? "" : reader["quantity_available"].ToString(),
                                    CategoryID = reader["category_id"],
                                    CategoryName = reader["category_name"],
                                    IsActive = reader["isActive"]
                                });
                            }
                        }
                    }
                }

                return JsonConvert.SerializeObject(assets);
            }
            catch (Exception ex)
            {
                return $"Error in GetAssetRecords: {ex.Message}";
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
                    string query = @"INSERT INTO Assets (asset_name, quantity_available, category_id)
                             VALUES (@name, @qty, @catID)";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@name", asset.AssetName);
                        cmd.Parameters.AddWithValue("@qty", asset.Quantity);
                        cmd.Parameters.AddWithValue("@catID", asset.CategoryID);
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
                                SET asset_name = @name,
                                    quantity_available = @qty,
                                    category_id = @catID,
                                    updated_at = @update_date
                                WHERE asset_id = @id";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.Add("@id", SqlDbType.Int).Value = asset.AssetID;
                    cmd.Parameters.Add("@name", SqlDbType.NVarChar, 255).Value = asset.AssetName;
                    cmd.Parameters.Add("@qty", SqlDbType.Int).Value = asset.Quantity;
                    cmd.Parameters.Add("@catID", SqlDbType.Int).Value = asset.CategoryID;
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

 //OTP Section ========================================================================================================================
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

        //Reservation Section ========================================================================================================================
        public string GetReservation(ReservationDTO requestData)
        {
            int StatusSearch = 0;

            if (requestData.ReservationType == "Reservation Request")
                StatusSearch = 2;
            else if (requestData.ReservationType == "Accepted Reservation")
                StatusSearch = 3;
            else if (requestData.ReservationType == "Coordination Meeting")
                StatusSearch = 5;
            else if (requestData.ReservationType == "Cancellation Request")
                StatusSearch = 8;
            else if (requestData.ReservationType == "Cancelled")
                StatusSearch = 7;
            else if (requestData.ReservationType == "Approved Reservation")
                StatusSearch = 9;

                List<object> result = new List<object>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // -------------------------------------------------------
                    // MAIN RESERVATION QUERY (always runs)
                    // -------------------------------------------------------
                    string queryA = @"
                SELECT * FROM Reservation WHERE status_id = @StatusSearch";

                    if (StatusSearch == 8)
                    {
                        queryA = @"
                    SELECT r.*, c.reason
                    FROM Reservation r
                    LEFT JOIN CancellationRequests c
                        ON r.reservation_id = c.reservation_id
                    WHERE r.status_id = @StatusSearch";
                    }

                    using (SqlCommand cmd = new SqlCommand(queryA, conn))
                    {
                        cmd.Parameters.AddWithValue("@StatusSearch", StatusSearch);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.Add(new
                                {
                                    //Type = "Reservation",
                                    ReservationID = reader["reservation_id"],
                                    ClientID = reader["client_id"],
                                    StatusID = reader["status_id"],
                                    Remarks = reader["remarks"],
                                    EventID = reader["event_id"],
                                    Reference = reader["hashed_reference"],
                                    Reason = StatusSearch == 8 ? reader["reason"]?.ToString() : null
                                });
                            }
                        }
                    }

                    // -------------------------------------------------------
                    // SECOND QUERY (Only runs when StatusSearch == 5)
                    // -------------------------------------------------------
                    if (StatusSearch == 5)
                    {
                        // 1. Load all coordination meeting data first
                        DateTime? meetingDate = null;
                        string meetingTime = null;
                        string meetingRemarks = null;

                        string queryB = @"SELECT TOP 1 meeting_date, meeting_time, remarks 
                      FROM CoordinationMeetingDates";

                        using (SqlCommand cmd2 = new SqlCommand(queryB, conn))
                        using (SqlDataReader reader = cmd2.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                meetingDate = reader["meeting_date"] as DateTime?;
                                meetingTime = reader["meeting_time"]?.ToString();
                                meetingRemarks = reader["remarks"]?.ToString();
                            }
                        }

                        // 2. Attach meeting info to each reservation
                        for (int i = 0; i < result.Count; i++)
                        {
                            var item = result[i];

                            result[i] = new
                            {
                                ReservationID = item.GetType().GetProperty("ReservationID")?.GetValue(item),
                                ClientID = item.GetType().GetProperty("ClientID")?.GetValue(item),
                                StatusID = item.GetType().GetProperty("StatusID")?.GetValue(item),
                                Remarks = item.GetType().GetProperty("Remarks")?.GetValue(item),
                                EventID = item.GetType().GetProperty("EventID")?.GetValue(item),
                                Reference = item.GetType().GetProperty("Reference")?.GetValue(item),

                                // Add these fields
                                MeetingDate = meetingDate,
                                MeetingTime = meetingTime
                            };
                        }
                    }

                }

                return JsonConvert.SerializeObject(result);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { error = ex.Message });
            }
        }

        public string GetRequestInfo(int reservationID, int clientID, int statusID, int eventID)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // 1️⃣ Get user_id + organization_id in ONE query
                int userID = 0, organizationID = 0;
                string clientQuery = @"
            SELECT user_id, organization_id 
            FROM Client 
            WHERE client_id = @ClientID";

                using (SqlCommand cmd = new SqlCommand(clientQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@ClientID", clientID);
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            userID = Convert.ToInt32(reader["user_id"]);
                            organizationID = Convert.ToInt32(reader["organization_id"]);
                        }
                        else
                        {
                            return JsonConvert.SerializeObject(new { error = "Client not found" });
                        }
                    }
                }

                // 2️⃣ Get Client Name
                string firstName = "", middleInitial = "", lastName = "";
                string userQuery = @"SELECT first_name, middle_initial, last_name FROM Users WHERE user_id = @UserID";
                using (SqlCommand cmd = new SqlCommand(userQuery, conn))
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

                // 3️⃣ Get Organization Name
                string organizationName = "";
                string orgQuery = @"SELECT organization_name FROM Organization WHERE organization_id = @OrganizationID";
                using (SqlCommand cmd = new SqlCommand(orgQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@OrganizationID", organizationID);
                    organizationName = cmd.ExecuteScalar()?.ToString() ?? "";
                }

                // 4️⃣ Get Status Name
                string statusName = "";
                string statusQuery = @"SELECT status_name FROM reservation_status WHERE status_id = @StatusID";
                using (SqlCommand cmd = new SqlCommand(statusQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@StatusID", statusID);
                    statusName = cmd.ExecuteScalar()?.ToString() ?? "";
                }

                // 5️⃣ Previous Status (only if statusID = 8)
                int? previousStatusID = null;
                string previousStatusName = null;

                if (statusID == 8)
                {
                    string prevStatusQuery = @"
                SELECT previous_status_id 
                FROM CancellationRequests 
                WHERE reservation_id = @ReservationID";

                    using (SqlCommand cmd = new SqlCommand(prevStatusQuery, conn))
                    {
                        cmd.Parameters.AddWithValue("@ReservationID", reservationID);
                        var result = cmd.ExecuteScalar();
                        if (result != null && result != DBNull.Value)
                            previousStatusID = Convert.ToInt32(result);
                    }

                    if (previousStatusID.HasValue)
                    {
                        string prevStatusNameQuery = @"SELECT status_name FROM reservation_status WHERE status_id = @StatusID";
                        using (SqlCommand cmd = new SqlCommand(prevStatusNameQuery, conn))
                        {
                            cmd.Parameters.AddWithValue("@StatusID", previousStatusID.Value);
                            previousStatusName = cmd.ExecuteScalar()?.ToString() ?? "";
                        }
                    }
                }

                // 6️⃣ Get Assets
                List<object> assets = new List<object>();
                string assetQuery = @"
            SELECT a.asset_name, aor.asset_quantity
            FROM AssetOnReservation aor
            INNER JOIN Assets a ON aor.asset_id = a.asset_id
            WHERE aor.reservation_id = @ReservationID";

                using (SqlCommand cmd = new SqlCommand(assetQuery, conn))
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

                // 7️⃣ Get Reservation Dates
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
                                EndTime = reader["end_time"].ToString()
                            });
                        }
                    }
                }

                // 8️⃣ Get Event Name
                string eventName = "";
                string eventQuery = @"SELECT title FROM Events WHERE event_id = @EventID";
                using (SqlCommand cmd = new SqlCommand(eventQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@EventID", eventID);
                    eventName = cmd.ExecuteScalar()?.ToString() ?? "";
                }

                // 9️⃣ Build Final JSON
                var resultObj = new
                {
                    Client = new
                    {
                        FirstName = firstName,
                        MiddleInitial = middleInitial,
                        LastName = lastName
                    },
                    Organization = organizationName,
                    Status = statusName,
                    PreviousStatusID = previousStatusID,
                    PreviousStatusName = previousStatusName,
                    Date = date,
                    Asset = assets,
                    Event = eventName
                };

                return JsonConvert.SerializeObject(resultObj, Formatting.Indented);
            }
        }


        // ============================================================
        // ===============  SUBMIT RESERVATION METHOD  ================
        // ============================================================
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
                        // 1️⃣ Check for date conflicts (supports overnight)
                        foreach (var d in dates)
                        {
                            DateTime dateOnly = d.Date.Date;
                            TimeSpan startTime = TimeSpan.Parse(d.StartTime);
                            TimeSpan endTime = TimeSpan.Parse(d.EndTime);

                            // Split overnight reservations into two checks
                            if (startTime < endTime)
                            {
                                // Normal reservation (same day)
                                string conflictQuery = @"
                            SELECT COUNT(*) FROM Reservation_Dates
                            WHERE date = @Date
                            AND (
                                (@StartTime < @EndTime AND (
                                    (@StartTime BETWEEN start_time AND end_time)
                                    OR (@EndTime BETWEEN start_time AND end_time)
                                    OR (start_time BETWEEN @StartTime AND @EndTime)
                                    OR (end_time BETWEEN @StartTime AND @EndTime)
                                ))
                            )";
                                using (SqlCommand checkCmd = new SqlCommand(conflictQuery, conn, trans))
                                {
                                    checkCmd.Parameters.AddWithValue("@Date", dateOnly);
                                    checkCmd.Parameters.AddWithValue("@StartTime", startTime);
                                    checkCmd.Parameters.AddWithValue("@EndTime", endTime);

                                    int exists = (int)checkCmd.ExecuteScalar();
                                    if (exists > 0)
                                    {
                                        trans.Rollback();
                                        return JsonConvert.SerializeObject(new
                                        {
                                            success = false,
                                            error = $"Reservation failed: the date {dateOnly:yyyy-MM-dd} {startTime}-{endTime} is already booked."
                                        });
                                    }
                                }
                            }
                            else
                            {
                                // Overnight reservation (spans two dates)
                                // Day 1
                                string conflictQuery1 = @"
                            SELECT COUNT(*) FROM Reservation_Dates
                            WHERE date = @Date
                            AND (
                                (@StartTime BETWEEN start_time AND end_time)
                                OR (start_time BETWEEN @StartTime AND CAST('23:59:59.9999999' AS TIME))
                            )";
                                using (SqlCommand cmd1 = new SqlCommand(conflictQuery1, conn, trans))
                                {
                                    cmd1.Parameters.AddWithValue("@Date", dateOnly);
                                    cmd1.Parameters.AddWithValue("@StartTime", startTime);
                                    int exists1 = (int)cmd1.ExecuteScalar();
                                    if (exists1 > 0)
                                    {
                                        trans.Rollback();
                                        return JsonConvert.SerializeObject(new
                                        {
                                            success = false,
                                            error = $"Reservation failed: the date {dateOnly:yyyy-MM-dd} {startTime}-{endTime} (overnight) is already booked."
                                        });
                                    }
                                }

                                // Day 2
                                string conflictQuery2 = @"
                            SELECT COUNT(*) FROM Reservation_Dates
                            WHERE date = @NextDate
                            AND (
                                (@EndTime BETWEEN start_time AND end_time)
                                OR (start_time BETWEEN CAST('00:00:00' AS TIME) AND @EndTime)
                            )";
                                using (SqlCommand cmd2 = new SqlCommand(conflictQuery2, conn, trans))
                                {
                                    cmd2.Parameters.AddWithValue("@NextDate", dateOnly.AddDays(1));
                                    cmd2.Parameters.AddWithValue("@EndTime", endTime);
                                    int exists2 = (int)cmd2.ExecuteScalar();
                                    if (exists2 > 0)
                                    {
                                        trans.Rollback();
                                        return JsonConvert.SerializeObject(new
                                        {
                                            success = false,
                                            error = $"Reservation failed: the date {dateOnly.AddDays(1):yyyy-MM-dd} 00:00-{endTime} (overnight) is already booked."
                                        });
                                    }
                                }
                            }
                        }

                        // 2️⃣ Insert or get Event
                        string checkEventQuery = "SELECT event_id FROM Events WHERE title = @Title";
                        using (SqlCommand checkCmd = new SqlCommand(checkEventQuery, conn, trans))
                        {
                            checkCmd.Parameters.AddWithValue("@Title", eventName);
                            object result = checkCmd.ExecuteScalar();
                            eventId = result != null ? Convert.ToInt32(result) : 0;
                        }

                        if (eventId == 0)
                        {
                            string insertEventQuery = @"
                        INSERT INTO Events (title, description, organization_id)
                        OUTPUT INSERTED.event_id
                        VALUES (@Title, @Description, @OrganizationID)";
                            using (SqlCommand insertCmd = new SqlCommand(insertEventQuery, conn, trans))
                            {
                                insertCmd.Parameters.AddWithValue("@Title", eventName);
                                insertCmd.Parameters.AddWithValue("@Description", eventDesc);
                                insertCmd.Parameters.AddWithValue("@OrganizationID", orgID);
                                eventId = (int)insertCmd.ExecuteScalar();
                            }
                        }

                        // 3️⃣ Insert Reservation
                        string insertReservation = @"
                    INSERT INTO Reservation (client_id, status_id, event_id, hashed_reference)
                    OUTPUT INSERTED.reservation_id
                    VALUES (@ClientID, @StatusID, @EventID, @Reference)";
                        using (SqlCommand cmd = new SqlCommand(insertReservation, conn, trans))
                        {
                            cmd.Parameters.AddWithValue("@ClientID", clientId);
                            cmd.Parameters.AddWithValue("@StatusID", 2); // Pending
                            cmd.Parameters.AddWithValue("@EventID", eventId);
                            string reference = Guid.NewGuid().ToString().Substring(0, 8);
                            cmd.Parameters.AddWithValue("@Reference", reference);

                            reservationId = (int)cmd.ExecuteScalar();
                        }

                        // 4️⃣ Insert Assets
                        foreach (var asset in assets)
                        {
                            string insertAssetQuery = @"
                        INSERT INTO AssetOnReservation (reservation_id, asset_id, asset_quantity)
                        VALUES (@ReservationID, @AssetID, @Qty)";
                            using (SqlCommand assetCmd = new SqlCommand(insertAssetQuery, conn, trans))
                            {
                                assetCmd.Parameters.AddWithValue("@ReservationID", reservationId);
                                assetCmd.Parameters.AddWithValue("@AssetID", asset.AssetId);
                                assetCmd.Parameters.AddWithValue("@Qty", asset.Quantity);
                                assetCmd.ExecuteNonQuery();
                            }
                        }

                        // 5️⃣ Insert Dates (split overnight if needed)
                        foreach (var d in dates)
                        {
                            DateTime dateOnly = d.Date.Date;
                            TimeSpan startTime = TimeSpan.Parse(d.StartTime);
                            TimeSpan endTime = TimeSpan.Parse(d.EndTime);

                            if (startTime < endTime)
                            {
                                string insertDateQuery = @"
                            INSERT INTO Reservation_Dates (reservation_id, date, start_time, end_time)
                            VALUES (@ReservationID, @Date, @StartTime, @EndTime)";
                                using (SqlCommand dateCmd = new SqlCommand(insertDateQuery, conn, trans))
                                {
                                    dateCmd.Parameters.AddWithValue("@ReservationID", reservationId);
                                    dateCmd.Parameters.AddWithValue("@Date", dateOnly);
                                    dateCmd.Parameters.AddWithValue("@StartTime", startTime);
                                    dateCmd.Parameters.AddWithValue("@EndTime", endTime);
                                    dateCmd.ExecuteNonQuery();
                                }
                            }
                            else
                            {
                                string insertDate1 = @"
                            INSERT INTO Reservation_Dates (reservation_id, date, start_time, end_time)
                            VALUES (@ReservationID, @Date, @StartTime, CAST('23:59:59.9999999' AS TIME))";
                                using (SqlCommand cmd1 = new SqlCommand(insertDate1, conn, trans))
                                {
                                    cmd1.Parameters.AddWithValue("@ReservationID", reservationId);
                                    cmd1.Parameters.AddWithValue("@Date", dateOnly);
                                    cmd1.Parameters.AddWithValue("@StartTime", startTime);
                                    cmd1.ExecuteNonQuery();
                                }

                                string insertDate2 = @"
                            INSERT INTO Reservation_Dates (reservation_id, date, start_time, end_time)
                            VALUES (@ReservationID, @NextDate, CAST('00:00:00' AS TIME), @EndTime)";
                                using (SqlCommand cmd2 = new SqlCommand(insertDate2, conn, trans))
                                {
                                    cmd2.Parameters.AddWithValue("@ReservationID", reservationId);
                                    cmd2.Parameters.AddWithValue("@NextDate", dateOnly.AddDays(1));
                                    cmd2.Parameters.AddWithValue("@EndTime", endTime);
                                    cmd2.ExecuteNonQuery();
                                }
                            }
                        }

                        // ✅ Commit transaction
                        trans.Commit();

                        // Return reservation_id along with success message
                        return JsonConvert.SerializeObject(new
                        {
                            success = true,
                            reservation_id = reservationId,
                            message = "Reservation submitted successfully."
                        });

                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        return JsonConvert.SerializeObject(new
                        {
                            success = false,
                            error = ex.Message
                        });
                    }
                }
            }
        }

        public string CreateNotification(NotificationDTO notificationData)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // Insert notification for client
                    string insertForClient = @"
                INSERT INTO Notifications (user_id, reservation_id, status_id, is_read, NoteFor, created_at)
                VALUES (@UserID, @ReservationID, @StatusID, 0, @NoteFor, GETDATE())";

                    // Insert notification for admin (using client_id)
                    string insertForAdmin = @"
                INSERT INTO Notifications (user_id, client_id, reservation_id, status_id, is_read, NoteFor, created_at)
                VALUES (@UserID, @ClientID, @ReservationID, @StatusID, 0, @NoteFor, GETDATE())";

                    // Query to get client_id from reservation
                    string getClientID = @"
                SELECT client_id FROM Reservation WHERE reservation_id = @ReservationID";

                    // =============================
                    // If Client made changes → Notify Admin
                    // =============================
                    if (notificationData.NoteFor == "Admin")
                    {
                        using (SqlCommand cmd = new SqlCommand(insertForClient, conn))
                        {
                            cmd.Parameters.AddWithValue("@UserID", notificationData.UserID); // Admin's user ID
                            cmd.Parameters.AddWithValue("@ReservationID", notificationData.ReservationID);
                            cmd.Parameters.AddWithValue("@StatusID", notificationData.StatusID);
                            cmd.Parameters.AddWithValue("@NoteFor", notificationData.NoteFor);

                            cmd.ExecuteNonQuery();
                        }
                    }

                    // =============================
                    // If Admin made changes → Notify Client
                    // =============================
                    else if (notificationData.NoteFor == "Client")
                    {
                        int clientID = 0;

                        using (SqlCommand getCmd = new SqlCommand(getClientID, conn))
                        {
                            getCmd.Parameters.AddWithValue("@ReservationID", notificationData.ReservationID);

                            object result = getCmd.ExecuteScalar();
                            if (result != null)
                                clientID = Convert.ToInt32(result);
                        }

                        using (SqlCommand insertCmd = new SqlCommand(insertForAdmin, conn))
                        {
                            insertCmd.Parameters.AddWithValue("@UserID", notificationData.UserID);
                            insertCmd.Parameters.AddWithValue("@ClientID", clientID);
                            insertCmd.Parameters.AddWithValue("@ReservationID", notificationData.ReservationID);
                            insertCmd.Parameters.AddWithValue("@StatusID", notificationData.StatusID);
                            insertCmd.Parameters.AddWithValue("@NoteFor", notificationData.NoteFor);

                            insertCmd.ExecuteNonQuery();
                        }
                    }
                }

                return JsonConvert.SerializeObject(new
                {
                    success = true,
                    message = "Notification created successfully."
                }); 
                //return JsonConvert.SerializeObject(notificationData.UserID);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    error = ex.Message
                });
            }
            //return JsonConvert.SerializeObject(notificationData);
        }
        public string GetNotifications(NotificationDTO notificationDTO)
        {
            try
            {
                if (notificationDTO == null)
                    throw new Exception("notificationDTO IS NULL");

                List<NotificationDTO> results = new List<NotificationDTO>();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string query = "";

                    if (notificationDTO.PageType == "Admin")
                    {
                        query = @"SELECT * FROM Notifications 
                          WHERE NoteFor = 'Admin'
                          ORDER BY created_at DESC";
                    }
                    else if (notificationDTO.PageType == "Client")
                    {
                        query = @"SELECT * FROM Notifications 
                          WHERE NoteFor = 'Client' AND client_id = @ClientID
                          ORDER BY created_at DESC";
                    }

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        if (notificationDTO.PageType == "Client")
                        {
                            cmd.Parameters.AddWithValue("@ClientID", notificationDTO.ClientID);
                        }

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                results.Add(new NotificationDTO
                                {
                                    NotificationID = Convert.ToInt32(reader["notification_id"]),
                                    UserID = Convert.ToInt32(reader["user_id"]),   // ✔ use this value
                                    ClientID = reader["client_id"] != DBNull.Value ? Convert.ToInt32(reader["client_id"]) : 0,
                                    ReservationID = reader["reservation_id"] != DBNull.Value ? Convert.ToInt32(reader["reservation_id"]) : 0,
                                    StatusID = Convert.ToInt32(reader["status_id"]),
                                    IsRead = Convert.ToBoolean(reader["is_read"]),
                                    CreatedAt = Convert.ToDateTime(reader["created_at"]),
                                    NoteFor = reader["NoteFor"] != DBNull.Value ? reader["NoteFor"].ToString() : "",
                                    ClientName = ""
                                });
                            }
                        }
                    }

                    // ✔ ADMIN ONLY: Get client name using stored UserID
                    if (notificationDTO.PageType == "Admin")
                    {
                        foreach (var item in results)
                        {
                            if (item.UserID > 0)
                            {
                                string queryUser = @"SELECT first_name, last_name 
                                             FROM Users 
                                             WHERE user_id = @UserID";

                                using (SqlCommand userCmd = new SqlCommand(queryUser, conn))
                                {
                                    userCmd.Parameters.AddWithValue("@UserID", item.UserID);

                                    using (SqlDataReader userReader = userCmd.ExecuteReader())
                                    {
                                        if (userReader.Read())
                                        {
                                            item.ClientName = $"{userReader["first_name"]} {userReader["last_name"]}";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                return JsonConvert.SerializeObject(results);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, error = ex.Message });
            }
        }


        public string MarkAsRead(NotificationDTO notificationDTO)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string query = @"UPDATE Notifications 
                             SET is_read = 1 
                             WHERE notification_id = @NotificationID";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@NotificationID", notificationDTO.NotificationID);

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return "Notification successfully marked as read";
                        }
                        else
                        {
                            return "no rows updated";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }



        public string AcceptReservation(ReservationDTO reservationData)
        {
            string updateStatus = @"UPDATE Reservation SET status_id = 3 WHERE reservation_id = @reservationID";
            try
            {
                int reservationID = reservationData.ReservationID;
                int clientId = reservationData.ClientID;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand(updateStatus, conn))
                    {
                        cmd.Parameters.AddWithValue("@reservationID", reservationID);

                        conn.Open();
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {

                            return JsonConvert.SerializeObject(new { success = true });
                        }
                        else
                        {
                            return JsonConvert.SerializeObject(new { success = false, error = "Reservation not found." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, error = ex.Message });
            }
        }

        public object CancelReservation(ReservationDTO reservationData)
        {
            string updateStatus = @"UPDATE Reservation SET status_id = 7 WHERE reservation_id = @reservationID";

            try
            {
                int reservationID = reservationData.ReservationID;

                using (SqlConnection conn = new SqlConnection(connectionString))
                using (SqlCommand cmd = new SqlCommand(updateStatus, conn))
                {
                    cmd.Parameters.AddWithValue("@reservationID", reservationID);

                    conn.Open();
                    int rowsAffected = cmd.ExecuteNonQuery();

                    if (rowsAffected > 0)
                        return new { success = true };

                    return new { success = false, error = "Reservation not found." };
                }
            }
            catch (Exception ex)
            {
                return new { success = false, error = ex.Message };
            }
        }

        public bool SaveCoordinationMeeting(CoordinationMeetingDTO meeting)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    using (SqlTransaction transaction = conn.BeginTransaction())
                    {
                        try
                        {
                            string insertQuery = @"
                        INSERT INTO CoordinationMeetingDates 
                            (reservation_id, meeting_date, meeting_time, remarks, createdAt)
                        VALUES 
                            (@ReservationID, @MeetingDate, @MeetingTime, @Remarks, @CreatedAt)";

                            using (SqlCommand insertCmd = new SqlCommand(insertQuery, conn, transaction))
                            {
                                insertCmd.Parameters.AddWithValue("@ReservationID", meeting.ReservationID);
                                insertCmd.Parameters.AddWithValue("@MeetingDate", meeting.MeetingDate);
                                insertCmd.Parameters.AddWithValue("@MeetingTime", meeting.MeetingTime);
                                insertCmd.Parameters.AddWithValue("@Remarks", (object)meeting.Remarks ?? DBNull.Value);
                                insertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

                                int inserted = insertCmd.ExecuteNonQuery();
                                Console.WriteLine($"Inserted rows: {inserted}, ReservationID={meeting.ReservationID}");
                            }

                            string updateQuery = "UPDATE Reservation SET status_id = 5 WHERE reservation_id = @ReservationID";
                            using (SqlCommand updateCmd = new SqlCommand(updateQuery, conn, transaction))
                            {
                                updateCmd.Parameters.AddWithValue("@ReservationID", meeting.ReservationID);
                                int updated = updateCmd.ExecuteNonQuery();
                                Console.WriteLine($"Updated rows: {updated}");
                            }

                            transaction.Commit();
                            return true;
                        }
                        catch (Exception ex)
                        {
                            transaction.Rollback();
                            Console.WriteLine("Transaction failed: " + ex.Message);
                            return false;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error saving coordination meeting: " + ex.Message);
                return false;
            }
        }
        public string ApproveReservation(ReservationDTO reservationData)
        {
            string message = "";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // 1️⃣ Get the meeting date and time
                string checkMeetingDateTime = @"
            SELECT meeting_date, meeting_time 
            FROM CoordinationMeetingDates 
            WHERE reservation_id = @ReservationID";

                DateTime? meetingDateTime = null;

                using (SqlCommand checkCmd = new SqlCommand(checkMeetingDateTime, conn))
                {
                    checkCmd.Parameters.AddWithValue("@ReservationID", reservationData.ReservationID);
                    using (SqlDataReader reader = checkCmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            DateTime datePart = reader.GetDateTime(reader.GetOrdinal("meeting_date"));
                            TimeSpan timePart = reader.GetTimeSpan(reader.GetOrdinal("meeting_time"));
                            meetingDateTime = datePart.Date + timePart;
                        }
                        else
                        {
                            return "No meeting date/time found for this reservation.";
                        }
                    }
                }
                bool bypassMeetingCheck = true;
                // 2️⃣ Check if the meeting time has passed
                // TEMP: Bypassing meeting date/time check for development
                // if (meetingDateTime <= DateTime.Now)
                if (bypassMeetingCheck)
                {
                    // Begin transaction to ensure both updates happen together
                    using (SqlTransaction transaction = conn.BeginTransaction())
                    {
                        try
                        {
                            // Approve reservation
                            string updateReservation = @"UPDATE Reservation 
                                         SET status_id = 9 
                                         WHERE reservation_id = @ReservationID";

                            using (SqlCommand cmd = new SqlCommand(updateReservation, conn, transaction))
                            {
                                cmd.Parameters.AddWithValue("@ReservationID", reservationData.ReservationID);
                                cmd.ExecuteNonQuery();
                            }

                            // Mark meeting as done
                            string updateMeeting = @"UPDATE CoordinationMeetingDates
                                     SET is_done = 1
                                     WHERE reservation_id = @ReservationID";

                            using (SqlCommand cmd = new SqlCommand(updateMeeting, conn, transaction))
                            {
                                cmd.Parameters.AddWithValue("@ReservationID", reservationData.ReservationID);
                                cmd.ExecuteNonQuery();
                            }

                            transaction.Commit();
                            message = "Reservation Approved Successfully and meeting marked as done.";
                        }
                        catch
                        {
                            transaction.Rollback();
                            message = "Failed to approve reservation.";
                        }
                    }
                }
                else
                {
                    message = "Cannot approve yet. Meeting time has not passed.";
                }
            }

            return message;
        }


        public List<ReservationDTO> GetClientReservation(object clientData)
        {
            var data = clientData as Dictionary<string, object>;
            int clientID = Convert.ToInt32(data["clientID"]);

            var reservations = new List<ReservationDTO>();

            string reservationQuery = @"
        SELECT reservation_id, client_id, status_id, remarks, 
               event_id, hashed_reference
        FROM Reservation
        WHERE client_id = @ClientID;
    ";

            string eventQuery = @"
        SELECT title, description
        FROM Events
        WHERE event_id = @EventID;
    ";

            string statusQuery = @"
        SELECT status_name
        FROM reservation_status
        WHERE status_id = @StatusID;
    ";

            string eventDatesQuery = @"
        SELECT date, start_time, end_time
        FROM Reservation_Dates
        WHERE reservation_id = @ReservationID;
    ";


            string assetsQuery = @"
        SELECT 
            ra.asset_id,
            ra.asset_quantity,
            a.asset_name,
            a.category_id,
            c.category_name
        FROM AssetOnReservation ra
        INNER JOIN Assets a ON ra.asset_id = a.asset_id
        INNER JOIN AssetCategory c ON a.category_id = c.category_id
        WHERE ra.reservation_id = @ReservationID;
    ";
            string previousStatusQuery = @"SELECT previous_status_id FROM CancellationRequests WHERE client_id = @ClientID";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // ---- Load Basic Reservations ----
                using (SqlCommand cmd = new SqlCommand(reservationQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@ClientID", clientID);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            reservations.Add(new ReservationDTO
                            {
                                ReservationID = reader.GetInt32(reader.GetOrdinal("reservation_id")),
                                ClientID = reader.GetInt32(reader.GetOrdinal("client_id")),
                                StatusID = reader.GetInt32(reader.GetOrdinal("status_id")),
                                Remarks = reader["remarks"]?.ToString(),
                                EventID = reader.GetInt32(reader.GetOrdinal("event_id")),
                                Reference = reader["hashed_reference"]?.ToString(),

                                SelectedAssets = new List<AssetDTO>(),
                                EventDates = new List<EventDateDTO>()
                            });
                        }
                    }
                }

                // ---- Load Related Data for Each Reservation ----
                foreach(var reservation in reservations)
{
                    // ---- Load Event Info ----
                    using (SqlCommand eventCmd = new SqlCommand(eventQuery, conn))
                    {
                        eventCmd.Parameters.AddWithValue("@EventID", reservation.EventID);

                        using (SqlDataReader er = eventCmd.ExecuteReader())
                        {
                            if (er.Read())
                            {
                                reservation.EventName = er["title"]?.ToString();
                                reservation.EventDescription = er["description"]?.ToString();
                            }
                        }
                    }

                    // ---- Load Status Name ----
                    using (SqlCommand statusCmd = new SqlCommand(statusQuery, conn))
                    {
                        statusCmd.Parameters.AddWithValue("@StatusID", reservation.StatusID);
                        reservation.StatusName = statusCmd.ExecuteScalar()?.ToString() ?? "Unknown";
                    }

                    // ---- Load Previous Status if StatusID == 8 ----
                    if (reservation.StatusID == 8)
                    {
                        using (SqlCommand prevStatusCmd = new SqlCommand(previousStatusQuery, conn))
                        {
                            prevStatusCmd.Parameters.AddWithValue("@ClientID", clientID);

                            object result = prevStatusCmd.ExecuteScalar();
                            if (result != null && result != DBNull.Value)
                            {
                                reservation.PreviousStatusID = Convert.ToInt32(result);

                                // ---- Get Previous Status Name using same statusQuery ----
                                using (SqlCommand prevStatusNameCmd = new SqlCommand(statusQuery, conn))
                                {
                                    prevStatusNameCmd.Parameters.AddWithValue("@StatusID", reservation.PreviousStatusID);
                                    reservation.PreviousStatusName = prevStatusNameCmd.ExecuteScalar()?.ToString() ?? "Unknown";
                                }
                            }
                        }
                    }

                    // ---- Load Event Dates ----
                    using (SqlCommand dateCmd = new SqlCommand(eventDatesQuery, conn))
                    {
                        dateCmd.Parameters.AddWithValue("@ReservationID", reservation.ReservationID);

                        using (SqlDataReader dr = dateCmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                reservation.EventDates.Add(new EventDateDTO
                                {
                                    Date = Convert.ToDateTime(dr["date"]),
                                    StartTime = TimeSpan.Parse(dr["start_time"].ToString()).ToString(@"hh\:mm"),
                                    EndTime = TimeSpan.Parse(dr["end_time"].ToString()).ToString(@"hh\:mm")
                                });
                            }
                        }
                    }

                    // ---- Load Selected Assets ----
                    using (SqlCommand assetCmd = new SqlCommand(assetsQuery, conn))
                    {
                        assetCmd.Parameters.AddWithValue("@ReservationID", reservation.ReservationID);

                        using (SqlDataReader ar = assetCmd.ExecuteReader())
                        {
                            while (ar.Read())
                            {
                                reservation.SelectedAssets.Add(new AssetDTO
                                {
                                    AssetId = ar.GetInt32(ar.GetOrdinal("asset_id")),
                                    AssetName = ar["asset_name"]?.ToString(),
                                    Quantity = Convert.ToInt32(ar["asset_quantity"]),
                                    CategoryID = ar.GetInt32(ar.GetOrdinal("category_id")),
                                    CategoryName = ar["category_name"]?.ToString()
                                });
                            }
                        }
                    }
                }

            }

            return reservations;
        }
        public string RequestCancellation(ReservationDTO reservationData)
        {
            string message = "";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // 1️⃣ Update reservation status (sent request)
                string updateQuery = @"UPDATE Reservation
                               SET status_id = 8
                               WHERE reservation_id = @ReservationID";

                // 2️⃣ Insert into cancellation requests table
                string insertQuery = @"INSERT INTO CancellationRequests (reservation_id, client_id, reason, previous_status_id)
                               VALUES (@ReservationID, @ClientID, @Reason, @StatusID)";

                // Run update
                using (SqlCommand cmd = new SqlCommand(updateQuery, conn))
                {
                    cmd.Parameters.Add("@ReservationID", SqlDbType.Int).Value = reservationData.ReservationID;
                    int rowsAffected = cmd.ExecuteNonQuery();

                    if (rowsAffected == 0)
                        return "No matching reservation found.";
                }

                // Run insert
                using (SqlCommand cmd = new SqlCommand(insertQuery, conn))
                {
                    cmd.Parameters.Add("@ReservationID", SqlDbType.Int).Value = reservationData.ReservationID;
                    cmd.Parameters.Add("@ClientID", SqlDbType.Int).Value = reservationData.ClientID;
                    cmd.Parameters.Add("@Reason", SqlDbType.NVarChar).Value = reservationData.Reason;
                    cmd.Parameters.Add("@StatusID", SqlDbType.Int).Value = reservationData.StatusID;

                    cmd.ExecuteNonQuery();
                }

                message = "Cancellation request has been sent.";
            }

            return message;
        }
        public string UndoCancellation(ReservationDTO reservationData)
        {
            string message = "";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                SqlTransaction transaction = conn.BeginTransaction();

                try
                {
                    // 1️⃣ Update back to previous status
                    string UpdateStatus = @"
                UPDATE Reservation 
                SET status_id = @PreviousStatusID 
                WHERE reservation_id = @ReservationID";

                    using (SqlCommand cmd = new SqlCommand(UpdateStatus, conn, transaction))
                    {
                        cmd.Parameters.AddWithValue("@PreviousStatusID", reservationData.PreviousStatusID);
                        cmd.Parameters.AddWithValue("@ReservationID", reservationData.ReservationID);
                        cmd.ExecuteNonQuery();
                    }

                    // 2️⃣ Delete the cancellation request for this reservation
                    string DeleteCancelRequest = @"
                DELETE FROM CancellationRequests 
                WHERE reservation_id = @ReservationID";

                    using (SqlCommand cmd2 = new SqlCommand(DeleteCancelRequest, conn, transaction))
                    {
                        cmd2.Parameters.AddWithValue("@ReservationID", reservationData.ReservationID);
                        cmd2.ExecuteNonQuery();
                    }

                    // Commit both actions
                    transaction.Commit();
                    message = "Cancellation request undone successfully.";
                }
                catch (Exception ex)
                {
                    // Rollback if anything fails
                    transaction.Rollback();
                    message = $"Error undoing cancellation: {ex.Message}";
                }
            }

            return message;
        }


        //Event Management ========================================================================================================================
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
