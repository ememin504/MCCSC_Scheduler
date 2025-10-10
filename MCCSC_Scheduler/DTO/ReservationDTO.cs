using System;

namespace MCCSC_Scheduler.DTO
{
    public class ReservationDTO
    {
        public int ReservationID { get; set; }
        public int ClientID { get; set; }
        public string StatusID { get; set; }
        public string Remarks { get; set; }
        public string AssetID { get; set; }
        public int AssetQuantity { get; set; }
        public int EventID { get; set; }
        public string Reference { get; set; }
        public DateTime Date { get; set; }
        public DateTime startingTime { get; set; }
        public DateTime endingTime { get; set; }
    }
}
