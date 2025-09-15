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
                {
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
        public string GetUserRole(UserDTO userDTO)
        {
            try
            {
                string query = "SELECT role_id FROM Users WHERE username = @UserName";
                string roleQuery = "SELECT role_description FROM Roles WHERE role_id = @role_id";

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // First, get role_id
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserName", userDTO.UserName);

                        object roleIdObj = cmd.ExecuteScalar();
                        if (roleIdObj != null && int.TryParse(roleIdObj.ToString(), out int role_id))
                        {
                            // Now, get role_description based on role_id
                            using (SqlCommand roleCmd = new SqlCommand(roleQuery, conn))
                            {
                                roleCmd.Parameters.AddWithValue("@role_id", role_id);

                                object roleResult = roleCmd.ExecuteScalar();
                                if (roleResult != null)
                                {
                                    return roleResult.ToString();
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetUserRole: " + ex.Message, ex);
            }

            return string.Empty; // return empty if no role found
        }


    }
}