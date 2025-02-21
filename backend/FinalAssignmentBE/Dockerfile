FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 4444

# User SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["FinalAssignmentBE/FinalAssignmentBE.csproj", "FinalAssignmentBE/"]
RUN dotnet restore "FinalAssignmentBE/FinalAssignmentBE.csproj"
COPY . . 
WORKDIR "/src/FinalAssignmentBE"
RUN dotnet build "FinalAssignmentBE.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "FinalAssignmentBE.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FinalAssignmentBE.dll"]
