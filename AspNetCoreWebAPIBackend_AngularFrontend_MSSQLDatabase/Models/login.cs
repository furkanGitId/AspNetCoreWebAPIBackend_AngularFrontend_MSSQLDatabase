using System.ComponentModel.DataAnnotations;

namespace AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.Models
{
    public class login
    {
        [Key]
        public int id { get; set; }
        public string? username { get; set; }
        public string? password { get; set; }
    }
}
