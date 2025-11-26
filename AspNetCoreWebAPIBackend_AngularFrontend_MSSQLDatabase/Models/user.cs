using System.ComponentModel.DataAnnotations;

namespace AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.Models
{
    public class user
    {
        [Key]
        public int id { get; set; }
        [Required]
        public string? name { get; set; }
        [Required]
        public string? email { get; set; }
    }
}
