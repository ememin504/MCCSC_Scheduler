using MCCSC_Scheduler.Model;
using MCCSC_Scheduler.DTO;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Runtime.InteropServices;
using System.Security;

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


    }
}