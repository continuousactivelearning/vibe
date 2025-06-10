import 'reflect-metadata';
import {Expose, Transform} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from 'shared/constants/transformerConstants';
import {ID} from 'shared/types';
import {ProctoringComponent} from 'shared/database/interfaces/ISettingsRepository';

import {ICourseSettings} from 'shared/interfaces/Models';
import {JSONSchema} from 'class-validator-jsonschema';
import {CreateCourseSettingsBody} from '../validators/index.js';

class CourseSettings implements ICourseSettings {
  @Expose()
  @JSONSchema({
    title: 'Course Settings ID',
    description: 'Unique identifier for the course settings',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  @Expose()
  @JSONSchema({
    title: 'Course Version ID',
    description: 'ID of the course version',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  courseVersionId: ID;

  @Expose()
  @JSONSchema({
    title: 'Course ID',
    description: 'Id of the course',
    example: '60d5ec49b3f1c8e4a8f8b8c3',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  courseId: ID;

  @Expose()
  @JSONSchema({
    title: 'Settings',
    description: 'Settings for the course',
    type: 'object',
    properties: {
      proctors: {
        type: 'object',
        properties: {
          components: {
            type: 'array',
            items: {
              type: 'string',
              enum: Object.values(ProctoringComponent),
            },
          },
        },
      },
    },
  })
  settings: {
    proctors: {
      components: ProctoringComponent[];
    };
  };

  constructor(courseSettingsBody?: CreateCourseSettingsBody) {
    if (courseSettingsBody) {
      this.courseVersionId = courseSettingsBody.courseVersionId;
      this.courseId = courseSettingsBody.courseId;
    }

    this.settings = {
      proctors: {
        components: [],
      },
    };
  }
}

export {CourseSettings};
