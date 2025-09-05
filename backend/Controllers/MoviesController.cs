using Microsoft.AspNetCore.Mvc;
using MovieServerReact.Backend.Services;
using MovieServerReact.Backend.Models;
using System.Collections.Generic;

namespace MovieServerReact.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly MovieService _movieService;

        public MoviesController(MovieService movieService)
        {
            _movieService = movieService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Movie>> GetMovies()
        {
            var movies = _movieService.GetMovies();
            return Ok(movies);
        }
    }
}
