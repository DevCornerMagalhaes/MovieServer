using RabbitMQ.Client;
using System.Text;

namespace MovieServerReact.Backend.Services
{
    public class RabbitMqService
    {
        private readonly string _hostName;
        private readonly string _userName;
        private readonly string _password;
        private readonly string _queueName = "movieserver_events";

        public RabbitMqService()
        {
            // Load RabbitMQ configuration from environment variables
            _hostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
            _userName = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest";
            _password = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest";
            
            Console.WriteLine($"🐰 Configuring RabbitMQ: Host={_hostName}, User={_userName}");
        }

        public void SendMessage(string message)
        {
            try
            {
                var factory = new ConnectionFactory() 
                { 
                    HostName = _hostName,
                    UserName = _userName,
                    Password = _password
                };
                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();
                channel.QueueDeclare(queue: _queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
                var body = Encoding.UTF8.GetBytes(message);
                channel.BasicPublish(exchange: "", routingKey: _queueName, basicProperties: null, body: body);
                Console.WriteLine($"📨 RabbitMQ message sent: {message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ RabbitMQ connection failed: {ex.Message}");
                Console.WriteLine($"🔧 Check RabbitMQ credentials: Host={_hostName}, User={_userName}");
                throw;
            }
        }
    }
}
