import {ContainerModule} from 'inversify';
import {AUTH_TYPES} from './types.js';
import {FirebaseAuthService} from './services/index.js';
import {AuthController} from './controllers/index.js';
import { NOTIFICATIONS_TYPES } from '../notifications/types.js';
import { InviteService } from '../notifications/index.js';

export const authContainerModule = new ContainerModule(options => {
  // Services
  options
    .bind(AUTH_TYPES.AuthService)
    .to(FirebaseAuthService)
    .inSingletonScope();
  options.bind(NOTIFICATIONS_TYPES.InviteService).to(InviteService).inSingletonScope();

  // Controllers
  options.bind(AuthController).toSelf().inSingletonScope();
});
