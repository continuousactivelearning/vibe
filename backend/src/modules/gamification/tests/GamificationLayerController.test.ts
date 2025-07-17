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
import {gamificationModuleOptions} from '../index.js';
import {usersContainerModule} from '#root/modules/users/container.js';
import {authContainerModule} from '#root/modules/auth/container.js';
import {authModuleOptions} from '#root/modules/auth/index.js';
import {InversifyAdapter} from '#root/inversify-adapter.js';
import {FirebaseAuthService} from '#root/modules/auth/services/FirebaseAuthService.js';

describe('GamifyLayerController', () => {
  const appInstance = Express();
  let app: any;
  let userId: string;
  let adminToken: string;
  let instructorToken: string;
  let userToken: string;

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

    const options: RoutingControllersOptions = {
      controllers: [
        ...(gamificationModuleOptions.controllers as Function[]),
        ...(authModuleOptions.controllers as Function[]),
      ],
      authorizationChecker: async (action, roles) => {
        const token = action.request.headers['authorization']?.split(' ')[1];
        
        // Admin can access everything
        if (token?.includes('admin')) return true;
        
        // Instructor can access everything except some admin-only endpoints
        if (token?.includes('instructor')) {
          // If the endpoint specifically requires admin, deny access
          if (roles.includes('admin') && !roles.includes('instructor')) {
            return false;
          }
          return true;
        }
        
        // Users can only access user-permitted endpoints
        if (token?.includes('user')) {
          // Explicit check for eventtrigger endpoint which should allow users
          if (action.request.url.includes('eventtrigger')) {
            return true;
          }
          // For other endpoints, check if 'user' role is allowed
          return roles.includes('user');
        }
        
        return false;
      },
      currentUserChecker: async () => {
        return userId
          ? {
              _id: userId,
              email: 'test_user@example.com',
              name: 'Test User',
              roles: ['user'],
            }
          : null;
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

  describe('POST /gamification/events', () => {
    it('should create a new event (admin)', async () => {
      const eventBody = {
        eventName: 'Test Event',
        eventDescription: 'This is a test event',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
          timeTaken: 'number',
        },
      };

      const res = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('eventName', eventBody.eventName);
    });

    it('should create a new event (instructor)', async () => {
      const eventBody = {
        eventName: 'Instructor Event',
        eventDescription: 'Created by instructor',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const res = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(eventBody);

      expect(res.status).toBe(201);
    });

    it('should return 403 for unauthorized role (user)', async () => {
      const eventBody = {
        eventName: 'User Event',
        eventDescription: 'Should not be allowed',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const res = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send(eventBody);

      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid payload', async () => {
      const invalidEventBody = {
        eventName: '', // Empty name
        eventDescription: 'Invalid event',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'invalid-type', // Invalid type
        },
      };

      const res = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidEventBody);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /gamification/events', () => {
    beforeAll(async () => {
      const eventBody = {
        eventName: 'Get Events Test Event',
        eventDescription: 'For get events testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);
    });

    it('should retrieve all events (admin)', async () => {
      const res = await request(app)
        .get('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should retrieve all events (instructor)', async () => {
      const res = await request(app)
        .get('/gamification/events')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 403 for unauthorized role (user)', async () => {
      const res = await request(app)
        .get('/gamification/events')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /gamification/events/:eventId', () => {
    let eventId: string;

    beforeAll(async () => {
      const eventBody = {
        eventName: 'Update Event Test',
        eventDescription: 'For update event testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const res = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      eventId = res.body._id;
    });

    it('should update an event (admin)', async () => {
      const updateBody = {
        eventName: 'Updated Event Name',
        eventDescription: 'Updated event description',
        eventVersion: '2.0.0',
        eventPayload: {
          score: 'number',
          bonus: 'number',
        },
      };

      const res = await request(app)
        .put(`/gamification/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', true);
    });

    it('should return 400 for invalid update payload', async () => {
      const invalidUpdateBody = {
        eventName: '',
        eventDescription: 'Invalid update',
        eventVersion: 'x.x.x',
        eventPayload: {}, // empty payload
      };

      const res = await request(app)
        .put(`/gamification/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdateBody);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = new ObjectId().toString();
      const updateBody = {
        eventName: 'Non-existent Event',
        eventDescription: 'Should fail',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const res = await request(app)
        .put(`/gamification/events/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateBody);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /gamification/events/:eventId', () => {
    let eventId: string;

    beforeEach(async () => {
      const eventBody = {
        eventName: 'Delete Event Test',
        eventDescription: 'For delete event testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const res = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      eventId = res.body._id;
    });

    it('should delete an event (admin)', async () => {
      const res = await request(app)
        .delete(`/gamification/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 400 for invalid event ID', async () => {
      const res = await request(app)
        .delete('/gamification/events/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = new ObjectId().toString();
      const res = await request(app)
        .delete(`/gamification/events/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });


  describe('POST /gamification/rules', () => {
    let eventId: string;

    beforeAll(async () => {
      const eventBody = {
        eventName: 'Rule Test Event',
        eventDescription: 'For rule testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const res = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      eventId = res.body._id;
    });

    it('should create a new rule (admin)', async () => {
      const ruleBody = {
        ruleName: 'Test Rule',
        ruleDescription: 'This is a test rule',
        eventId: eventId,
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 80',
          action: 'incrementMetric',
        },
        ruleVersion: 1,
      };

      const res = await request(app)
        .post('/gamification/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ruleBody);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('ruleName', ruleBody.ruleName);
    });

    it('should return 400 for invalid rule payload', async () => {
      const invalidRuleBody = {
        ruleName: '', // Empty name
        ruleDescription: 'Invalid rule',
        eventId: 'invalid-id',
        metricId: 'invalid-id',
        logic: {},
        ruleVersion: 'not-a-number',
      };

      const res = await request(app)
        .post('/gamification/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidRuleBody);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentEventId = new ObjectId().toString();
      const ruleBody = {
        ruleName: 'Non-existent Event Rule',
        ruleDescription: 'Should fail',
        eventId: nonExistentEventId,
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 80',
          action: 'incrementMetric',
        },
        ruleVersion: 1,
      };

      const res = await request(app)
        .post('/gamification/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ruleBody);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /gamification/rules/:eventId', () => {
    let eventId: string;
    let ruleId: string;

    beforeAll(async () => {
      const eventBody = {
        eventName: 'Get Rules Test Event',
        eventDescription: 'For get rules testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number'
        },
      };

      const eventRes = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      eventId = eventRes.body._id;

      const ruleBody = {
        ruleName: 'Get Rules Test Rule',
        ruleDescription: 'For get rules testing',
        eventId: eventId,
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 80',
          action: 'incrementMetric',
        },
        ruleVersion: 1,
      };

      const ruleRes = await request(app)
        .post('/gamification/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ruleBody);

      ruleId = ruleRes.body._id;
    });

    it('should retrieve rules for an event (admin)', async () => {
      const res = await request(app)
        .get(`/gamification/rules/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should retrieve rules for an event (instructor)', async () => {
      const res = await request(app)
        .get(`/gamification/rules/${eventId}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for unauthorized role (user)', async () => {
      const res = await request(app)
        .get(`/gamification/rules/${eventId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid event ID', async () => {
      const res = await request(app)
        .get('/gamification/rules/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = new ObjectId().toString();
      const res = await request(app)
        .get(`/gamification/rules/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /gamification/rule/:ruleId', () => {
    let ruleId: string;

    beforeAll(async () => {
      const eventBody = {
        eventName: 'Get Rule Test Event',
        eventDescription: 'For get rule testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const eventRes = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      const eventId = eventRes.body._id;

      const ruleBody = {
        ruleName: 'Get Rule Test Rule',
        ruleDescription: 'For get rule testing',
        eventId: eventId,
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 80',
          action: 'incrementMetric',
        },
        ruleVersion: 1,
      };

      const ruleRes = await request(app)
        .post('/gamification/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ruleBody);

      ruleId = ruleRes.body._id;
    });

    it('should retrieve a specific rule (admin)', async () => {
      const res = await request(app)
        .get(`/gamification/rule/${ruleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', ruleId);
    });

    it('should return 400 for invalid rule ID', async () => {
      const res = await request(app)
        .get('/gamification/rule/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent rule', async () => {
      const nonExistentId = new ObjectId().toString();
      const res = await request(app)
        .get(`/gamification/rule/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /gamification/rule', () => {
    let ruleId: string;

    beforeAll(async () => {
      const eventBody = {
        eventName: 'Update Rule Test Event',
        eventDescription: 'For update rule testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const eventRes = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      const eventId = eventRes.body._id;

      const ruleBody = {
        ruleName: 'Update Rule Test Rule',
        ruleDescription: 'For update rule testing',
        eventId: eventId,
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 80',
          action: 'incrementMetric',
        },
        ruleVersion: 1,
      };

      const ruleRes = await request(app)
        .post('/gamification/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ruleBody);

      ruleId = ruleRes.body._id;
    });

    it('should update a rule (admin)', async () => {
      const updateBody = {
        ruleId: ruleId,
        ruleName: 'Updated Rule Name',
        ruleDescription: 'Updated description',
        eventId: new ObjectId().toString(),
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 90',
          action: 'incrementMetric',
        },
        ruleVersion: 2,
      };

      const res = await request(app)
        .put('/gamification/rule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', true);
    });

    it('should return 400 for invalid update payload', async () => {
      const invalidUpdateBody = {
        ruleId: 'invalid-id',
        ruleName: '',
        ruleDescription: 'Invalid update',
        eventId: 'invalid-id',
        metricId: 'invalid-id',
        logic: {},
        ruleVersion: 'not-a-number',
      };

      const res = await request(app)
        .put('/gamification/rule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdateBody);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent rule', async () => {
      const nonExistentId = new ObjectId().toString();
      const updateBody = {
        ruleId: nonExistentId,
        ruleName: 'Non-existent Rule',
        ruleDescription: 'Should fail',
        eventId: new ObjectId().toString(),
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 90',
          action: 'incrementMetric',
        },
        ruleVersion: 2,
      };

      const res = await request(app)
        .put('/gamification/rule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateBody);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /gamification/rule/:ruleId', () => {
    let ruleId: string;

    beforeEach(async () => {
      const eventBody = {
        eventName: 'Delete Rule Test Event',
        eventDescription: 'For delete rule testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
        },
      };

      const eventRes = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      const eventId = eventRes.body._id;

      const ruleBody = {
        ruleName: 'Delete Rule Test Rule',
        ruleDescription: 'For delete rule testing',
        eventId: eventId,
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 80',
          action: 'incrementMetric',
        },
        ruleVersion: 1,
      };

      const ruleRes = await request(app)
        .post('/gamification/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ruleBody);

      ruleId = ruleRes.body._id;
    });

    it('should delete a rule (admin)', async () => {
      const res = await request(app)
        .delete(`/gamification/rule/${ruleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 400 for invalid rule ID', async () => {
      const res = await request(app)
        .delete('/gamification/rule/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent rule', async () => {
      const nonExistentId = new ObjectId().toString();
      const res = await request(app)
        .delete(`/gamification/rule/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /gamification/eventtrigger', () => {
    let eventId: string;
    let ruleId: string;

    beforeAll(async () => {
      const eventBody = {
        eventName: 'Trigger Test Event',
        eventDescription: 'For trigger testing',
        eventVersion: '1.0.0',
        eventPayload: {
          score: 'number',
          timeTaken: 'number',
        },
      };

      const eventRes = await request(app)
        .post('/gamification/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventBody);

      eventId = eventRes.body._id;

      // Create a rule for the event
      const ruleBody = {
        ruleName: 'Trigger Test Rule',
        ruleDescription: 'For trigger testing',
        eventId: eventId,
        metricId: new ObjectId().toString(),
        logic: {
          condition: 'score > 80',
          action: 'incrementMetric',
        },
        ruleVersion: 1,
      };

      const ruleRes = await request(app)
        .post('/gamification/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ruleBody);

      ruleId = ruleRes.body._id;
    });

    it('should trigger an event (user)', async () => {
      const triggerBody = {
      userId: userId,
      eventId: eventId,
      eventPayload: {
      score: 90,
      timeTaken: 100,
    },
  };
    

      const res = await request(app)
        .post('/gamification/eventtrigger')
        .set('Authorization', `Bearer ${userToken}`)
        .send(triggerBody);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });

    it('should trigger an event (admin)', async () => {
      const triggerBody = {
      userId: userId,
      eventId: eventId,
      eventPayload: {
      score: 90,
      timeTaken: 100,
      },
      
  };
    console.log('Trigger as admin payload:', triggerBody);
      const res = await request(app)
        .post('/gamification/eventtrigger')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(triggerBody);

      console.log(res)
      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid trigger payload', async () => {
      const invalidTriggerBody = {
        userId: 'invalid-id',
        eventId: 'invalid-id',
        eventPayload: {
          score: 'not-a-number',
          timeTaken: 'not-a-number',
        },
      };

      const res = await request(app)
        .post('/gamification/eventtrigger')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidTriggerBody);

      expect(res.status).toBe(400);
    });
    });
  });