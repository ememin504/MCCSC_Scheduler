using System;
using System.Collections.Generic;
using MCCSC_Scheduler.DTO;
namespace MCCSC_Scheduler
{
    public class NotificationDTO
    {
        public int NotificationID { get; set; }
        public int UserID { get; set; }
        public int ReservationID { get; set; }
        public int StatusID { get; set; }
        public int ClientID { get; set; }
        public string ClientName { get; set; }
        public string StatusName { get; set; }
        public string StatusMessage { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string NoteFor { get; set; }
        public string PageType { get; set; }
    }

}
