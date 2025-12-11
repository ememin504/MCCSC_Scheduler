using System.Collections.Generic;
using MCCSC_Scheduler;
using MCCSC_Scheduler.DTO;

public class ReservationDTO
{
    public int ReservationID { get; set; }
    public string ReservationType { get; set; }
    public string EventDescription { get; set; }
    public string EventName { get; set; }
    public int ClientID { get; set; }
    public int PackageID { get; set; }
    public string PackageName { get; set; }
    public int StatusID { get; set; }
    public string StatusName { get; set; }
    public int OrganizationID { get; set; }
    public string Remarks { get; set; }
    public string Reason { get; set; }
    public int PreviousStatusID { get; set; }
    public string PreviousStatusName { get; set; }
    public List<AssetDTO> SelectedAssets { get; set; }
    public List<EventDateDTO> EventDates { get; set; }
    public List<CoordinationMeetingDTO> Meetings { get; set; }
    public UserDTO Client { get; set; }
    public int EventID { get; set; }
    public string Reference { get; set; }
}
