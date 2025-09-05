using Microsoft.AspNetCore.Mvc;
using MovieServerReact.Backend.Services;

namespace MovieServerReact.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly RabbitMqService _rabbitMqService;

        public EventsController(RabbitMqService rabbitMqService)
        {
            _rabbitMqService = rabbitMqService;
        }

        [HttpPost]
        public IActionResult SendEvent([FromBody] EventRequest request)
        {
            _rabbitMqService.SendMessage(request.Message);
            return Ok(new { message = "Event sent" });
        }
    }

    public class EventRequest
    {
        public required string Message { get; set; }
    }
}
