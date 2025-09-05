using MovieServerReact.Backend.Services;
using Xunit;

namespace MovieServerReact.Backend.Tests
{
    public class AuthServiceTests
    {
        [Fact]
        public void ValidateUser_ReturnsTrue_ForValidCredentials()
        {
            var service = new AuthService();
            var result = service.ValidateUser("admin", "password123");
            Assert.True(result);
        }

        [Fact]
        public void ValidateUser_ReturnsFalse_ForInvalidCredentials()
        {
            var service = new AuthService();
            var result = service.ValidateUser("admin", "wrongpassword");
            Assert.False(result);
        }
    }
}
