using MovieServerReact.Backend.Controllers;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using MovieServerReact.Backend.Services;
using MovieServerReact.Backend.Models;

namespace MovieServerReact.Backend.Tests
{
    public class AuthControllerTests
    {
        [Fact]
        public void Login_ReturnsOk_ForValidCredentials()
        {
            var service = new AuthService();
            var controller = new AuthController(service);
            var result = controller.Login(new LoginRequest { Username = "admin", Password = "password123" });
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void Login_ReturnsUnauthorized_ForInvalidCredentials()
        {
            var service = new AuthService();
            var controller = new AuthController(service);
            var result = controller.Login(new LoginRequest { Username = "admin", Password = "wrongpassword" });
            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }
}
