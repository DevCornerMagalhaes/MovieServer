namespace MovieServerReact.Backend.Models
{
    public class User
    {
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }
    }
}
