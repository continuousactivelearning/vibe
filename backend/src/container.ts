import {ContainerModule} from 'inversify';
import {
  MongoDatabase,
  UserRepository,
  HttpErrorHandler,
  SettingsRepository,
} from '#shared/index.js';
import {GLOBAL_TYPES} from './types.js';
import {dbConfig} from './config/db.js';
import {CourseRepository} from '#shared/database/providers/mongo/repositories/CourseRepository.js';
import { FirebaseAuthService } from './modules/auth/services/FirebaseAuthService.js';
import { AIContentService } from './modules/genai/services/AIContentService.js';

export const sharedContainerModule = new ContainerModule(options => {
  const uri = dbConfig.url;
  const dbName = 'vibe';

  options.bind(GLOBAL_TYPES.uri).toConstantValue(uri);
  options.bind(GLOBAL_TYPES.dbName).toConstantValue(dbName);

  // Auth
  options.bind(FirebaseAuthService).toSelf().inSingletonScope();

  // Database
  options.bind(GLOBAL_TYPES.Database).to(MongoDatabase).inSingletonScope();

  // Repositories
  options.bind(GLOBAL_TYPES.UserRepo).to(UserRepository).inSingletonScope();
  options.bind(GLOBAL_TYPES.CourseRepo).to(CourseRepository).inSingletonScope();
  options
    .bind(GLOBAL_TYPES.SettingsRepo)
    .to(SettingsRepository)
    .inSingletonScope();

  // AI Content Services
  options
    .bind(GLOBAL_TYPES.AIContentService)
    .to(AIContentService)
    .inSingletonScope();

  // Other
  options.bind(HttpErrorHandler).toSelf().inSingletonScope();
});
