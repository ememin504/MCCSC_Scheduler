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
            
            return otpCode;
        }
        public bool VerifyOtp(UserDTO userDTO)
        {
            string query = "SELECT COUNT(*) FROM MCCSC_SchedulerDB.dbo.UserOTP WHERE user_id = @UserID";

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    using (SqlCommand command = new SqlCommand(query, conn))
                    {
                        command.Parameters.AddWithValue("@UserID", userDTO.UserID);
                        Console.WriteLine("UserID: " + userDTO.UserID);  // Debugging line
                        int count = (int)command.ExecuteScalar();  // ✅ use command, not cmd
                        return count > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in VerifyOtp: " + ex.Message, ex);
            }
        }


    }
}