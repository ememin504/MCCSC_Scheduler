using System.Collections.Generic;

namespace MCCSC_Scheduler.DTO
{
    public class PackageDTO
    {
        public int PackageID { get; set; }
        public string PackageName { get; set; }
        public int ConsecutiveDaysAllowed { get; set; }
        public int DaysPrior {  get; set; }
        public bool IsActive { get; set; }

        public List<ItemsDTO> ItemIncluded { get; set; }
    }
}
