namespace MovieServerReact.Backend.Models
{
    public class Movie
    {
        public int Id { get; set; }
        public required string FileName { get; set; }
        public required string FilePath { get; set; }
        public long Size { get; set; }
    }
}
