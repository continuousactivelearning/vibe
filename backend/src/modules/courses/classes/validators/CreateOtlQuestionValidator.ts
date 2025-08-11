import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsArray,
  IsDefined,
  ValidateIf,
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {Type} from 'class-transformer';

/** ----------- Custom Validator Starts Here ----------- **/
@ValidatorConstraint({async: false})
class QParamMatchesParametersConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    if (!obj.isParameterized) return true;

    const questionText = obj.questionText || '';
    const parameters = obj.parameters || [];

    // Extract values within <QParam>...</QParam>
    const paramMatches = questionText.match(/<QParam>(.*?)<\/QParam>/g) || [];
    const extractedParamNames = paramMatches.map(m =>
      m.replace(/<\/?QParam>/g, ''),
    );

    if (extractedParamNames.length !== parameters.length) return false;

    const paramNamesSet = new Set(parameters.map((p: any) => p.parameterName));
    return extractedParamNames.every(name => paramNamesSet.has(name));
  }

  defaultMessage(args: ValidationArguments) {
    return 'If parameterized, <QParam> tags in questionText must match parameter names and count.';
  }
}

function QParamMatchesParameters() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'QParamMatchesParameters',
      target: object.constructor,
      propertyName: propertyName,
      options: {message: 'QParam tags must match parameters'},
      validator: QParamMatchesParametersConstraint,
    });
  };
}
/** ----------- Custom Validator Ends Here ----------- **/

class Parameter {
  @IsString()
  parameterName: string;

  @IsArray()
  allowedValues: string[];

  @IsString()
  type: 'string' | 'number' | 'boolean' | 'decimal';
}

class LotItem {
  @IsString()
  lotItemId: string;

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

export class CreateOTLQuestionBody {
  @IsString()
  questionType: string;

  @IsString()
  @QParamMatchesParameters() // <== Custom validator here
  questionText: string;

  @IsString()
  hintText: string;

  @IsNumber()
  difficulty: number;

  @IsBoolean()
  isParameterized: boolean;

  @ValidateIf(o => o.isParameterized)
  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Parameter)
  parameters: Parameter[];

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
