using System;

namespace MCCSC_Scheduler.Model {
    public class Asset
    {
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public int Quantity { get; set; }
        public bool IsActive { get; set; }

    }

}