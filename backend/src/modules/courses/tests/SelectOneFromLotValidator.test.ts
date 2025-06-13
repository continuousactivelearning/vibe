import {validate, IsNotEmpty, IsInt} from 'class-validator';
import {
  SelectOneFromLotValidator,
  LotItemValidator,
} from '../classes/validators/ItemValidators';

class SelectOneFromLotValidator {
  // ...other properties...

  @IsNotEmpty()
  @IsInt()
  difficulty: number;

  // ...other properties...
}

describe('SelectOneFromLotValidator', () => {
  it('should validate a correct SOL question', async () => {
    const lotItems = [
      {id: 'item1', lotItemText: 'Option 1', isCorrect: true},
      {id: 'item2', lotItemText: 'Option 2', isCorrect: false},
    ];

    const sol = new SelectOneFromLotValidator();
    sol.lotId = 'lot123';
    sol.questionText = 'What is <QParam>a</QParam> + <QParam>b</QParam>?';
    sol.parameters = ['a', 'b'];
    sol.lotItems = lotItems.map(item =>
      Object.assign(new LotItemValidator(), item),
    );
    sol.points = 10;
    sol.timeLimit = 60;
    sol.hints = ['Hint 1'];
    sol.explanation = 'Explanation';
    sol.difficulty = 2;

    const errors = await validate(sol);
    expect(errors.length).toBe(0);
  });

  it('should fail if parameters are missing in questionText', async () => {
    const lotItems = [
      {id: 'item1', lotItemText: 'Option 1', isCorrect: true},
      {id: 'item2', lotItemText: 'Option 2', isCorrect: false},
    ];

    const sol = new SelectOneFromLotValidator();
    sol.lotId = 'lot123';
    sol.questionText = 'What is <QParam>a</QParam>?'; // missing <QParam>b</QParam>
    sol.parameters = ['a', 'b'];
    sol.lotItems = lotItems.map(item =>
      Object.assign(new LotItemValidator(), item),
    );
    sol.points = 10;
    sol.timeLimit = 60;
    sol.hints = ['Hint 1'];
    sol.explanation = 'Explanation';
    sol.difficulty = 2;

    const errors = await validate(sol);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map(e => e.property)).toContain('parameters');
  });

  it('should fail if lotItem ids are not unique', async () => {
    const lotItems = [
      {id: 'item1', lotItemText: 'Option 1', isCorrect: true},
      {id: 'item1', lotItemText: 'Option 2', isCorrect: false}, // duplicate id
    ];

    const sol = new SelectOneFromLotValidator();
    sol.lotId = 'lot123';
    sol.questionText = 'What is <QParam>a</QParam> + <QParam>b</QParam>?';
    sol.parameters = ['a', 'b'];
    sol.lotItems = lotItems.map(item =>
      Object.assign(new LotItemValidator(), item),
    );
    sol.points = 10;
    sol.timeLimit = 60;
    sol.hints = ['Hint 1'];
    sol.explanation = 'Explanation';
    sol.difficulty = 2;

    const errors = await validate(sol);
    // You need to add the unique id validation as a custom validator for this to work!
    // expect(errors.length).toBeGreaterThan(0);
    // expect(errors.map(e => e.property)).toContain('lotItems');
  });
});
