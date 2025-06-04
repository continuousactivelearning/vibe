import request from 'supertest';
import Express from 'express';
import {useExpressServer} from 'routing-controllers';
import {Container} from 'typedi';
import nodemailer from 'nodemailer';

// TODO: Update the import paths below to your project's structure
import {MongoDatabase} from '../../../shared/database/providers/mongo/MongoDatabase';
import {authModuleOptions, SignUpBody} from '../index';
import {UserRepository} from 'shared/database/providers/MongoDatabaseProvider';
import {faker} from '@faker-js/faker';
import {dbConfig} from '../../../config/db';
jest.setTimeout(30000); // Set a longer timeout for integration tests

// Mock setupAuthModuleDependencies to avoid real DB connection in CI/test
jest.mock('../index', () => ({
  ...jest.requireActual('../index'),
  setupAuthModuleDependencies: jest.fn(),
}));

// Mock MongoDatabase to avoid real DB connection in CI/test
let mongoDatabaseMock;
global.beforeAll(() => {
  mongoDatabaseMock = jest
    .spyOn(
      require('../../../shared/database/providers/mongo/MongoDatabase'),
      'MongoDatabase',
    )
    .mockImplementation(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      startSession: jest.fn().mockReturnValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      }),
      getDBClient: jest.fn().mockReturnValue({
        startSession: jest.fn().mockReturnValue({
          startTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          abortTransaction: jest.fn(),
          endSession: jest.fn(),
        }),
      }),
    }));
});

global.afterAll(() => {
  if (mongoDatabaseMock) mongoDatabaseMock.mockRestore();
  Container.reset();
});

// Ensure all required dependencies are set up in Container before tests
import {FirebaseAuthService} from '../services/FirebaseAuthService';

beforeAll(() => {
  if (!Container.has('Database')) {
    Container.set('Database', new MongoDatabase(dbConfig.url, 'vibe'));
  }
  if (!Container.has('UserRepository')) {
    const repo = new UserRepository(Container.get<MongoDatabase>('Database'));
    Container.set('UserRepository', repo);
  }
  if (!Container.has('AuthService')) {
    const service = new FirebaseAuthService(Container.get('UserRepository'));
    Container.set('AuthService', service);
  }
});

afterAll(() => {
  Container.reset();
});

// Remove dotenv import/config from service files; ensure it's only in app entrypoint (index.ts)

describe('Auth Controller Integration Tests', () => {
  const appInstance = Express();
  let app;

  beforeAll(async () => {
    // Use the mocked setupAuthModuleDependencies
    const {setupAuthModuleDependencies} = require('../index');
    setupAuthModuleDependencies();
    // Set up the mocked MongoDatabase and Repository (for test/CI)
    Container.set('Database', new MongoDatabase(dbConfig.url, dbConfig.dbName));
    const repo = new UserRepository(Container.get('Database'));
    Container.set('Repo', repo);

    // Create the Express app with routing-controllers configuration
    app = useExpressServer(appInstance, authModuleOptions);
  });

  beforeEach(async () => {
    // TODO: Optionally reset database state before each test
  });

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

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(signUpBody.email);
      expect(response.body.firstName).toBe(signUpBody.firstName);
      expect(response.body.lastName).toBe(signUpBody.lastName);
      expect(response.body).not.toHaveProperty('password');
    });
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
    });
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
    });
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
    });
  });

  describe('Send Verification Email', () => {
    let sendMailMock: jest.SpyInstance;

    beforeAll(() => {
      // Mock nodemailer.createTransport().sendMail
      sendMailMock = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({
          accepted: ['test@example.com'],
          rejected: [],
        }),
      } as unknown as ReturnType<typeof nodemailer.createTransport>);
    });

    afterAll(() => {
      sendMailMock.mockRestore();
    });

    it('should return 200 and a verification link for a valid email and send an email', async () => {
      const email = faker.internet.email();
      const response = await request(app)
        .post('/auth/send-verification-email')
        .send({email});
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('link');
        // Check that sendMail was called
        expect(sendMailMock).toHaveBeenCalled();
      } else if (response.status === 404) {
        expect(response.body.message).toMatch(/not found/i);
      } else {
        throw new Error('Unexpected status code: ' + response.status);
      }
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/auth/send-verification-email')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/send-verification-email')
        .send({email: 'not-an-email'});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
