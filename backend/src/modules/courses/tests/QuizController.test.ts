import 'reflect-metadata';
import request from 'supertest';
import {createExpressServer} from 'routing-controllers';
import {QuizController} from '../controllers/QuizController';

const app = createExpressServer({
  controllers: [QuizController],
});

describe('POST /quizzes/:quizId/questions', () => {
  const baseUrl = '/quizzes/quiz123/questions';

  it('should return 200 for valid request', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({
        questionType: 'OTL',
        questionText: 'Order the following: <QParam>a</QParam>',
        hintText: 'Order correctly',
        difficulty: 2,
        isParameterized: true,
        parameters: {
          parameterName: 'a',
          allowedValued: ['one', 'two'],
        },
        lot: {
          lotId: 'lot1',
          lotItems: [
            {id: 'item1', lotItemText: 'First'},
            {id: 'item2', lotItemText: 'Second'},
          ],
        },
        solution: {
          orders: [
            {itemId: 'item1', order: 1},
            {itemId: 'item2', order: 2},
          ],
        },
        metaDetails: {
          isStudentGenerated: true,
          isAIGenerated: false,
        },
        timeLimit: 60,
        points: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Validated Question Successfully');
  });

  it('should return 400 when QParam is missing in questionText', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({
        questionType: 'OTL',
        questionText: 'This is invalid',
        hintText: 'Missing QParam',
        difficulty: 1,
        isParameterized: true,
        parameters: {
          parameterName: 'a',
          allowedValued: ['one', 'two'],
        },
        lot: {
          lotId: 'lot1',
          lotItems: [{id: 'item1', lotItemText: 'First'}],
        },
        solution: {
          orders: [{itemId: 'item1', order: 1}],
        },
        metaDetails: {
          isStudentGenerated: false,
          isAIGenerated: false,
        },
        timeLimit: 30,
        points: 5,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing.*<QParam>/i);
  });

  it('should return 404 if lotId or lotItems are missing', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({
        questionType: 'OTL',
        questionText: 'Order: <QParam>a</QParam>',
        hintText: '',
        difficulty: 1,
        isParameterized: true,
        parameters: {
          parameterName: 'a',
          allowedValued: ['1'],
        },
        lot: {
          lotId: '',
          lotItems: [],
        },
        solution: {
          orders: [],
        },
        metaDetails: {
          isStudentGenerated: false,
          isAIGenerated: false,
        },
        timeLimit: 30,
        points: 5,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/lotId.*does not exist/i);
  });

  it('should return 409 if itemId in solution is invalid', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({
        questionType: 'OTL',
        questionText: 'Order: <QParam>a</QParam>',
        hintText: '',
        difficulty: 1,
        isParameterized: true,
        parameters: {
          parameterName: 'a',
          allowedValued: ['1'],
        },
        lot: {
          lotId: 'lotX',
          lotItems: [{id: 'item1', lotItemText: 'X'}],
        },
        solution: {
          orders: [
            {itemId: 'item123', order: 1}, // <-- invalid itemId
          ],
        },
        metaDetails: {
          isStudentGenerated: false,
          isAIGenerated: false,
        },
        timeLimit: 30,
        points: 5,
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/item.*missing.*solution/i);
  });
});
