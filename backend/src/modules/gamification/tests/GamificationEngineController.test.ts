import Express from 'express';
import {
  RoutingControllersOptions,
  useContainer,
  useExpressServer,
} from 'routing-controllers';

import {sharedContainerModule} from '#root/container.js';
import {GamificationContainerModule} from '../index.js';
import {gamificationModuleOptions} from '../index.js';
import {usersContainerModule} from '#root/modules/users/container.js';
import {authContainerModule} from '#root/modules/auth/container.js';
import {authModuleOptions} from '#root/modules/auth/index.js';
import {Container} from 'inversify';
import {InversifyAdapter} from '#root/inversify-adapter.js';
import request from 'supertest';
import {describe, it, beforeAll, afterAll, expect, vi} from 'vitest';
import {FirebaseAuthService} from '#root/modules/auth/services/FirebaseAuthService.js';
import {faker} from '@faker-js/faker';
import {coursesContainerModule} from '#root/modules/courses/container.js';
import {notificationsContainerModule} from '#root/modules/notifications/container.js';

describe('GamificationEngineController', () => {
  const appInstance = Express();
  let app: any;
  let userId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const container = new Container();
    container.load(
      sharedContainerModule,
      GamificationContainerModule,
      usersContainerModule,
      authContainerModule,
      coursesContainerModule,
      notificationsContainerModule,
    );

    const inversifyAdapter = new InversifyAdapter(container);
    useContainer(inversifyAdapter);

    const options: RoutingControllersOptions = {
      controllers: [
        ...(gamificationModuleOptions.controllers as Function[]),
        ...(authModuleOptions.controllers as Function[]),
      ],
      authorizationChecker: async () => true,
      defaultErrorHandler: false,
      validation: true,
      currentUserChecker: async () => {
        return userId
          ? {
              _id: userId,
              email: 'attempt_test_user@example.com',
              name: 'Attempt Test User',
            }
          : null;
      },
    };

    app = useExpressServer(appInstance, options);

    const signUpBody = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, ''),
      lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, ''),
    };

    const signupRes = await request(app).post('/auth/signup').send(signUpBody);

    expect(signupRes.status).toBe(201);
    userId = signupRes.body.userId;
    expect(userId).toBeTruthy();
    vi.spyOn(
      FirebaseAuthService.prototype,
      'getUserIdFromReq',
    ).mockResolvedValue(userId);
  }, 900000);

  describe('POST /gamification/engine/metrics', () => {
    it('should create a game metric', async () => {
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const res = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(metricBody.name);
    });

    it('should return 400 for invalid payload', async () => {
      const invalidMetricBody = {
        name: '',
        description: 'This metric has no name',
        type: 'InvalidType',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const res = await request(app)
        .post('/gamification/engine/metrics')
        .send(invalidMetricBody);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /gamification/engine/metrics', () => {
    it('should retrieve all game metrics', async () => {
      const res = await request(app).get('/gamification/engine/metrics');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /gamification/engine/metrics/:metricId', () => {
    it('should retrive a specific game metric', async () => {
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const createRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(createRes.status).toBe(201);
      const metricId = createRes.body._id;

      const res = await request(app).get(
        `/gamification/engine/metrics/${metricId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', metricId);
    });

    it('should return 400 for invalid metric ID', async () => {
      const res = await request(app).get(
        '/gamification/engine/metrics/invalidMetricId',
      );

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent metric', async () => {
      const res = await request(app).get(
        '/gamification/engine/metrics/6862b8b8705094efb275a981',
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /gamification/engine/metrics/', () => {
    it('should update a game metric', async () => {
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      // Create a metric first.
      const createRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(createRes.status).toBe(201);

      const metricId = createRes.body._id;

      // update the metric.
      const updateBody = {
        metricId: metricId,
        name: 'Updated Test Metric',
        description: 'This is an updated test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const res = await request(app)
        .put('/gamification/engine/metrics')
        .send(updateBody);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent metric', async () => {
      const updateBody = {
        metricId: '6862b8b8705094efb275a981',
        name: 'Non-existent Metric',
        description: 'This metric does not exist',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const res = await request(app)
        .put('/gamification/engine/metrics')
        .send(updateBody);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid payload', async () => {
      const invalidUpdateBody = {
        metricId: 'invalidMetricId',
        name: '',
        description: 'This metric has no name',
        type: 'InvalidType',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const res = await request(app)
        .put('/gamification/engine/metrics')
        .send(invalidUpdateBody);

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /gamification/engine/metrics/:metricId', () => {
    it('should delete a game metric', async () => {
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      // Create a metric first.
      const createRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(createRes.status).toBe(201);
      const metricId = createRes.body._id;

      const res = await request(app).delete(
        `/gamification/engine/metrics/${metricId}`,
      );

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent metric', async () => {
      const res = await request(app).delete(
        '/gamification/engine/metrics/6862b8b8705094efb275a981',
      );

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid metric ID', async () => {
      const res = await request(app).delete(
        '/gamification/engine/metrics/invalidMetricId',
      );

      expect(res.status).toBe(400);
    });
  });

  describe('POST /gamification/engine/achievements', () => {
    it('should create a game achievement with status ACTIVE by default', async () => {
      // first create a metric to use in the achievement.
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      const achievementBody = {
        name: 'Points Master',
        description: 'Awarded for reaching 1000 points',
        badgeUrl: 'https://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 1000,
      };

      const res = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'ACTIVE');
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(achievementBody.name);
    });

    it('should return 400 for invalid payload', async () => {
      const invalidAchievementBody = {
        name: '',
        description: 'This achievement has no name',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: 'invalidMetricId',
        metricCount: 10,
      };

      const res = await request(app)
        .post('/gamification/engine/achievements')
        .send(invalidAchievementBody);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent metric', async () => {
      const achievementBody = {
        name: 'Non-existent Metric Achievement',
        description: 'This achievement uses a non-existent metric',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: '6862b8b8705094efb275a981',
        metricCount: 10,
      };

      const res = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /gamification/engine/achievements/ (status update)', () => {
    it('should update an achievement status from ACTIVE to INACTIVE and back to ACTIVE', async () => {
      // Create metric and achievement first
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };
      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);
      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      const achievementBody = {
        name: 'Status Test',
        description: 'Test status update',
        badgeUrl: 'https://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 10,
      };
      const createRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);
      expect(createRes.status).toBe(201);
      const achievementId = createRes.body._id;

      // Update to INACTIVE
      const updateBodyInactive = {
        achievementId,
        ...achievementBody,
        status: 'INACTIVE',
      };
      const updateRes = await request(app)
        .put('/gamification/engine/achievements')
        .send(updateBodyInactive);
      expect(updateRes.status).toBe(200);

      // Verify status is INACTIVE
      const getResInactive = await request(app)
        .get(`/gamification/engine/achievements/${achievementId}`);
      expect(getResInactive.status).toBe(200);
      expect(getResInactive.body).toHaveProperty('status', 'INACTIVE');

      // Update back to ACTIVE
      const updateBodyActive = {
        achievementId,
        ...achievementBody,
        status: 'ACTIVE',
      };
      const updateResActive = await request(app)
        .put('/gamification/engine/achievements')
        .send(updateBodyActive);
      expect(updateResActive.status).toBe(200);

      // Verify status is ACTIVE
      const getResActive = await request(app)
        .get(`/gamification/engine/achievements/${achievementId}`);
      expect(getResActive.status).toBe(200);
      expect(getResActive.body).toHaveProperty('status', 'ACTIVE');
    });

    it('should return 400 for invalid status value', async () => {
      // Create metric and achievement first
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };
      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);
      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      const achievementBody = {
        name: 'Invalid Status',
        description: 'Test invalid status',
        badgeUrl: 'https://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 10,
      };
      const createRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);
      expect(createRes.status).toBe(201);
      const achievementId = createRes.body._id;

      // Try to update with invalid status
      const updateBody = {
        achievementId,
        ...achievementBody,
        status: 'NOT_A_STATUS',
      };
      const updateRes = await request(app)
        .put('/gamification/engine/achievements')
        .send(updateBody);
      expect(updateRes.status).toBe(400);
    });
  });

  describe('DELETE /gamification/engine/achievements/:achievementId (soft delete)', () => {
    it('should soft-delete an achievement by setting its status to INACTIVE', async () => {
      // Create metric and achievement first
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };
      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);
      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      const achievementBody = {
        name: 'Soft Delete',
        description: 'Test soft delete',
        badgeUrl: 'https://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 10,
      };
      const createRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);
      expect(createRes.status).toBe(201);
      const achievementId = createRes.body._id;

      // Soft delete
      const deleteRes = await request(app)
        .delete(`/gamification/engine/achievements/${achievementId}`);
      expect(deleteRes.status).toBe(200);

      // Verify status is INACTIVE
      const getRes = await request(app)
        .get(`/gamification/engine/achievements/${achievementId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty('status', 'INACTIVE');
    });
    it('should hard-delete an achievement by deleting its metric and verify status is DELETED', async () => {
      // Create metric and achievement first
      const metricBody = {
        name: 'Test Metric Hard',
        description: 'This is a test metric for hard delete',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };
      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);
      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      const achievementBody = {
        name: 'Hard Delete',
        description: 'Test hard delete',
        badgeUrl: 'https://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 10,
      };
      const createRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);
      expect(createRes.status).toBe(201);
      const achievementId = createRes.body._id;

      // Delete the metric (should hard-delete the achievement)
      const deleteMetricRes = await request(app)
        .delete(`/gamification/engine/metrics/${metricId}`);
      expect(deleteMetricRes.status).toBe(200);

      // Verify achievement status is DELETED
      const getRes = await request(app)
        .get(`/gamification/engine/achievements/${achievementId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty('status', 'DELETED');
    });
  });

  describe('GET /gamification/engine/achievements', () => {
    it('should retrieve all game achievements', async () => {
      const res = await request(app).get('/gamification/engine/achievements');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /gamification/engine/achievements/:achievementId', () => {
    it('should retrieve a specific game achievement', async () => {
      //create a metric to use in the achievement.
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      // now create an achievement using that metric.
      const achievementBody = {
        name: 'Test Achievement',
        description: 'This is a test achievement',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 10,
      };

      const createRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);

      expect(createRes.status).toBe(201);
      const achievementId = createRes.body._id;

      const res = await request(app).get(
        `/gamification/engine/achievements/${achievementId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', achievementId);
    });

    it('should return 400 for invalid achievement ID', async () => {
      const res = await request(app).get(
        '/gamification/engine/achievements/invalidAchievementId',
      );

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent achievement', async () => {
      const res = await request(app).get(
        '/gamification/engine/achievements/6862b8b8705094efb275a981',
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /gamification/engine/achievements', () => {
    it('should update a game achievement', async () => {
      //create a metric to use in the achievement.
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      // now create an achievement using that metric.
      const achievementBody = {
        name: 'Test Achievement',
        description: 'This is a test achievement',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 10,
      };

      const createRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);

      expect(createRes.status).toBe(201);
      const achievementId = createRes.body._id;

      // update the achievement.
      const updateBody = {
        achievementId: achievementId,
        name: 'Updated Test Achievement',
        description: 'This is an updated test achievement',
        badgeUrl: 'http://example.com/updated-badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 20,
      };

      const res = await request(app)
        .put('/gamification/engine/achievements')
        .send(updateBody);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent achievement', async () => {
      const updateBody = {
        achievementId: '6862b8b8705094efb275a981',
        name: 'Non-existent Achievement',
        description: 'This achievement does not exist',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: '6862b8b8705094efb275a981',
        metricCount: 10,
      };

      const res = await request(app)
        .put('/gamification/engine/achievements')
        .send(updateBody);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /gamification/engine/achievements/:achievementId', () => {
    it('should delete a game achievement', async () => {
      // first create a metric to use in the achievement.
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      // now create an achievement using that metric.
      const achievementBody = {
        name: 'Test Achievement',
        description: 'This is a test achievement',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 10,
      };

      const createRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);

      expect(createRes.status).toBe(201);
      const achievementId = createRes.body._id;

      const res = await request(app).delete(
        `/gamification/engine/achievements/${achievementId}`,
      );

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent achievement', async () => {
      const res = await request(app).delete(
        '/gamification/engine/achievements/6862b8b8705094efb275a981',
      );

      expect(res.status).toBe(404);
    });
  });

  describe('POST /gamification/engine/user/metrics', () => {
    it('should create a user metric', async () => {
      // first create a metric to use in the user metric.
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      const userMetricBody = {
        userId: userId,
        metricId: metricId, // This should be a valid metric ID.
        value: 100,
        lastUpdated: '',
      };
      const res = await request(app)
        .post('/gamification/engine/user/metrics')
        .send(userMetricBody);
      expect(res.status).toBe(201);
    });

    it('should return 400 for invalid payload', async () => {
      const invalidUserMetricBody = {
        userId: userId,
        metricId: 'invalidMetricId',
        value: 'notANumber', // Invalid value type
      };

      const res = await request(app)
        .post('/gamification/engine/user/metrics')
        .send(invalidUserMetricBody);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent metric', async () => {
      const userMetricBody = {
        userId: userId,
        metricId: '6862b8b8705094efb275a981', // This should be a valid metric ID.
        value: 100,
        lastUpdated: '',
      };

      const res = await request(app)
        .post('/gamification/engine/user/metrics')
        .send(userMetricBody);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /gamification/engine/user/metrics', () => {
    it('should retrieve all user metrics', async () => {
      //create a metric to use in the user metric.

      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      const metricId = metricRes.body._id;

      const userMetric = {
        userId: userId,
        metricId: metricId,
        value: 100,
        lastUpdated: '',
      };

      await request(app)
        .post('/gamification/engine/user/metrics')
        .send(userMetric);

      const res = await request(app).get(
        `/gamification/engine/user/${userId}/metrics/`,
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app).get(
        '/gamification/engine/user/invalidUserId/metrics/',
      );

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /gamification/engine/usermetrics', () => {
    it('should update a user metric', async () => {
      //create a metric to use in the user metric.
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(metricRes.status).toBe(201);
      const metricId = metricRes.body._id;

      // now create a user metric using that metric.
      const userMetricBody = {
        userId: userId,
        metricId: metricId,
        value: 100,
        lastUpdated: '',
      };

      const createRes = await request(app)
        .post('/gamification/engine/user/metrics')
        .send(userMetricBody);

      expect(createRes.status).toBe(201);
      const userMetricId = createRes.body._id;

      // update the user metric.
      const updateBody = {
        _id: userMetricId,
        userId: userId,
        metricId: metricId,
        value: 200, // Updated value
        lastUpdated: '',
      };

      const res = await request(app)
        .put('/gamification/engine/user/metrics')
        .send(updateBody);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent user metric', async () => {
      const updateBody = {
        _id: '6862b8b8705094efb275a981',
        userId: userId,
        metricId: '6862b8b8705094efb275a981',
        value: 200,
        lastUpdated: '',
      };

      const res = await request(app)
        .put('/gamification/engine/user/metrics')
        .send(updateBody);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /gamification/trigger/metric', () => {
    it('should trigger a metric update', async () => {
      const metricBody = {
        name: 'Test Metric',
        description: 'This is a test metric',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(metricBody);

      expect(metricRes.status).toBe(201);

      const achievementBody = {
        name: 'Test Achievement',
        description: 'This is a test achievement',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: metricRes.body._id,
        metricCount: 5,
      };

      const metricId = metricRes.body._id;

      const triggerBody = {
        userId: userId,
        metrics: [
          {
            metricId: metricId,
            incrementValue: 10,
          },
        ],
      };

      const res = await request(app)
        .post('/gamification/trigger/metric')
        .send(triggerBody);

      expect(res.status).toBe(200);
    });
  });
});
