using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentCharityHub.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdatedAtToProgressReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check if column already exists before adding (in case it was added manually or in a previous failed migration)
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
            // Check if column exists before dropping
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns 
                          WHERE object_id = OBJECT_ID(N'[ProgressReports]') 
                          AND name = 'UpdatedAt')
                BEGIN
                    ALTER TABLE [ProgressReports] DROP COLUMN [UpdatedAt];
                END
            ");
        }
    }
}
