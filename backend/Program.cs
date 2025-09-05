using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient(); // Add HttpClient for transcoding service communication

// Configure HTTPS redirection for Docker environment
if (builder.Environment.IsProduction())
{
    builder.Services.AddHttpsRedirection(options =>
    {
        options.RedirectStatusCode = StatusCodes.Status301MovedPermanently;
        options.HttpsPort = null; // Disable HTTPS redirection in Docker
    });
}

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://frontend:80")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure movie folder path - use environment variable or fallback to local development path
var movieFolder = Environment.GetEnvironmentVariable("MOVIE_FOLDER") ?? "H:/Fliding with coding/MovieServerReact/movies";
builder.Services.AddSingleton(new MovieServerReact.Backend.Services.MovieService(movieFolder));
builder.Services.AddSingleton<MovieServerReact.Backend.Services.AuthService>();
builder.Services.AddSingleton<MovieServerReact.Backend.Services.RabbitMqService>();
// Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Movie Server API V1");
    c.RoutePrefix = "swagger";
});

// Use CORS
app.UseCors("AllowFrontend");

// Only use HTTPS redirection in development
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
