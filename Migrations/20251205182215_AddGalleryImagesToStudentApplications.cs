using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentCharityHub.Migrations
{
    /// <inheritdoc />
    public partial class AddGalleryImagesToStudentApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GalleryImages",
                table: "StudentApplications",
                type: "nvarchar(max)",
                maxLength: 5000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GalleryImages",
                table: "StudentApplications");
        }
    }
}
