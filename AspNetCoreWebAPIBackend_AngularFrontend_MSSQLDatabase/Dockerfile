FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.csproj .
RUN dotnet restore

# Copy the remainder of the source and publish
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Configure ASP.NET Core to listen on port 8080 inside the container
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
EXPOSE 8080

ENTRYPOINT ["dotnet", "AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.dll"]

