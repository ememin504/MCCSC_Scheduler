using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Security;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.Services.Description;
using System.Web.UI;
using System.Web.UI.WebControls;
using MCCSC_Scheduler.Database;
using MCCSC_Scheduler.DTO;
using static System.Net.WebRequestMethods;

namespace MCCSC_Scheduler
{
    public partial class Default : System.Web.UI.Page
    {
        private static DBContext dbContext;
        protected void Page_Load(object sender, EventArgs e)
        {
            dbContext = new DBContext(".\\SQLEXPRESS", "MCCSC_SchedulerDB");
            ConnectDB();
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

        [WebMethod]
        [ScriptMethod(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public static string AuthenticationResult(UserDTO userDTO)
        {
            string message = "Unable to verify username and password!";
            try
            {
                if (dbContext.AuthenticateUser(userDTO))
                {
                    (string role, UserDTO user) userInfo = dbContext.GetUserInfo(userDTO);

                    if (!string.IsNullOrEmpty(userInfo.role) && userInfo.user != null)
                    {
                        int userID = userInfo.user.UserID;

                        // Get OTP message
                        //string otpMessage = "";
                        string otp = GenerateOTP(userID);

                        message = $"User Login Successful! ID: {userInfo.user.UserID}, Username: {userInfo.user.UserName}, Password: {userInfo.user.Password} Role: {userInfo.role}, Message: {otp}"; 
                        
                    }
                    else
                    {
                        message = "User Login Successful! (Role not found or user missing)";
                    }
                }
                else
                {
                    message = "Invalid Username or Password!";
                }
            }
            catch (Exception ex)
            {
                message = "Connection error: " + ex.Message;
            }

            return message;
        }
        [WebMethod]
        [ScriptMethod(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        
        public static string GenerateOTP(int userID)
        {
            string otp = dbContext.GenerateOTP(userID);
            string message = "OTP has been sent to your registered email address." + otp;
            
            return message;
        }
        [WebMethod]
        [ScriptMethod(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]

        public static string SubmitOtp(OtpDTO otpDto)
        {
            try
            {
                int result = dbContext.ValidateOTP(otpDto);

                if (result > 0)
                    return "OTP Verified Successfully";
                else
                    return "Invalid OTP, please try again.";
            }
            catch (Exception ex)
            {
                // return the real error to JS for debugging
                return "Error in SubmitOtp: " + ex.Message;
            }
        }
        
        public class UserInfoResponse
        {
            public int UserID { get; set; }
            public string UserName { get; set; }
            public int RoleID { get; set; }
            public string RoleDescription { get; set; }
        }

        [WebMethod]
        public static UserInfoResponse GetUserInfoWeb(UserDTO userDTO)
        {
            (string role, UserDTO user) userInfo = dbContext.GetUserInfo(userDTO);

            if (!string.IsNullOrEmpty(userInfo.role) && userInfo.user != null)
            {
                return new UserInfoResponse
                {
                    UserID = userInfo.user.UserID,
                    UserName = userInfo.user.UserName,
                    RoleID = userInfo.user.RoleID,
                    RoleDescription = userInfo.role
                };
            }
            return null;
        }
       
    }
}
