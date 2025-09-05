using MovieServerReact.Backend.Models;
using System.Collections.Generic;
using System.IO;

namespace MovieServerReact.Backend.Services
{
    public class MovieService
    {
        private readonly string _movieFolder;

        public MovieService(string movieFolder)
        {
            _movieFolder = movieFolder;
        }

        public IEnumerable<Movie> GetMovies()
        {
            if (!Directory.Exists(_movieFolder))
                yield break;

            var files = Directory.GetFiles(_movieFolder);
            var id = 1;
            foreach (var file in files)
            {
                var info = new FileInfo(file);
                yield return new Movie
                {
                    Id = id++,
                    FileName = info.Name,
                    FilePath = info.FullName,
                    Size = info.Length
                };
            }
        }
    }
}
