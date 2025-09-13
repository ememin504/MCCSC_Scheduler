using MCCSC_Scheduler.Model;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
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
            connectionString = "Data Source=" + dbServerName + ";Initial Catalog=" + dbName + ";Integrated Security=True;";
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
    }
}