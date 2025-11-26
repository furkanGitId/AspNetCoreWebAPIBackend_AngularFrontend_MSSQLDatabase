using Microsoft.EntityFrameworkCore;

namespace AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.Models
{
    public class ApplicationDbContext:DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<login> logins { get; set; }
        public DbSet<user> users { get; set; }
    }
}
