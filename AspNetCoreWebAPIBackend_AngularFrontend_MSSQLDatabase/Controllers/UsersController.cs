using AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.Controllers
{
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private bool ValidateToken(out IActionResult errorResult)
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null || !authHeader.StartsWith("Bearer "))
            {
                errorResult = Unauthorized(new { message = "Missing or invalid token" });
                return false;
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);
            }
            catch
            {
                errorResult = Unauthorized(new { message = "Invalid token" });
                return false;
            }

            errorResult = null!;
            return true;
        }

        [HttpPost]
        [Route("api/user")]
        public IActionResult user([FromBody] UserRequestDto userDto)
        {
            if (!ValidateToken(out var errorResult))
                return errorResult;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var newUser = new user
            {
                name = userDto.name,
                email = userDto.email
            };
            _context.users.Add(newUser);
            _context.SaveChanges();
            return Ok(new { message = "User created successfully" });
        }

        [HttpGet]
        [Route("api/user/{id}")]
        public IActionResult Edit(int id)
        {
            if (!ValidateToken(out var errorResult))
                return errorResult;

            var user = _context.users.Find(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        [HttpPut]
        [Route("api/user/{id}")]
        public IActionResult Update(int id, [FromBody] UserRequestDto updatedUser)
        {
            if (!ValidateToken(out var errorResult))
                return errorResult;

            var user = _context.users.Find(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            user.name = updatedUser.name;
            user.email = updatedUser.email;
            _context.SaveChanges();

            return Ok(new { message = "User updated successfully" });
        }

        [HttpDelete]
        [Route("api/user/{id}")]
        public IActionResult Delete(int id)
        {
            if (!ValidateToken(out var errorResult))
                return errorResult;

            var user = _context.users.Find(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            _context.users.Remove(user);
            _context.SaveChanges();

            return Ok(new { message = "User deleted successfully" });
        }

        [HttpGet]
        [Route("api/user")]
        public IActionResult GetAll()
        {
            if (!ValidateToken(out var errorResult))
                return errorResult;

            var users = _context.users.ToList();
            return Ok(users);
        }
    }
}
