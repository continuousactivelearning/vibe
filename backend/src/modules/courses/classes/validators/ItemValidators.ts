import {Type} from 'class-transformer';
import {
  IsDateString,
  IsDecimal,
  IsEmpty,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  IBaseItem,
  IBlogDetails,
  IQuizDetails,
  ItemType,
  IVideoDetails,
} from 'shared/interfaces/IUser';
import {IsBoolean} from 'class-validator';
import {ArrayNotEmpty} from 'class-validator';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// Custom parameter validation decorator
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
}

/**
 * Type-safe object expected by the validation decorator.
 */
interface ParameterizedQuestion {
  questionText: string;
  parameters: string[];
}

/**
 * Custom validation decorator to ensure all parameters are present in the question text.
 *
 * @category Courses/Validators/ItemValidators
 */

function ParametersInQuestionText(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'parametersInQuestionText',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const {questionText, parameters} = args.object as {
            questionText: string;
            parameters?: string[];
          };

          if (typeof questionText !== 'string') {
            return false;
          }

          if (
            !parameters ||
            !Array.isArray(parameters) ||
            parameters.length === 0
          ) {
            // No parameters to check, so valid
            return true;
          }

          const missingParams = parameters.filter(
            param =>
              !new RegExp(`<QParam>${escapeRegExp(param)}</QParam>`).test(
                questionText,
              ),
          );

          return missingParams.length === 0;
        },
        defaultMessage(args: ValidationArguments) {
          const {parameters, questionText} = args.object as {
            questionText: string;
            parameters?: string[];
          };

          if (typeof questionText !== 'string') {
            return 'Invalid questionText';
          }

          if (
            !parameters ||
            !Array.isArray(parameters) ||
            parameters.length === 0
          ) {
            // No parameters to check, so no error
            return '';
          }

          const missingParams = parameters.filter(
            param =>
              !new RegExp(`<QParam>${escapeRegExp(param)}</QParam>`).test(
                questionText,
              ),
          );

          return `Missing parameters in questionText: ${missingParams.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Video item details for embedded video learning content.
 *
 * @category Courses/Validators/ItemValidators
 */
class VideoDetailsPayloadValidator implements IVideoDetails {
  /**
   * Public video URL (e.g., YouTube or Vimeo link).
   */
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  URL: string;

  /**
   * Start time of the clip in HH:MM:SS format.
   */
  @IsNotEmpty()
  @Matches(/^(\d{1,2}:)?\d{1,2}:\d{2}$/, {
    message: 'Invalid time format, it should be HH:MM:SS',
  })
  startTime: string;

  /**
   * End time of the clip in HH:MM:SS format.
   */
  @IsNotEmpty()
  @Matches(/^(\d{1,2}:)?\d{1,2}:\d{2}$/, {
    message: 'Invalid time format, it should be HH:MM:SS',
  })
  endTime: string;

  /**
   * Points assigned to the video interaction.
   */
  @IsNotEmpty()
  @IsDecimal()
  points: number;
}

/**
 * Quiz item details for scheduled quiz-based evaluation.
 *
 * @category Courses/Validators/ItemValidators
 */
class QuizDetailsPayloadValidator implements IQuizDetails {
  /**
   * Number of quiz questions visible to students.
   */
  @IsNotEmpty()
  @IsPositive()
  questionVisibility: number;

  /**
   * ISO date string representing quiz release time.
   */
  @IsNotEmpty()
  @IsDateString()
  releaseTime: Date;

  /**
   * List of quiz question IDs (auto-managed).
   */
  @IsEmpty()
  questions: string[];

  /**
   * ISO date string for quiz deadline.
   */
  @IsNotEmpty()
  @IsDateString()
  deadline: Date;
}

/**
 * Blog item details for content-based reading or writing activities.
 *
 * @category Courses/Validators/ItemValidators
 */
class BlogDetailsPayloadValidator implements IBlogDetails {
  /**
   * Tags for categorizing the blog (auto-managed).
   */
  @IsEmpty()
  tags: string[];

  /**
   * Full blog content in markdown or plain text.
   */
  @IsNotEmpty()
  @IsString()
  content: string;

  /**
   * Points assigned to the blog submission.
   */
  @IsNotEmpty()
  @IsDecimal()
  points: number;
}

/**
 * Body for creating an item inside a section.
 *
 * @category Courses/Validators/ItemValidators
 */
class CreateItemBody implements IBaseItem {
  /**
   * MongoDB ID (auto-assigned).
   */
  @IsEmpty()
  _id?: string;

  /**
   * Title of the item (required).
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Description of the item (required).
   */
  @IsNotEmpty()
  @IsString()
  description: string;

  /**
   * Section ID to which the item belongs (auto-managed).
   */
  @IsEmpty()
  sectionId: string;

  /**
   * Order key for item placement (auto-managed).
   */
  @IsEmpty()
  order: string;

  /**
   * Item details (depends on type) – video, blog, or quiz.
   */
  @IsEmpty()
  itemDetails: IVideoDetails | IQuizDetails | IBlogDetails;

  /**
   * Place item after this item ID (optional).
   */
  @IsOptional()
  @IsMongoId()
  @IsString()
  afterItemId?: string;

  /**
   * Place item before this item ID (optional).
   */
  @IsOptional()
  @IsMongoId()
  @IsString()
  beforeItemId?: string;

  /**
   * Item creation timestamp (auto-managed).
   */
  @IsEmpty()
  createdAt: Date;

  /**
   * Item update timestamp (auto-managed).
   */
  @IsEmpty()
  updatedAt: Date;

  /**
   * Type of the item: VIDEO, BLOG, or QUIZ.
   */
  @IsNotEmpty()
  @IsEnum(ItemType)
  type: ItemType;

  /**
   * Nested video details (required if type is VIDEO).
   */
  @ValidateIf(o => o.type === ItemType.VIDEO)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VideoDetailsPayloadValidator)
  videoDetails?: VideoDetailsPayloadValidator;

  /**
   * Nested blog details (required if type is BLOG).
   */
  @ValidateIf(o => o.type === ItemType.BLOG)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BlogDetailsPayloadValidator)
  blogDetails?: BlogDetailsPayloadValidator;

  /**
   * Nested quiz details (required if type is QUIZ).
   */
  @ValidateIf(o => o.type === ItemType.QUIZ)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => QuizDetailsPayloadValidator)
  quizDetails?: QuizDetailsPayloadValidator;
  itemId:
    | import('c:/Users/USER/Desktop/vibe/backend/src/shared/types').ID
    | undefined;
  isParameterized: boolean;
  parameters: string[];
  questionText: string;
}

/**
 * Body for updating an item.
 * Allows partial updates to name, description, and details.
 *
 * @category Courses/Validators/ItemValidators
 */
class UpdateItemBody implements IBaseItem {
  /**
   * MongoDB ID of the item (auto-managed).
   */
  @IsEmpty()
  _id?: string;

  /**
   * Updated name (optional).
   */
  @IsOptional()
  @IsString()
  name: string;

  /**
   * Updated description (optional).
   */
  @IsOptional()
  @IsString()
  description: string;

  /**
   * Section ID (auto-managed).
   */
  @IsEmpty()
  sectionId: string;

  /**
   * Order (auto-managed).
   */
  @IsEmpty()
  order: string;

  /**
   * Item details (auto-managed).
   */
  @IsEmpty()
  itemDetails: IVideoDetails | IQuizDetails | IBlogDetails;

  /**
   * Created at timestamp (auto-managed).
   */
  @IsEmpty()
  createdAt: Date;

  /**
   * Updated at timestamp (auto-managed).
   */
  @IsEmpty()
  updatedAt: Date;

  /**
   * Updated type, if changing item category.
   */
  @IsOptional()
  @IsEnum(ItemType)
  type: ItemType;

  /**
   * Optional: reorder after this item.
   */
  @IsOptional()
  @IsMongoId()
  @IsString()
  afterItemId?: string;

  /**
   * Optional: reorder before this item.
   */
  @IsOptional()
  @IsMongoId()
  @IsString()
  beforeItemId?: string;

  /**
   * Updated video details (if type is VIDEO).
   */
  @ValidateIf(o => o.type === ItemType.VIDEO)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VideoDetailsPayloadValidator)
  videoDetails?: VideoDetailsPayloadValidator;

  /**
   * Updated blog details (if type is BLOG).
   */
  @ValidateIf(o => o.type === ItemType.BLOG)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BlogDetailsPayloadValidator)
  blogDetails?: BlogDetailsPayloadValidator;

  /**
   * Updated quiz details (if type is QUIZ).
   */
  @ValidateIf(o => o.type === ItemType.QUIZ)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => QuizDetailsPayloadValidator)
  quizDetails?: QuizDetailsPayloadValidator;
  isParameterized: boolean;
  parameters: string[];
  questionText: string;
}

/**
 * Body to move an item within its section.
 *
 * @category Courses/Validators/ItemValidators
 */
class MoveItemBody {
  /**
   * Move after this item (optional).
   */
  @IsOptional()
  @IsMongoId()
  @IsString()
  afterItemId?: string;

  /**
   * Move before this item (optional).
   */
  @IsOptional()
  @IsMongoId()
  @IsString()
  beforeItemId?: string;

  /**
   * Validation helper – at least one of afterItemId or beforeItemId must be present.
   */
  @ValidateIf(o => !o.afterItemId && !o.beforeItemId)
  @IsNotEmpty({
    message: 'At least one of "afterItemId" or "beforeItemId" must be provided',
  })
  onlyOneAllowed: string;

  /**
   * Validation helper – both afterItemId and beforeItemId cannot be present at the same time.
   */
  @ValidateIf(o => o.afterItemId && o.beforeItemId)
  @IsNotEmpty({
    message: 'Only one of "afterItemId" or "beforeItemId" must be provided',
  })
  bothNotAllowed: string;
}

/**
 * Route parameters for creating a new item.
 *
 * @category Courses/Validators/ItemValidators
 */
class CreateItemParams {
  /** Version ID of the course */
  @IsMongoId()
  @IsString()
  versionId: string;

  /** Module ID inside the version */
  @IsMongoId()
  @IsString()
  moduleId: string;

  /** Section ID inside the module */
  @IsMongoId()
  @IsString()
  sectionId: string;
}

/**
 * Route parameters for retrieving all items in a section.
 *
 * @category Courses/Validators/ItemValidators
 */
class ReadAllItemsParams {
  /** Version ID of the course */
  @IsMongoId()
  @IsString()
  versionId: string;

  /** Module ID inside the version */
  @IsMongoId()
  @IsString()
  moduleId: string;

  /** Section ID inside the module */
  @IsMongoId()
  @IsString()
  sectionId: string;
}

/**
 * Route parameters for updating a specific item.
 *
 * @category Courses/Validators/ItemValidators
 */
class UpdateItemParams {
  /** Version ID of the course */
  @IsMongoId()
  @IsString()
  versionId: string;

  /** Module ID inside the version */
  @IsMongoId()
  @IsString()
  moduleId: string;

  /** Section ID inside the module */
  @IsMongoId()
  @IsString()
  sectionId: string;

  /** Target item ID to update */
  @IsMongoId()
  @IsString()
  itemId: string;
}

/**
 * Route parameters for moving an item.
 *
 * @category Courses/Validators/ItemValidators
 */
class MoveItemParams {
  /** Version ID of the course */
  @IsMongoId()
  @IsString()
  versionId: string;

  /** Module ID inside the version */
  @IsMongoId()
  @IsString()
  moduleId: string;

  /** Section ID inside the module */
  @IsMongoId()
  @IsString()
  sectionId: string;

  /** Item ID to move */
  @IsMongoId()
  @IsString()
  itemId: string;
}

/**
 * Validator for individual lot items in the SOL question type.
 *
 * @category Courses/Validators/ItemValidators
 */
class LotItemValidator {
  /**
   * Unique ID for the lot item (required).
   */
  @IsNotEmpty()
  @IsString()
  id: string;

  /**
   * Description of the lot item (required).
   */
  @IsNotEmpty()
  @IsString()
  lotItemText: string;

  /**
   * Indicates if this item is the correct answer (required).
   */
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;

  /**
   * Explanation for the correct answer (optional).
   */
  @IsOptional()
  @IsString()
  explanation?: string;
}

/**
 * Validator for Select One from Lot (SOL) question type.
 *
 * @category Courses/Validators/ItemValidators
 */
class SelectOneFromLotValidator {
  /**
   * Unique ID for the lot (required).
   */
  @IsNotEmpty()
  @IsString()
  lotId: string;

  /**
   * Question text with <QParam></QParam> tags for parameters (required).
   */
  @IsNotEmpty()
  @IsString()
  questionText: string;

  /**
   * List of parameters used in the question text (optional).
   */
  @IsOptional()
  @IsString({each: true})
  @ParametersInQuestionText({
    message:
      'All parameters must appear in questionText as <QParam>param</QParam>',
  })
  parameters?: string[];

  /**
   * List of lot items (required).
   * Each item must have a unique ID and a description.
   */

  @IsNotEmpty()
  @ArrayNotEmpty()
  @ValidateNested({each: true})
  @Type(() => LotItemValidator)
  lotItems: LotItemValidator[];

  /**
   * Time limit for the question in seconds (optional).
   */
  @IsOptional()
  @IsPositive()
  timeLimit?: number;

  /**
   * Points assigned to the question (required).
   */
  @IsNotEmpty()
  @IsDecimal()
  points: number;

  /**
   * Hints for the question (optional).
   */
  @IsOptional()
  @IsString({each: true})
  hints?: string[];

  /**
   * Explanation for the correct answer (optional).
   */
  @IsOptional()
  @IsString()
  explanation?: string;

  /**
   * Difficulty level of the question (required).
   */
  @IsNotEmpty()
  difficulty: number;
}

export {SelectOneFromLotValidator, LotItemValidator, ParametersInQuestionText};
/**
 * Route parameters for deleting an item.
 *
 * @category Courses/Validators/ItemValidators
 */

class DeleteItemParams {
  /** ItemsGroupId */

  @IsMongoId()
  @IsString()
  itemsGroupId: string;

  /** ItemId */
  @IsMongoId()
  @IsString()
  itemId: string;
}

export {
  CreateItemBody,
  UpdateItemBody,
  MoveItemBody,
  VideoDetailsPayloadValidator,
  QuizDetailsPayloadValidator,
  BlogDetailsPayloadValidator,
  CreateItemParams,
  ReadAllItemsParams,
  UpdateItemParams,
  MoveItemParams,
  DeleteItemParams,
};

/**
 * Validator for unique lot item IDs within the SOL question type.
 *
 * @category Courses/Validators/ItemValidators
 */
class UniqueLotItemIds {
  /**
   * Validation method to ensure lot item IDs are unique.
   */
  validate(value: LotItemValidator[]) {
    if (!Array.isArray(value)) return false;
    const ids = value.map(item => item.id);
    return ids.length === new Set(ids).size;
  }

  /**
   * Default error message for duplicate lot item IDs.
   */
  defaultMessage() {
    return 'Each lotItem id must be unique.';
  }
}
