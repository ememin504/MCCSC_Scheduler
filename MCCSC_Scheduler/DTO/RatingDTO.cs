using System.Collections.Generic;

namespace MCCSC_Scheduler.DTO
{
    public class RatingDTO
    {
        public int RatingID { get; set; }
        public int ClientID { get; set; }   
        public int ReservationID { get; set; }
        public int OrganizationID { get; set; }
        public string OrganizationName { get; set; }
        public int NumberOfStars { get; set; }
        public string Feedback { get; set; }
    }
}
