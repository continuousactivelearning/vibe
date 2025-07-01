const TYPES = {
  //Database
  Database: Symbol.for('Database'),

  //Repositories
  UserRepo: Symbol.for('UserRepo'),
  CourseRepo: Symbol.for('CourseRepo'),
  SettingsRepo: Symbol.for('SettingsRepo'),
  GamifyEngineRepo: Symbol.for('GamifyEngineRepo'),
  GamifyLayerRepo: Symbol.for('GamifyLayerRepo'),

  //Constants
  uri: Symbol.for('dbURI'),
  dbName: Symbol.for('dbName'),
};

export {TYPES as GLOBAL_TYPES};
