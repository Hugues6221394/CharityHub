using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentCharityHub.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdatedAtToStudents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // UpdatedAt already exists in Students table from InitialCreate migration
            // Only add UpdatedAt to ProgressReports if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns 
                              WHERE object_id = OBJECT_ID(N'[ProgressReports]') 
                              AND name = 'UpdatedAt')
                BEGIN
                    ALTER TABLE [ProgressReports] ADD [UpdatedAt] datetime2 NULL;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Only drop UpdatedAt from ProgressReports if it exists
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns 
                          WHERE object_id = OBJECT_ID(N'[ProgressReports]') 
                          AND name = 'UpdatedAt')
                BEGIN
                    ALTER TABLE [ProgressReports] DROP COLUMN [UpdatedAt];
                END
            ");
            // Don't drop UpdatedAt from Students as it was created in InitialCreate
        }
    }
}
