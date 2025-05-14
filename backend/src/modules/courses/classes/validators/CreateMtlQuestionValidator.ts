import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import {Type} from 'class-transformer';

class Parameter {
  @IsString()
  parameterName: string;

  @IsArray()
  allowedValued: string[];
}

class LotItem {
  @IsString()
  id: string;

  @IsString()
  lotItemText: string;
}

class Lot {
  @IsString()
  lotId: string;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => LotItem)
  lotItems: LotItem[];
}

class Match {
  @IsArray()
  itemIds: string[];

  @IsString()
  explanation?: string;
}

class MtlSolution {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Match)
  matches: Match[];
}

class MetaDetails {
  @IsBoolean()
  isStudentGenerated: boolean;

  @IsBoolean()
  isAIGenerated: boolean;
}

export class CreateMtlQuestionValidator {
  @IsString()
  questionType: string;

  @IsString()
  questionText: string;

  @IsString()
  hintText: string;

  @IsNumber()
  difficulty: number;

  @IsBoolean()
  isParameterized: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => Parameter)
  parameters: Parameter;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Lot)
  lots: Lot[];

  @IsObject()
  @ValidateNested()
  @Type(() => MtlSolution)
  solution: {MTL: MtlSolution};

  @IsObject()
  @ValidateNested()
  @Type(() => MetaDetails)
  metaDetails: MetaDetails;

  @IsNumber()
  timeLimit: number;

  @IsNumber()
  points: number;
}
