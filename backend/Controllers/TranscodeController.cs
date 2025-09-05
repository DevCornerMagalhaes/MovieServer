using Microsoft.AspNetCore.Mvc;
using MovieServerReact.Backend.Services;

namespace MovieServerReact.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TranscodeController : ControllerBase
    {
        private readonly MovieService _movieService;
        private readonly HttpClient _httpClient;
        private readonly string _transcodingServiceUrl;

        public TranscodeController(MovieService movieService, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _movieService = movieService;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.Timeout = TimeSpan.FromHours(3); // Long timeout for transcoding
            
            // Use Docker service name in production, localhost in development
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var dockerEnv = Environment.GetEnvironmentVariable("DOCKER_ENV");
            _transcodingServiceUrl = environment == "Development" && !string.Equals(dockerEnv, "true", StringComparison.OrdinalIgnoreCase)
                ? "http://localhost:5001"  // Local development
                : "http://transcoding:5001";  // Docker environment
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> StreamMovieWithTranscoding(int id)
        {
            try
            {
                var movies = _movieService.GetMovies().ToList();
                var movie = movies.FirstOrDefault(m => m.Id == id);

                if (movie == null || !System.IO.File.Exists(movie.FilePath))
                {
                    return NotFound("Movie not found");
                }

                // Forward the request to the Node.js transcoding service
                var encodedFilePath = Uri.EscapeDataString(movie.FilePath);
                var transcodingUrl = $"{_transcodingServiceUrl}/transcode/{id}?filePath={encodedFilePath}";
                
                // Check if transcoding service is available
                try
                {
                    var healthResponse = await _httpClient.GetAsync($"{_transcodingServiceUrl}/health");
                    if (!healthResponse.IsSuccessStatusCode)
                    {
                        return StatusCode(503, "Transcoding service unavailable. Please ensure Node.js transcoding service is running on port 5001.");
                    }
                }
                catch
                {
                    return StatusCode(503, "Transcoding service unavailable. Please start the Node.js transcoding service: 'node transcoding-service.js'");
                }

                // Forward range headers if present
                if (Request.Headers.ContainsKey("Range"))
                {
                    _httpClient.DefaultRequestHeaders.Add("Range", Request.Headers["Range"].ToString());
                }

                // Stream from transcoding service
                using var response = await _httpClient.GetAsync(transcodingUrl, HttpCompletionOption.ResponseHeadersRead);
                
                // If the transcoding service redirects to direct stream, follow it
                if (response.StatusCode == System.Net.HttpStatusCode.Redirect)
                {
                    var redirectLocation = response.Headers.Location?.ToString();
                    if (redirectLocation != null && redirectLocation.Contains("/api/stream/"))
                    {
                        // Extract movie ID and redirect to our stream controller
                        return Redirect($"/api/stream/{id}");
                    }
                }

                // Copy headers from transcoding service
                Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "video/mp4";
                
                if (response.Headers.Contains("Accept-Ranges"))
                {
                    Response.Headers.Append("Accept-Ranges", string.Join(", ", response.Headers.GetValues("Accept-Ranges")));
                }
                
                Response.Headers.Append("Access-Control-Allow-Origin", "*");
                Response.Headers.Append("Access-Control-Allow-Headers", "Range");

                // Stream the response
                using var stream = await response.Content.ReadAsStreamAsync();
                await stream.CopyToAsync(Response.Body);

                return new EmptyResult();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error streaming movie: {ex.Message}");
            }
        }

        [HttpGet("analyze/{id}")]
        public async Task<IActionResult> AnalyzeMovie(int id)
        {
            try
            {
                var movies = _movieService.GetMovies().ToList();
                var movie = movies.FirstOrDefault(m => m.Id == id);

                if (movie == null || !System.IO.File.Exists(movie.FilePath))
                {
                    return NotFound("Movie not found");
                }

                // Forward to Node.js analysis service
                var encodedFilePath = Uri.EscapeDataString(movie.FilePath);
                var analysisUrl = $"{_transcodingServiceUrl}/analyze/{id}?filePath={encodedFilePath}";
                
                var response = await _httpClient.GetStringAsync(analysisUrl);
                return Content(response, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error analyzing movie: {ex.Message}");
            }
        }
        [HttpGet("info/{id}")]
        public async Task<IActionResult> GetMovieInfo(int id)
        {
            // Redirect to the new analyze endpoint
            return await AnalyzeMovie(id);
        }
    }
}
