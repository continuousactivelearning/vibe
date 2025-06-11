import {calculateNewOrder} from '#courses/utils/calculateNewOrder.js';
import {
  IModule,
  ObjectIdToString,
  StringToObjectId,
  ID,
} from '#shared/index.js';
import {Expose, Transform, Type} from 'class-transformer';
import {ObjectId} from 'mongodb';

import {CreateModuleBody} from '../validators/ModuleValidators.js';
import {Section} from './Section.js';

/**
 * Module data transformation.
 *
 * @category Courses/Transformers
 */
class Module implements IModule {
  @Expose()
  @Transform(ObjectIdToString.transformer, {toPlainOnly: true})
  @Transform(StringToObjectId.transformer, {toClassOnly: true})
  moduleId?: ID;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  order: string;

  @Expose()
  @Type(() => Section)
  sections: Section[];

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  constructor(moduleBody: CreateModuleBody, existingModules: IModule[]) {
    if (moduleBody) {
      this.name = moduleBody.name;
      this.description = moduleBody.description;
    }
    const sortedModules = existingModules.sort((a, b) =>
      a.order.localeCompare(b.order),
    );
    this.moduleId = new ObjectId();
    this.order = calculateNewOrder(
      sortedModules,
      'moduleId',
      moduleBody.afterModuleId,
      moduleBody.beforeModuleId,
    );
    this.sections = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export {Module};
