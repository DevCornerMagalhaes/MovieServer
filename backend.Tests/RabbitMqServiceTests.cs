using MovieServerReact.Backend.Services;
using Xunit;

namespace MovieServerReact.Backend.Tests
{
    public class RabbitMqServiceTests
    {
        [Fact]
        public void SendMessage_DoesNotThrow()
        {
            var service = new RabbitMqService();
            var ex = Record.Exception(() => service.SendMessage("Test message"));
            Assert.Null(ex);
        }
    }
}
