import { Invite, MailService } from "./modules/notifications/index.js";

const TYPES = {
  //Database
  Database: Symbol.for('Database'),

  //Repositories
  UserRepo: Symbol.for('UserRepo'),
  CourseRepo: Symbol.for('CourseRepo'),
  InviteRepo: Symbol.for('InviteRepo'),
  EnrollmentRepo: Symbol.for('EnrollmentRepo'),
  SettingsRepo: Symbol.for('SettingsRepo'),

  //Services
  MailService: Symbol.for('MailService'),
  AIContentService: Symbol.for('AIContentService'),

  //Constants
  uri: Symbol.for('dbURI'),
  dbName: Symbol.for('dbName'),
};

export {TYPES as GLOBAL_TYPES};
