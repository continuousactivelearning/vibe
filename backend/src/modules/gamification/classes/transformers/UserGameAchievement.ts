import 'reflect-metadata';
import {Expose, Transform, TransformFnParams} from 'class-transformer';
import {
  ObjectIdToString,
  StringToObjectId,
} from '#shared/constants/transformerConstants.js';
import {ID, IUserGameAchievement, IAchievement} from '#shared/index.js';
import {JSONSchema} from 'class-validator-jsonschema';
import {CreateUserGameAchievementBody} from '../validators/GamifyEngineValidators.js';
import {ObjectId} from 'mongodb';

// Custom transformer to handle achievement arrays with ObjectId conversion
const achievementArrayTransformer = {
  toClassOnly: ({value}: TransformFnParams) => {
    if (!Array.isArray(value)) return [];

    return value.map((item: IAchievement) => {
      return {
        ...item,
        achievementId:
          typeof item.achievementId == 'string'
            ? new ObjectId(item.achievementId)
            : item.achievementId,
      };
    });
  },

  toPlainOnly: ({value}: TransformFnParams) => {
    if (!Array.isArray(value)) return [];

    return value.map((item: IAchievement) => {
      return {
        ...item,
        achievementId:
          typeof item.achievementId == 'object'
            ? item.achievementId.toString()
            : item.achievementId,
      };
    });
  },
};

/**
 * UserGameAchievement class - tracks all achievements unlocked by a user
 * Contains a collection of achievements with unlock timestamps
 */
export class UserGameAchievement implements IUserGameAchievement {
  // Unique database identifier for this user achievement record
  @Expose()
  @JSONSchema({
    title: 'User Game Achievement ID',
    description: 'Unique identifier for the user game achievement',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  _id?: ID;

  // Reference to the user who owns these achievements
  @Expose()
  @JSONSchema({
    title: 'User ID',
    description: 'Unique identifier for the user who achieved this',
    example: '60d5ec49b3f1c8e4a8f8b8c1',
    type: 'string',
  })
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  userId: ID;

  // Array of achievements earned by the user
  @Expose()
  @JSONSchema({
    title: 'Achievements',
    description: 'List of achievements earned by the user',
    type: 'array',
  })
  @Transform(achievementArrayTransformer.toClassOnly, {
    toClassOnly: true,
  })
  @Transform(achievementArrayTransformer.toPlainOnly, {
    toPlainOnly: true,
  })
  achievements: IAchievement[];

  /**
   * Constructor - creates a new UserGameAchievement instance
   * @param body - Optional data to populate the user achievements
   */
  constructor(body?: CreateUserGameAchievementBody) {
    if (body) {
      this.userId = body.userId;
      this.achievements = body.achievements || [];
    }
  }
}
