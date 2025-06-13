import request from 'supertest';
import {app} from '../testServer';
import {Container} from 'typedi';

describe('POST /courses/versions/:versionId/modules/:moduleId/sections/:sectionId/items', () => {
  beforeAll(() => {
    // mock CourseRepo dependency
    Container.set('CourseRepo', {
      readVersion: jest.fn().mockResolvedValue({
        modules: [
          {
            moduleId: 'm1',
            sections: [
              {
                sectionId: 's1',
                itemsGroupId: 'g1',
                updatedAt: null,
              },
            ],
            updatedAt: null,
          },
        ],
        updatedAt: null,
      }),
      readItemsGroup: jest.fn().mockResolvedValue({items: []}),
      updateItemsGroup: jest.fn().mockResolvedValue({}),
      updateVersion: jest.fn().mockResolvedValue({}),
    });
  });

  it('should create an item successfully', async () => {
    const response = await request(app)
      .post('/courses/versions/v1/modules/m1/sections/s1/items')
      .send({
        itemId: 'item-1',
        isParameterized: false,
        questionText: 'What is 2 + 2?',
        explanation: 'Simple math',
        choices: ['2', '4'],
        correctChoices: ['4'],
        type: 'mcq',
        bloomLevel: 'remember',
        marks: 1,
        metadata: {},
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('itemsGroup');
  });
});
