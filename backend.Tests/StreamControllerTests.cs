using MovieServerReact.Backend.Controllers;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using System.IO;

namespace MovieServerReact.Backend.Tests
{
    public class StreamControllerTests
    {
        [Fact]
        public async void StreamMovie_ReturnsNotFound_WhenFileDoesNotExist()
        {
            var controller = new StreamController();
            var result = await controller.StreamMovie("nonexistent.mp4");
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async void StreamMovie_ReturnsFileResult_WhenFileExists()
        {
            var movieFolder = "H:/Fliding with coding/MovieServerReact/movies";
            Directory.CreateDirectory(movieFolder);
            var filePath = Path.Combine(movieFolder, "test.mp4");
            await File.WriteAllTextAsync(filePath, "dummy");
            var controller = new StreamController();
            var result = await controller.StreamMovie("test.mp4");
            var fileResult = Assert.IsType<FileStreamResult>(result);
            // Dispose the stream before deleting the file
            fileResult.FileStream.Dispose();
            File.Delete(filePath);
        }
    }
}
