namespace MCCSC_Scheduler
{
    public class CategoryDTO
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
        public int? ParentCategoryID { get; set; }
        public bool IsActive { get; set; }
    }
}