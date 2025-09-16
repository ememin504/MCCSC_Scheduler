namespace MCCSC_Scheduler.DTO
{
    //DTO = Data Transfer Object
    //it is a simple object that is used to transfer data from UI to server
    public class UserDTO
    {
        public int UserID { get; set; }
        public string UserName { get; set; }
        public int RoleID { get; set; }
        public string Password { get; set; }
    }
}