using Microsoft.AspNetCore.Mvc;
using MovieServerReact.Backend.Services;
using System.IO;

namespace MovieServerReact.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StreamController : ControllerBase
    {
        private readonly MovieService _movieService;

        public StreamController(MovieService movieService)
        {
            _movieService = movieService;
        }

        [HttpGet("{id:int}")]
        public IActionResult StreamMovieById(int id)
        {
            var movies = _movieService.GetMovies().ToList();
            var movie = movies.FirstOrDefault(m => m.Id == id);
            
            if (movie == null)
                return NotFound("Movie not found");

            if (!System.IO.File.Exists(movie.FilePath))
                return NotFound("Movie file not found");

            var stream = new FileStream(movie.FilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            var contentType = GetContentType(movie.FileName);
            return File(stream, contentType, enableRangeProcessing: true);
        }

        [HttpGet("{fileName}")]
        public IActionResult StreamMovieByName(string fileName)
        {
            var movieFolder = Environment.GetEnvironmentVariable("MOVIE_FOLDER") ?? "H:/Fliding with coding/MovieServerReact/movies";
            var filePath = Path.Combine(movieFolder, fileName);
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            var contentType = GetContentType(fileName);
            return File(stream, contentType, enableRangeProcessing: true);
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".mp4" => "video/mp4",
                ".webm" => "video/webm",
                ".mkv" => "video/x-matroska",
                ".avi" => "video/x-msvideo",
                ".mov" => "video/quicktime",
                ".wmv" => "video/x-ms-wmv",
                _ => "video/mp4"
            };
        }
    }
}
