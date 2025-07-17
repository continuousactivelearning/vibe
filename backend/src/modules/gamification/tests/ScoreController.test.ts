import Express from 'express';
import {
  RoutingControllersOptions,
  useContainer,
  useExpressServer,
} from 'routing-controllers';
import {Container} from 'inversify';
import request from 'supertest';
import {describe, it, beforeAll, afterAll, expect, vi, beforeEach} from 'vitest';
import {faker} from '@faker-js/faker';
import {ObjectId} from 'mongodb';

import {sharedContainerModule} from '#root/container.js';
import {GamificationContainerModule} from '../index.js';
import {usersContainerModule} from '#root/modules/users/container.js';
import {authContainerModule} from '#root/modules/auth/container.js';
import {authModuleOptions} from '#root/modules/auth/index.js';
import {InversifyAdapter} from '#root/inversify-adapter.js';
import {FirebaseAuthService} from '#root/modules/auth/services/FirebaseAuthService.js';
import {GAMIFICATION_TYPES} from '../types.js';
import {ScoringService} from '#gamification/services/ScoringService.js';
import {gamificationModuleOptions} from '../index.js';
import {IScoringWeights} from '#gamification/interfaces/scoring.js';

describe('ScoreController', () => {
  const appInstance = Express();
  let app: any;
  let userId: string;
  let adminToken: string;
  let instructorToken: string;
  let userToken: string;
  let defaultWeights: IScoringWeights;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const container = new Container();
    container.load(
      sharedContainerModule,
      GamificationContainerModule,
      usersContainerModule,
      authContainerModule,
    );

    const inversifyAdapter = new InversifyAdapter(container);
    useContainer(inversifyAdapter);

    // Mock ScoringService
    defaultWeights = {
      highWeight: 2,
      lowWeight: 1,
      hintPenalty: -0.5,
      streakBonus: 3,
      timeWeight: 0.2,
      attemptPenalty: -0.5,
    };

    const mockScoringService = {
      calculateScore: vi.fn().mockImplementation((attempt) => {
        return {
          score: 85,
          breakdown: {
            baseScore: 80,
            confidenceBonus: 5,
            streakBonus: 3,
            timeBonus: 2,
            hintPenalty: -0.5,
            attemptPenalty: -0.5
          }
        };
      }),
      getCurrentWeights: vi.fn().mockReturnValue(defaultWeights),
      updateWeights: vi.fn().mockImplementation((weights) => weights)
    };

    // Correct way to rebind the service
    container.unbind(GAMIFICATION_TYPES.ScoringService);
    container.bind(GAMIFICATION_TYPES.ScoringService).toConstantValue(mockScoringService);

    const options: RoutingControllersOptions = {
      controllers: [
        ...(gamificationModuleOptions.controllers as Function[]),
        ...(authModuleOptions.controllers as Function[]),
      ],
      authorizationChecker: async (action, roles) => {
        const token = action.request.headers['authorization']?.split(' ')[1];
        
        // Check if token exists
        if (!token) return false;
        
        // Admin token case
        if (token.includes('admin')) {
          return roles.includes('admin') || roles.includes('instructor') || roles.includes('user');
        }
        
        // Instructor token case
        if (token.includes('instructor')) {
          return roles.includes('instructor') || roles.includes('user');
        }
        
        // User token case
        if (token.includes('user')) {
          return roles.includes('user');
        }
        
        return false;
      },
      currentUserChecker: async (action) => {
        // Implementation for current user checker
        const token = action.request.headers['authorization']?.split(' ')[1];
        if (token) {
          return { id: userId };
        }
        return null;
      },
      defaultErrorHandler: false,
      validation: true,
    };

    app = useExpressServer(appInstance, options);

    // Setup test users with different roles
    const adminSignUp = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'admin',
    };

    const instructorSignUp = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'instructor',
    };

    const userSignUp = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'user',
    };

    const adminRes = await request(app).post('/auth/signup').send(adminSignUp);
    const instructorRes = await request(app).post('/auth/signup').send(instructorSignUp);
    const userRes = await request(app).post('/auth/signup').send(userSignUp);

    userId = userRes.body.userId;
    adminToken = `mock-admin-token-${adminRes.body}`;
    instructorToken = `mock-instructor-token-${instructorRes.body}`;
    userToken = `mock-user-token-${userRes.body}`;

    vi.spyOn(FirebaseAuthService.prototype, 'getUserIdFromReq').mockResolvedValue(userId);
  });

  describe('POST /gamification/score', () => {
    const validAttempt = {
      userId: new ObjectId().toString(),
      quizId: new ObjectId().toString(),
      attemptId: new ObjectId().toString(),
      metricId: new ObjectId().toString(),
      grades: [
        {
          questionId: new ObjectId().toString(),
          confidenceScore: 3,
          result: true
        }
      ],
      streaks: 3,
      timeTaken: 300,
      idealTime: 600,
      attemptCount: 1,
      hintCount: 0
    };

    it('should calculate score successfully (user)', async () => {
      const res = await request(app)
        .post('/gamification/score')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validAttempt);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('score', 85);
      expect(res.body).toHaveProperty('breakdown');
    });

    it('should calculate score successfully (admin)', async () => {
      const res = await request(app)
        .post('/gamification/score')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAttempt);

      expect(res.status).toBe(200);
    });

    it('should calculate score successfully (instructor)', async () => {
      const res = await request(app)
        .post('/gamification/score')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(validAttempt);

      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid attempt payload', async () => {
      const invalidAttempt = {
        userId: 'invalid-id',
        quizId: 'invalid-id',
        grades: [] 
      };

      const res = await request(app)
        .post('/gamification/score')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidAttempt);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 for empty grades array', async () => {
      const invalidAttempt = {
        ...validAttempt,
        grades: []
      };

      const res = await request(app)
        .post('/gamification/score')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidAttempt);

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid confidence score', async () => {
      const invalidAttempt = {
        ...validAttempt,
        grades: [{
          ...validAttempt.grades[0],
          confidenceScore: 6 // Invalid confidence score
        }]
      };

      const res = await request(app)
        .post('/gamification/score')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidAttempt);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /gamification/weights', () => {
    it('should retrieve weights successfully (user)', async () => {
      const res = await request(app)
        .get('/gamification/weights')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(defaultWeights);
    });

    it('should retrieve weights successfully (admin)', async () => {
      const res = await request(app)
        .get('/gamification/weights')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should retrieve weights successfully (instructor)', async () => {
      const res = await request(app)
        .get('/gamification/weights')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /gamification/weights', () => {
    const newWeights = {
      highWeight: 3,
      lowWeight: 1.5,
      hintPenalty: -1,
      streakBonus: 4,
      timeWeight: 0.3,
      attemptPenalty: -0.75
    };

    it('should update weights successfully (admin)', async () => {
      const res = await request(app)
        .put('/gamification/weights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newWeights);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(newWeights);
    });

    it('should update weights successfully (instructor)', async () => {
      const res = await request(app)
        .put('/gamification/weights')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(newWeights);

      expect(res.status).toBe(200);
    });

    it('should return 403 for unauthorized role (user)', async () => {
      const res = await request(app)
        .put('/gamification/weights')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newWeights);

      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid weights payload', async () => {
      const invalidWeights = {
        highWeight: 'not-a-number',
        lowWeight: -1,
        hintPenalty: 'invalid',
        streakBonus: null,
        timeWeight: 2,
        attemptPenalty: undefined
      };

      const res = await request(app)
        .put('/gamification/weights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidWeights);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteWeights = {
        highWeight: 2,
        lowWeight: 1
        // Missing other required fields
      };

      const res = await request(app)
        .put('/gamification/weights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteWeights);

      expect(res.status).toBe(400);
    });
  });
});