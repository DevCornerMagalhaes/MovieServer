using MovieServerReact.Backend.Models;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace MovieServerReact.Backend.Services
{
    public class AuthService
    {
        private readonly List<User> _users = new();

        public AuthService()
        {
            // Load credentials from environment variables
            var adminUsername = Environment.GetEnvironmentVariable("APP_ADMIN_USERNAME") ?? "admin";
            var adminPassword = Environment.GetEnvironmentVariable("APP_ADMIN_PASSWORD") ?? "password";
            
            Console.WriteLine($"🔐 Configuring admin user: {adminUsername}");
            
            // Add the admin user with credentials from environment
            _users.Add(new User { Username = adminUsername, PasswordHash = HashPassword(adminPassword) });
        }

        public bool ValidateUser(string username, string password)
        {
            var user = _users.Find(u => u.Username == username);
            if (user == null) 
            {
                Console.WriteLine($"❌ User not found: {username}");
                return false;
            }
            
            var hashedPassword = HashPassword(password);
            var isValid = user.PasswordHash == hashedPassword;
            Console.WriteLine($"🔑 Login attempt for {username}: {(isValid ? "SUCCESS" : "FAILED")}");
            return isValid;
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
