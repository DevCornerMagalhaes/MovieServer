FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Install FFmpeg in the base image
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY MovieServerReact.Backend.csproj .
RUN dotnet restore "MovieServerReact.Backend.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "MovieServerReact.Backend.csproj" -c Release -o /app/build
RUN dotnet publish "MovieServerReact.Backend.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Development
ENTRYPOINT ["dotnet", "MovieServerReact.Backend.dll"]
