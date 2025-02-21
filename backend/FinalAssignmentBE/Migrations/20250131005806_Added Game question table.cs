using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalAssignmentBE.Migrations
{
    /// <inheritdoc />
    public partial class AddedGamequestiontable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GameQuestion_GameAttempts_GameAttemptAttemptId",
                table: "GameQuestion");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GameQuestion",
                table: "GameQuestion");

            migrationBuilder.DropColumn(
                name: "AttemptId",
                table: "GameQuestion");

            migrationBuilder.RenameTable(
                name: "GameQuestion",
                newName: "GameQuestions");

            migrationBuilder.RenameColumn(
                name: "GameAttemptAttemptId",
                table: "GameQuestions",
                newName: "GameAttemptId");

            migrationBuilder.RenameIndex(
                name: "IX_GameQuestion_GameAttemptAttemptId",
                table: "GameQuestions",
                newName: "IX_GameQuestions_GameAttemptId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GameQuestions",
                table: "GameQuestions",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GameQuestions_GameAttempts_GameAttemptId",
                table: "GameQuestions",
                column: "GameAttemptId",
                principalTable: "GameAttempts",
                principalColumn: "AttemptId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GameQuestions_GameAttempts_GameAttemptId",
                table: "GameQuestions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GameQuestions",
                table: "GameQuestions");

            migrationBuilder.RenameTable(
                name: "GameQuestions",
                newName: "GameQuestion");

            migrationBuilder.RenameColumn(
                name: "GameAttemptId",
                table: "GameQuestion",
                newName: "GameAttemptAttemptId");

            migrationBuilder.RenameIndex(
                name: "IX_GameQuestions_GameAttemptId",
                table: "GameQuestion",
                newName: "IX_GameQuestion_GameAttemptAttemptId");

            migrationBuilder.AddColumn<long>(
                name: "AttemptId",
                table: "GameQuestion",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddPrimaryKey(
                name: "PK_GameQuestion",
                table: "GameQuestion",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GameQuestion_GameAttempts_GameAttemptAttemptId",
                table: "GameQuestion",
                column: "GameAttemptAttemptId",
                principalTable: "GameAttempts",
                principalColumn: "AttemptId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
