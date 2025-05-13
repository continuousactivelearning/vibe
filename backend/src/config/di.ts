import {Container} from 'typedi';
import {MongoDatabase} from '../shared/database/providers/mongo/MongoDatabase';
import {CourseRepository} from '../shared/database/providers/mongo/repositories/CourseRepository';
import {SectionService} from '../modules/auth/services/section.service';
import {env} from '../utils/env';

export function configureDI() {
  const mongoDatabase = new MongoDatabase(env.MONGO_URI, env.MONGO_DB_NAME);
  Container.set(MongoDatabase, mongoDatabase);

  const courseRepository = new CourseRepository(mongoDatabase);
  Container.set(CourseRepository, courseRepository);

  const sectionService = new SectionService(courseRepository);
  Container.set(SectionService, sectionService);

  return Container;
}

configureDI();
