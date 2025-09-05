using Microsoft.AspNetCore.Mvc;
using MovieServerReact.Backend.Services;
using MovieServerReact.Backend.Models;

namespace MovieServerReact.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }
            
            if (_authService.ValidateUser(request.Username, request.Password))
            {
                // For demo purposes, return a simple token (in production, use JWT)
                var token = GenerateSimpleToken(request.Username);
                return Ok(new { data = new { token = token }, message = "Login successful" });
            }
            
            return Unauthorized(new { message = "Invalid credentials" });
        }

        private string GenerateSimpleToken(string username)
        {
            // Simple token for demo - in production use JWT
            var tokenData = $"{username}:{DateTime.UtcNow.Ticks}";
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(tokenData));
        }
    }
}
