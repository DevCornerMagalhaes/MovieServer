using MovieServerReact.Backend.Services;
using MovieServerReact.Backend.Models;
using System.IO;
using Xunit;
using System.Linq;

namespace MovieServerReact.Backend.Tests
{
    public class MovieServiceTests
    {
        [Fact]
        public void GetMovies_ReturnsEmpty_WhenFolderDoesNotExist()
        {
            var service = new MovieService("nonexistent_folder");
            var movies = service.GetMovies().ToList();
            Assert.Empty(movies);
        }

        [Fact]
        public void GetMovies_ReturnsMovies_WhenFolderHasFiles()
        {
            var tempFolder = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            Directory.CreateDirectory(tempFolder);
            var filePath = Path.Combine(tempFolder, "test.mp4");
            File.WriteAllText(filePath, "dummy");
            var service = new MovieService(tempFolder);
            var movies = service.GetMovies().ToList();
            Assert.Single(movies);
            Assert.Equal("test.mp4", movies[0].FileName);
            Directory.Delete(tempFolder, true);
        }
    }
}
