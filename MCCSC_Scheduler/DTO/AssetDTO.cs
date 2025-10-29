namespace MCCSC_Scheduler
{
    public class AssetDTO
    {
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public int Quantity { get; set; }
        public bool IsActive { get; set; }
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
    }
}