namespace MCCSC_Scheduler.DTO
{
    public class ItemsDTO
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; }
        public int PackageID { get; set; }
        public int QuantityAvailable { get; set; }
        public bool IsActive { get; set; }
    }
}
