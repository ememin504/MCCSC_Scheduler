using System;
using System.Collections.Generic;

public class NotificationDTO
{
    public int NotificationID { get; set; }
    public int UserID { get; set; }
    public int ClientID { get; set; }
    public int ReservationID { get; set; }
    public int StatusID { get; set; }
    public bool IsRead { get; set; }
    public bool IsRated { get; set; }
    public DateTime CreatedAt { get; set; }
    public string NoteFor { get; set; }
    public string ClientName { get; set; }
    public string PageType {  get; set; }

    // Newly added
    public int EventID { get; set; }
    public List<DateTime> ReservationDates { get; set; } = new List<DateTime>();
    public string EventName { get; set; }
}
