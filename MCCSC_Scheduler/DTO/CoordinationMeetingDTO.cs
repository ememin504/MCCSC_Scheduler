using System;

namespace MCCSC_Scheduler
{
    public class CoordinationMeetingDTO
    {
        public int MeetingID { get; set; }
        public int ReservationID { get; set; }
        public DateTime MeetingDate { get; set; }
        public TimeSpan MeetingTime { get; set; }
        public string Remarks { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
