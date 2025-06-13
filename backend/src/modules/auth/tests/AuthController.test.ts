import request from 'supertest';
import Express from 'express';
import {useExpressServer} from 'routing-controllers';
// TODO: Update the import paths below to your project's structure
import {authModuleOptions, setupAuthContainer, SignUpBody} from '../index';
import {faker} from '@faker-js/faker';
<<<<<<< HEAD
import {jest} from '@jest/globals';

=======
import {dbConfig} from '../../../config/db';
jest.setTimeout(30000); // Set a longer timeout for integration tests
>>>>>>> main
describe('Auth Controller Integration Tests', () => {
  const appInstance = Express();
  let app;

  beforeAll(async () => {
    // Set up the real MongoDatabase and Repository
<<<<<<< HEAD
    await setupAuthContainer();
    // Create the Express app with routing-controllers configuration
    app = useExpressServer(appInstance, authModuleOptions);
  }, 30000); // <-- timeout for beforeAll
=======
    Container.set('Database', new MongoDatabase(dbConfig.url, dbConfig.dbName));
    const repo = new UserRepository(Container.get<MongoDatabase>('Database'));
    Container.set('Repo', repo);

    // Create the Express app with routing-controllers configuration
    app = useExpressServer(appInstance, authModuleOptions);
  });
>>>>>>> main

  beforeEach(async () => {
    // TODO: Optionally reset database state before each test
  }, 30000); // <-- timeout for beforeEach

  // ------Tests for Create <ModuleName>------
  describe('Sign Up Test', () => {
    it('should sign up a new user successfully', async () => {
      const signUpBody: SignUpBody = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName('male').replace(/[^a-zA-Z]/g, ''),
        lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, ''),
      };
      const response = await request(app).post('/auth/signup').send(signUpBody);
      expect(response.status).toBe(201);
    }, 30000); // <-- timeout for this test

    it('should return 400 for invalid email', async () => {
      const signUpBody: SignUpBody = {
        email: 'invalid-email',
        password: faker.internet.password(),
        firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, ''),
        lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, ''),
      };
      const response = await request(app).post('/auth/signup').send(signUpBody);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0].constraints.isEmail).toBeDefined();
      expect(response.body.errors[0].constraints.isEmail).toBe(
        'email must be an email',
      );
    }, 30000);

    it('should return 400 for missing required fields', async () => {
      const signUpBody: SignUpBody = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      };
      const response = await request(app).post('/auth/signup').send(signUpBody);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    }, 30000);

    it('should return 400 for weak password', async () => {
      const signUpBody: SignUpBody = {
        email: faker.internet.email(),
        password: '123',
        firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, ''),
        lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, ''),
      };
      const response = await request(app).post('/auth/signup').send(signUpBody);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    }, 30000);
  });
});
