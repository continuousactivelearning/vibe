import 'reflect-metadata';
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import {Type} from 'class-transformer';
import {ICourseSettings} from 'shared/interfaces/Models';
import {JSONSchema} from 'class-validator-jsonschema';
import {ProctoringComponent} from 'shared/database/interfaces/ISettingsRepository';

class ProctoringSettingsDto {
  @IsEnum(ProctoringComponent, {each: true})
  components: ProctoringComponent[];
}

class SettingsDto {
  @ValidateNested()
  @Type(() => ProctoringSettingsDto)
  proctors: ProctoringSettingsDto;
}

export class CreateCourseSettingsBody implements Partial<ICourseSettings> {
  @JSONSchema({
    title: 'Course Version ID',
    description: 'ID of the course version',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsMongoId()
  @IsString()
  courseVersionId: string;

  @JSONSchema({
    title: 'Course Id',
    description: 'Id of the course',
    example: '60d5ec49b3f1c8e4a8f8b8c3',
    type: 'string',
  })
  @IsNotEmpty()
  @IsMongoId()
  @IsString()
  courseId: string;

  @ValidateNested()
  @Type(() => SettingsDto)
  settings: SettingsDto;
}
