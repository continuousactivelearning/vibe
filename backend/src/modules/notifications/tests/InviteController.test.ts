import 'reflect-metadata';
import Express from 'express';
import { RoutingControllersOptions, useExpressServer } from 'routing-controllers';
import { fa, faker } from '@faker-js/faker';
import { MailService, notificationsModuleOptions, setupNotificationsContainer } from '../index.js';
import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { InviteBody } from '../classes/validators/InviteValidators.js';
import { createCourse, createVersion } from '#root/modules/courses/tests/utils/creationFunctions.js';
import { coursesModuleControllers } from '#root/modules/courses/index.js';

describe('InviteController', () => {
  let app: any;
  let courseId: string;
  let version: any;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    setupNotificationsContainer();
    vi.spyOn(MailService.prototype, 'sendMail').mockResolvedValue({
    accepted: [faker.internet.email(), faker.internet.email(), faker.internet.email()],
    rejected: [],
    envelope: {},
    messageId: 'mocked-message-id',
    response: '250 OK: message queued',
  });
    app = Express();
    const options: RoutingControllersOptions = {
      controllers: [...(notificationsModuleOptions.controllers as Function[]),...(coursesModuleControllers as Function[])],
      authorizationChecker: async () => true,
      defaultErrorHandler: true,
      validation: true,
    };
    useExpressServer(app, options);
    const course = await createCourse(app);
    courseId = course._id.toString();
    version = await createVersion(app, courseId);
  }, 900000);
  // Helper to create valid invite body
  function createInviteBody(email?: string, role?: any): InviteBody {
    return {
      inviteData: [
        {
          email: email || faker.internet.email(),
          role: role || 'STUDENT', // Default to 'student' if not provided
        },
        {
          email: email || faker.internet.email(),
          role: role || 'STUDENT', // Default to 'student' if not provided
        },
        {
          email: email || faker.internet.email(),
          role: role || 'STUDENT', // Default to 'student' if not provided
        },
      ],
    };
  }
  async function createInvite() {
    const body = createInviteBody();
    const res = await request(app)
      .post(`/notifications/invite/courses/${courseId}/versions/${version._id.toString()}`)
      .send(body);
    return res;
  }

  describe('POST /notifications/invite/courses/:courseId/versions/:courseVersionId', () => {
    it('should invite users with valid data', async () => {
      const res = await createInvite();
      expect(res.status).toBe(200);
      expect(res.body.invites).toBeInstanceOf(Array);
      expect(res.body.invites[0]).toHaveProperty('email');
      expect(res.body.invites[0]).toHaveProperty('inviteStatus');
    });

    it('should fail with invalid email', async () => {
      const body = createInviteBody('not-an-email');
      const res = await request(app)
        .post(`/notifications/invite/courses/${courseId}/versions/${version._id.toString()}`)
        .send(body);
      expect(res.status).toBe(400);
    });

    it('should fail with missing inviteData', async () => {
      const res = await request(app)
        .post(`/notifications/invite/courses/${courseId}/versions/${version._id.toString()}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /notifications/invite/courses/:courseId/versions/:courseVersionId', () => {
    it('should get invites for a course version', async () => {
      const res = await request(app)
        .get(`/notifications/invite/courses/${courseId}/versions/${version._id.toString()}`);
      expect(res.status).toBe(200);
      expect(res.body.invites).toBeInstanceOf(Array);
      console.log(res.body)
    });
  });

  describe('GET /notifications/invite/:inviteId', () => {
    it('should process invite with valid inviteId', async () => {
      // You may need to create an invite first and get its ID
      const inviteResponse = await createInvite();
      const inviteId = inviteResponse.body.invites[0].inviteId;
      const res = await request(app).get(`/notifications/invite/${inviteId}`);
      expect(res.status).toBe(200);
    });

    it('should fail with invalid inviteId', async () => {
      const res = await request(app).get('/notifications/invite/invalid-id');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /notifications/invite/resend/:inviteId', () => {
    it('should resend invite with valid inviteId', async () => {
      const inviteResponse = await createInvite();
      const inviteId = inviteResponse.body.invites[0].inviteId;
      const res = await request(app).post(`/notifications/invite/resend/${inviteId}`);
      expect(res.status).toBe(200);
    });

    it('should fail to resend with invalid inviteId', async () => {
      const res = await request(app).post('/notifications/invite/resend/invalid-id');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /notifications/invite/cancel/:inviteId', () => {
    it('should cancel invite with valid inviteId', async () => {
      const inviteResponse = await createInvite();
      const inviteId = inviteResponse.body.invites[0].inviteId;
      const res = await request(app).post(`/notifications/invite/cancel/${inviteId}`);
      expect(res.status).toBe(200);
    });

    it('should fail to cancel with invalid inviteId', async () => {
      const res = await request(app).post('/notifications/invite/cancel/invalid-id');
      expect(res.status).toBe(400);
    });
  });
});