using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using MCCSC_Scheduler.DTO;
using MCCSC_Scheduler.Model;
using MCCSC_Scheduler.ViewModel;
using System.Web.Script.Serialization;



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
            return userDTO.ToString();
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
    }
}