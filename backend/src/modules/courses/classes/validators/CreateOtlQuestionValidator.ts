import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsArray,
  IsDefined,
} from 'class-validator';
import {Type} from 'class-transformer';

class Parameter {
  @IsString()
  parameterName: string;

  @IsArray()
  allowedValued: string[]; // confirm spelling
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

class Order {
  @IsString()
  itemId: string;

  @IsNumber()
  order: number;
}

class SolutionOTL {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Order)
  orders: Order[];
}

class MetaDetails {
  @IsBoolean()
  isStudentGenerated: boolean;

  @IsBoolean()
  isAIGenerated: boolean;
}

export class CreateOtlQuestionValidator {
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

  @IsOptional()
  @ValidateNested()
  @Type(() => Parameter)
  parameters?: Parameter;

  @IsDefined()
  @ValidateNested()
  @Type(() => Lot)
  lot: Lot;

  @IsDefined()
  @ValidateNested()
  @Type(() => SolutionOTL)
  solution: SolutionOTL;

  @IsDefined()
  @ValidateNested()
  @Type(() => MetaDetails)
  metaDetails: MetaDetails;

  @IsNumber()
  timeLimit: number;

  @IsNumber()
  points: number;
}
