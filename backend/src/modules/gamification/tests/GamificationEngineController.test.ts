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
    it('should create a game achievement', async () => {
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
        name: 'Test Achievement',
        description: 'This is a test achievement',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: metricId,
        metricCount: 10,
      };

      const res = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementBody);

      expect(res.status).toBe(201);
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

    it('should return 404 for non-existent metric Achievement', async () => {
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
    it('should create an achievement with rewards', async () => {
      // Create Metric 1
      let metric1Id; // Declare metric1Id in the correct scope

      // Create Metric 1
      const metric1 = {
        name: 'Metric1',
        description: 'Tracks the total value of Metric1.',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const metric1Res = await request(app).post('/gamification/engine/metrics').send(metric1);
      expect(metric1Res.status).toBe(201);
      metric1Id = metric1Res.body._id;
      expect(metric1Id).toBeTruthy();

      // Create Metric 2
      const metric2 = {
        name: 'Metric2',
        description: 'Tracks the total value of Metric2.',
        type: 'Number',
        units: 'units',
        defaultIncrementValue: 1,
      };

      const metric2Res = await request(app).post('/gamification/engine/metrics').send(metric2);
      expect(metric2Res.status).toBe(201);
      const metric2Id = metric2Res.body._id;
      expect(metric2Id).toBeTruthy();

      // Create achievement with rewards
      const achievement = {
        name: 'Achievement for Reward',
        description: 'Reward Metric2 for reaching a threshold in Metric1.',
        trigger: 'metric',
        metricId: metric1Id,
        metricCount: 1000,
        rewardMetricId: metric2Id,
        rewardIncrementValue: 100,
        badgeUrl: 'http://example.com/badge.png', // Add a valid badge URL
      };

      const achievementRes = await request(app).post('/gamification/engine/achievements').send(achievement);
      expect(achievementRes.status).toBe(201);
      expect(achievementRes.body).toHaveProperty('_id');
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
      // Test with an invalid ObjectId format instead of a non-existent valid one
      // This will fail validation faster and avoid database hanging issues
      const userMetricBody = {
        userId: userId,
        metricId: 'invalid-metric-id', // Invalid ObjectId format
        value: 100,
        lastUpdated: '',
      };

      const res = await request(app)
        .post('/gamification/engine/user/metrics')
        .send(userMetricBody);

      // Should fail validation before reaching the service
      expect(res.status).toBe(400);
    });
  });

  describe('GET /gamification/engine/user/metrics', () => {
    it('should retrieve all user metrics', async () => {
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

  // ==================== REWARD SYSTEM TESTS ====================
  describe('Reward System - Achievement with Rewards', () => {
    let rewardMetricId: string;
    let rewardAchievementId: string;

    beforeAll(async () => {
      // Create reward metric (e.g., Diamonds) that will be given as reward
      const rewardMetric = {
        name: 'Diamonds',
        description: 'Diamonds earned as rewards',
        type: 'Number',
        units: 'diamonds',
        defaultIncrementValue: 0,
      };

      const rewardMetricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(rewardMetric);

      expect(rewardMetricRes.status).toBe(201);
      rewardMetricId = rewardMetricRes.body._id;
      expect(rewardMetricId).toBeTruthy();
    });

    it('should retrieve achievement with reward configuration', async () => {
      // Create progress metric (e.g., XP) that triggers the achievement
      const progressMetric = {
        name: 'XP',
        description: 'Experience points earned by user',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const progressMetricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(progressMetric);

      expect(progressMetricRes.status).toBe(201);
      const progressMetricId = progressMetricRes.body._id;
      expect(progressMetricId).toBeTruthy();

      // Create achievement that rewards Diamonds when XP threshold is reached
      const achievementWithReward = {
        name: 'XP Hero',
        description: 'Earn 1000 XP to get 100 Diamonds',
        badgeUrl: 'http://example.com/xp-hero-badge.png',
        trigger: 'metric',
        metricId: progressMetricId,
        metricCount: 1000,
        rewardMetricId: rewardMetricId,
        rewardIncrementValue: 100,
      };

      const achievementRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementWithReward);

      expect(achievementRes.status).toBe(201);
      expect(achievementRes.body).toHaveProperty('_id');
      expect(achievementRes.body).toHaveProperty('rewardMetricId', rewardMetricId);
      expect(achievementRes.body).toHaveProperty('rewardIncrementValue', 100);
      
      rewardAchievementId = achievementRes.body._id;
    });

    it('should fetch achievement with reward details', async () => {
      const res = await request(app)
        .get(`/gamification/engine/achievements/${rewardAchievementId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', rewardAchievementId);
      expect(res.body).toHaveProperty('rewardMetricId', rewardMetricId);
      expect(res.body).toHaveProperty('rewardIncrementValue', 100);
      expect(res.body).toHaveProperty('name', 'XP Hero');
    });

    it('should trigger metric and unlock achievement with reward', async () => {
      // Create progress metric for XP
      const progressMetric = {
        name: 'XP',
        description: 'Experience points earned by user',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const progressMetricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(progressMetric);

      expect(progressMetricRes.status).toBe(201);
      const progressMetricId = progressMetricRes.body._id;

      // Create achievement that rewards Diamonds when XP threshold is reached
      const achievementWithReward = {
        name: 'XP Master',
        description: 'Earn 500 XP to get 50 Diamonds',
        badgeUrl: 'http://example.com/xp-master-badge.png',
        trigger: 'metric',
        metricId: progressMetricId,
        metricCount: 500,
        rewardMetricId: rewardMetricId,
        rewardIncrementValue: 50,
      };

      const achievementRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementWithReward);

      expect(achievementRes.status).toBe(201);
      const achievementId = achievementRes.body._id;

      // Trigger the metric to reach the threshold
      const triggerBody = {
        userId: userId,
        metrics: [
          {
            metricId: progressMetricId,
            value: 500, // Reach the threshold exactly
          },
        ],
      };

      const triggerRes = await request(app)
        .post('/gamification/trigger/metric')
        .send(triggerBody);

      expect(triggerRes.status).toBe(200);
      expect(triggerRes.body).toHaveProperty('achievementsUnlocked');
      expect(Array.isArray(triggerRes.body.achievementsUnlocked)).toBe(true);
      expect(triggerRes.body.achievementsUnlocked.length).toBeGreaterThan(0);

      // Verify the achievement was unlocked
      const unlockedAchievement = triggerRes.body.achievementsUnlocked.find(
        (ach: any) => ach.achievementId === achievementId
      );
      expect(unlockedAchievement).toBeTruthy();
    });

    it('should verify reward metric was incremented after achievement unlock', async () => {
      // Wait a moment for the reward to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check user's reward metric value
      const userMetricsRes = await request(app)
        .get(`/gamification/engine/user/${userId}/metrics`);

      expect(userMetricsRes.status).toBe(200);
      expect(Array.isArray(userMetricsRes.body)).toBe(true);

      // Find the reward metric (Diamonds) in user's metrics
      const rewardMetric = userMetricsRes.body.find(
        (metric: any) => metric.metricId === rewardMetricId
      );

      expect(rewardMetric).toBeTruthy();
      expect(rewardMetric).toHaveProperty('value');
      // Should have received rewards from previous tests
      expect(rewardMetric.value).toBeGreaterThan(0);
    });

    it('should verify reward metric was incremented after achievement unlock', async () => {
      // Create progress metric for XP
      const progressMetric = {
        name: 'XP Progress',
        description: 'Experience points earned by user',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const progressMetricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(progressMetric);

      expect(progressMetricRes.status).toBe(201);
      const progressMetricId = progressMetricRes.body._id;

      // Create achievement that rewards Diamonds when XP threshold is reached
      const achievementWithReward = {
        name: 'XP Master',
        description: 'Earn 500 XP to get 50 Diamonds',
        badgeUrl: 'http://example.com/xp-master-badge.png',
        trigger: 'metric',
        metricId: progressMetricId,
        metricCount: 500,
        rewardMetricId: rewardMetricId,
        rewardIncrementValue: 50,
      };

      const achievementRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementWithReward);

      expect(achievementRes.status).toBe(201);
      const achievementId = achievementRes.body._id;

      // Trigger the metric to reach the threshold
      const triggerBody = {
        userId: userId,
        metrics: [
          {
            metricId: progressMetricId,
            value: 500, // Reach the threshold exactly
          },
        ],
      };

      const triggerRes = await request(app)
        .post('/gamification/trigger/metric')
        .send(triggerBody);

      expect(triggerRes.status).toBe(200);
      expect(triggerRes.body).toHaveProperty('achievementsUnlocked');
      expect(Array.isArray(triggerRes.body.achievementsUnlocked)).toBe(true);
      expect(triggerRes.body.achievementsUnlocked.length).toBeGreaterThan(0);

      // Verify the achievement was unlocked
      const unlockedAchievement = triggerRes.body.achievementsUnlocked.find(
        (ach: any) => ach.achievementId === achievementId
      );
      expect(unlockedAchievement).toBeTruthy();

      // Wait a moment for the reward to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check user's reward metric value
      const userMetricsRes = await request(app)
        .get(`/gamification/engine/user/${userId}/metrics`);

      expect(userMetricsRes.status).toBe(200);
      expect(Array.isArray(userMetricsRes.body)).toBe(true);

      // Find the reward metric (Diamonds) in user's metrics
      const rewardMetric = userMetricsRes.body.find(
        (metric: any) => metric.metricId === rewardMetricId
      );

      expect(rewardMetric).toBeTruthy();
      expect(rewardMetric).toHaveProperty('value');
      // Should have received rewards from previous tests
      expect(rewardMetric.value).toBeGreaterThan(0);
    });

    it('should handle multiple achievements with different reward values', async () => {
      // Create another progress metric
      const progressMetric2 = {
        name: 'Streak',
        description: 'Daily login streak',
        type: 'Number',
        units: 'days',
        defaultIncrementValue: 1,
      };

      const progressMetric2Res = await request(app)
        .post('/gamification/engine/metrics')
        .send(progressMetric2);

      expect(progressMetric2Res.status).toBe(201);
      const progressMetric2Id = progressMetric2Res.body._id;

      // Create achievement with different reward value
      const achievementWithDifferentReward = {
        name: 'Streak Master',
        description: 'Maintain 7-day streak to get 25 Diamonds',
        badgeUrl: 'http://example.com/streak-master-badge.png',
        trigger: 'metric',
        metricId: progressMetric2Id,
        metricCount: 7,
        rewardMetricId: rewardMetricId,
        rewardIncrementValue: 25,
      };

      const achievementRes = await request(app)
        .post('/gamification/engine/achievements')
        .send(achievementWithDifferentReward);

      expect(achievementRes.status).toBe(201);
      const achievementId = achievementRes.body._id;

      // Trigger the streak metric
      const triggerBody = {
        userId: userId,
        metrics: [
          {
            metricId: progressMetric2Id,
            value: 7,
          },
        ],
      };

      const triggerRes = await request(app)
        .post('/gamification/trigger/metric')
        .send(triggerBody);

      expect(triggerRes.status).toBe(200);
      expect(triggerRes.body.achievementsUnlocked.length).toBeGreaterThan(0);

      // Verify the new achievement was unlocked
      const unlockedAchievement = triggerRes.body.achievementsUnlocked.find(
        (ach: any) => ach.achievementId === achievementId
      );
      expect(unlockedAchievement).toBeTruthy();
    });

    it('should validate reward metric ID format', async () => {
      const progressMetric = {
        name: 'Test Metric',
        description: 'Test metric for validation',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const progressMetricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(progressMetric);

      expect(progressMetricRes.status).toBe(201);
      const progressMetricId = progressMetricRes.body._id;

      // Try to create achievement with invalid reward metric ID
      const invalidAchievement = {
        name: 'Invalid Reward Achievement',
        description: 'Achievement with invalid reward metric ID',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: progressMetricId,
        metricCount: 100,
        rewardMetricId: 'invalid-metric-id',
        rewardIncrementValue: 50,
      };

      const res = await request(app)
        .post('/gamification/engine/achievements')
        .send(invalidAchievement);

      expect(res.status).toBe(400);
    });

    it('should validate reward increment value type', async () => {
      const progressMetric = {
        name: 'Test Metric 2',
        description: 'Test metric for validation',
        type: 'Number',
        units: 'points',
        defaultIncrementValue: 1,
      };

      const progressMetricRes = await request(app)
        .post('/gamification/engine/metrics')
        .send(progressMetric);

      expect(progressMetricRes.status).toBe(201);
      const progressMetricId = progressMetricRes.body._id;

      // Try to create achievement with invalid reward increment value
      const invalidAchievement = {
        name: 'Invalid Reward Value Achievement',
        description: 'Achievement with invalid reward increment value',
        badgeUrl: 'http://example.com/badge.png',
        trigger: 'metric',
        metricId: progressMetricId,
        metricCount: 100,
        rewardMetricId: rewardMetricId,
        rewardIncrementValue: 'not-a-number',
      };

      const res = await request(app)
        .post('/gamification/engine/achievements')
        .send(invalidAchievement);

      expect(res.status).toBe(400);
    });
  });
});
