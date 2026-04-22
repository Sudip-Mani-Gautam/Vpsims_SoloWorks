# VPSIMS - Backend API

Vehicle Parts Selling & Inventory Management System (VPSIMS) Backend.

## Tech Stack
- **Framework**: .NET 8.0
- **Database**: PostgreSQL (Entity Framework Core)
- **Authentication**: JWT Bearer
- **Background Jobs**: Hangfire
- **PDF Generation**: QuestPDF

## Setup
1. Clone the repository.
2. Create a `.env` file based on [.env.example](.env.example).
3. Update [appsettings.json](appsettings.json) with your environment variables.
4. Run migrations: `dotnet ef database update`.
5. Run the application: `dotnet run`.

## API Documentation
Once the application is running, you can access Swagger UI at:
`http://localhost:5164/swagger`
