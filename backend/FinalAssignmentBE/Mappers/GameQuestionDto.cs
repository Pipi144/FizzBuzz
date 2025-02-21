using AutoMapper;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Mappers;

public class GameQuestionDto:Profile
{
    public GameQuestionDto()
    {
        //Map GameQuestion to GameQuestionDto
        CreateMap<GameQuestion, Dto.GameQuestionDto>();
    }
}