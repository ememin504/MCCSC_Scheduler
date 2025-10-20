using System;

namespace MCCSC_Scheduler.DTO
{
    //DTO = Data Transfer Object
    //it is a simple object that is used to transfer data from UI to server
    public class EventDateDTO
    {
        public DateTime Date { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
    }

}