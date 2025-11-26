using System.ComponentModel.DataAnnotations;

namespace AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.Models
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, ErrorMessage = "Username must be less than 50 characters")]
        public string? username { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(50, ErrorMessage = "Password must be less than 50 characters")]
        public string? password { get; set; }
    }
}