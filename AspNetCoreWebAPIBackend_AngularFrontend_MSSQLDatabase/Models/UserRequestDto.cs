using System.ComponentModel.DataAnnotations;

namespace AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.Models
{
    public class UserRequestDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(50, ErrorMessage = "Name must be less than 50 characters")]
        public string? name { get; set; }
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? email { get; set; }
    }
}
