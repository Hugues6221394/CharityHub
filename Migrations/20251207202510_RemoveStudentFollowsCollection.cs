using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentCharityHub.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStudentFollowsCollection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Follows_Students_StudentId1",
                table: "Follows");

            migrationBuilder.DropIndex(
                name: "IX_Follows_StudentId1",
                table: "Follows");

            migrationBuilder.DropColumn(
                name: "StudentId1",
                table: "Follows");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StudentId1",
                table: "Follows",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Follows_StudentId1",
                table: "Follows",
                column: "StudentId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Follows_Students_StudentId1",
                table: "Follows",
                column: "StudentId1",
                principalTable: "Students",
                principalColumn: "Id");
        }
    }
}
