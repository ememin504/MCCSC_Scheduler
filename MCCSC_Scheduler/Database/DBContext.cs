using MCCSC_Scheduler.Model;
using MCCSC_Scheduler.DTO;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Runtime.InteropServices;
using System.Security;
using System.Web.UI.WebControls;
using System.Runtime.Remoting.Messaging;

namespace MCCSC_Scheduler.Database
{
    public class DBContext
    {
        private SqlConnection conn;         //SQL Server DB connection object
        private string connectionString;

        //default constructor
        public DBContext() 
        {
            conn = null;    
        }
        //overloaded/parameterized constructor
        public DBContext(string dbServerName, string userID, string password, string dbName)
        {
            //setup connection string
            //Data Source=.\\SQLEXPRESS;Initial Catalog=xxxxxxx;Integrated Security=True;User ID=xxxxx;Password=yyyyyy (SQL Server Authentication)
            connectionString = "Data Source=" + dbServerName + ";Initial Catalog=" + dbName + ";Integrated Security=True;User ID=" + userID + ";Password=" + password;
        }

        //overloaded/parameterized constructor
        public DBContext(string dbServerName, string dbName)
        {
            //setup connection string
            //Data Source=.\\SQLEXPRESS;Initial Catalog=xxxxxxx;Integrated Security=True; (Windows Authentication)
            connectionString = "Data Source=" + dbServerName + ";Initial Catalog=" + dbName +";Integrated Security=True;";

        }
        //DB connection
        public bool ConnectDB()
        {
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string is not initialized.");
            }

            conn = new SqlConnection(connectionString);
            try
            {
                conn.Open();
                return (conn != null);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public bool AuthenticateUser(UserDTO userDTO)
        {
            try
            {
                /*if (conn == null || conn.State != System.Data.ConnectionState.Open)
                    throw new InvalidOperationException("Database connection is not established.");
                }*/

                string query = "SELECT COUNT(*) FROM Users WHERE username = @UserName AND hashed_password = @Password";

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserName", userDTO.UserName);
                        cmd.Parameters.AddWithValue("@Password", userDTO.Password);

                        int count = (int)cmd.ExecuteScalar();
                        return count > 0;
                    }
                }

            }
            catch (Exception ex)
            {
                throw new Exception("Error in AuthenticateUser: " + ex.Message, ex);
            }
        }
        public (string role, UserDTO user) GetUserInfo(UserDTO userDTO)
        {
            try
            {
                string query = "SELECT user_id, username, role_id FROM Users WHERE username = @UserName";
                string roleQuery = "SELECT role_description FROM Roles WHERE role_id = @role_id";

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // First, get user record
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserName", userDTO.UserName);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                int role_id = reader.GetInt32(reader.GetOrdinal("role_id"));

                                // Construct user object
                                UserDTO user = new UserDTO
                                {
                                    UserID = reader.GetInt32(reader.GetOrdinal("user_id")),
                                    UserName = reader.GetString(reader.GetOrdinal("username")),
                                    RoleID = role_id
                                };
                                
                                reader.Close();

                                // Now get role_description
                                using (SqlCommand roleCmd = new SqlCommand(roleQuery, conn))
                                {
                                    roleCmd.Parameters.AddWithValue("@role_id", role_id);

                                    object roleResult = roleCmd.ExecuteScalar();
                                    if (roleResult != null)
                                    {
                                        return (roleResult.ToString(), user);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetUserInfo: " + ex.Message, ex);
            }

            return (string.Empty, null);
        }

        public string GenerateOTP(int userID)
        {
            Random rnd = new Random();
            // Generate a random 6-digit OTP
            string otpCode = rnd.Next(100000, 999999).ToString();

            // Capture the return value of StoreOtp
            string storeResult = StoreOtp(userID, otpCode);

            // You now have both the OTP and the store status
            return $"Generated OTP: {otpCode}, Store Result: {storeResult}";
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