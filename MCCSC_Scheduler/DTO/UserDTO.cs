namespace MCCSC_Scheduler.DTO
{
    public class UserDTO
    {
        public int RequestID { get; set; }
        public int UserID { get; set; }
        public string FirstName { get; set; }
        public string MiddleInitial { get; set; }
        public string LastName { get; set; }
        public int RoleID { get; set; }
        public int RoleTypeID { get; set; }
        public string RoleTypeDescription { get; set; }
        public int ClientID { get; set; }
        public int OrganizationID { get; set; }
        public bool Success { get; set; }
        public string RoleName { get; set; }
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string Organization { get; set; }
        public string UserName { get; set; }
        public string PassWord { get; set; }
        public override string ToString()
        {
            return $"UserID: {UserID}, Name: {FirstName} {MiddleInitial} {LastName}, " +
                   $"RoleID: {RoleID}, Email: {Email}, Organization: {Organization}, " +
                   $"Username: {UserName}, Password: {PassWord}";
        }
    }
}
