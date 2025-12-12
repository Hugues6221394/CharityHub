using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentCharityHub.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentApplicationAndJwtAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StudentApplications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    PlaceOfBirth = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CurrentResidency = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FatherName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MotherName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ParentsAnnualSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FamilySituation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PersonalStory = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    AcademicBackground = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CurrentEducationLevel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FieldOfStudy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DreamCareer = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ProfileImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ProofDocuments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RequestedFundingAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FundingPurpose = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReviewedByManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ReviewedByManagerAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedByAdminId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ApprovedByAdminAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsPostedAsStudent = table.Column<bool>(type: "bit", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentApplications_AspNetUsers_ApplicationUserId",
                        column: x => x.ApplicationUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentApplications_AspNetUsers_ApprovedByAdminId",
                        column: x => x.ApprovedByAdminId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentApplications_AspNetUsers_ReviewedByManagerId",
                        column: x => x.ReviewedByManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentApplications_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentApplications_ApplicationUserId",
                table: "StudentApplications",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentApplications_ApprovedByAdminId",
                table: "StudentApplications",
                column: "ApprovedByAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentApplications_ReviewedByManagerId",
                table: "StudentApplications",
                column: "ReviewedByManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentApplications_Status",
                table: "StudentApplications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_StudentApplications_StudentId",
                table: "StudentApplications",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentApplications");
        }
    }
}
