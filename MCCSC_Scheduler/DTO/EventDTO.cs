using System;

namespace MCCSC_Scheduler
{
    public class EventDTO
    {
        public int EventID { get; set; }
        public string EventTitle { get; set; }
        public string Description { get; set; }
        public int? OrganizationID { get; set; }  
        public string OrganizationName { get; set; }
        public bool IsPrioritized { get; set; }
        public bool IsRecurring { get; set; }
        public string OrganizationType { get; set; } 

    }
}