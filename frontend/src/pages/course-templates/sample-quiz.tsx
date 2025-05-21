import Quiz from './quiz';

// Mock quiz data based on MongoDB schema
const sampleQuiz = {
  _id: 'sample-quiz-id',
  questionVisibility: 0, // Show all questions at a time
  questions: [
    {
      _id: 'q1',
      questionType: 'MCQ',
      questionText: 'What is React?',
      hintText: 'Think about JavaScript libraries for UI development.',
      difficulty: 1,
      lots: [
        {
          _lotId: 'lot1',
          items: [
            {
              _itemId: 'a',
              type: 'text',
              textValue: 'A JavaScript library for building user interfaces'
            },
            {
              _itemId: 'b',
              type: 'text',
              textValue: 'A programming language'
            },
            {
              _itemId: 'c',
              type: 'text',
              textValue: 'A database management system'
            },
            {
              _itemId: 'd',
              type: 'text',
              textValue: 'An operating system'
            }
          ]
        }
      ],
      solution: {
        lotId: 'lot1',
        lotItemId: 'a'
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 60,
      points: 10,
      text: 'What is React?',
      options: [
        'A JavaScript library for building user interfaces',
        'A programming language',
        'A database management system',
        'An operating system'
      ],
      correctAnswer: 'A JavaScript library for building user interfaces'
    },
    {
      _id: 'q2',
      questionType: 'MCQ',
      questionText: 'Which hook is used for side effects in React?',
      hintText: 'Side effects include data fetching, DOM manipulation, etc.',
      difficulty: 2,
      lots: [
        {
          _lotId: 'lot2',
          items: [
            {
              _itemId: 'a',
              type: 'text',
              textValue: 'useEffect'
            },
            {
              _itemId: 'b',
              type: 'text',
              textValue: 'useState'
            },
            {
              _itemId: 'c',
              type: 'text',
              textValue: 'useContext'
            },
            {
              _itemId: 'd',
              type: 'text',
              textValue: 'useReducer'
            }
          ]
        }
      ],
      solution: {
        lotId: 'lot2',
        lotItemId: 'a'
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 45,
      points: 15,
      text: 'Which hook is used for side effects in React?',
      options: ['useEffect', 'useState', 'useContext', 'useReducer'],
      correctAnswer: 'useEffect'
    },
    {
      _id: 'q3',
      questionType: 'MCQ',
      questionText: 'What does JSX stand for?',
      hintText: 'It relates to XML syntax in JavaScript.',
      difficulty: 1,
      lots: [
        {
          _lotId: 'lot3',
          items: [
            {
              _itemId: 'a',
              type: 'text',
              textValue: 'JavaScript XML'
            },
            {
              _itemId: 'b',
              type: 'text',
              textValue: 'JavaScript Extension'
            },
            {
              _itemId: 'c',
              type: 'text',
              textValue: 'JavaScript Syntax'
            },
            {
              _itemId: 'd',
              type: 'text',
              textValue: 'Java Standard XML'
            }
          ]
        }
      ],
      solution: {
        lotId: 'lot3',
        lotItemId: 'a'
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 30,
      points: 10,
      text: 'What does JSX stand for?',
      options: ['JavaScript XML', 'JavaScript Extension', 'JavaScript Syntax', 'Java Standard XML'],
      correctAnswer: 'JavaScript XML'
    },
    {
      _id: 'q4',
      questionType: 'TEXT',
      questionText: `It was breathtaking. Here's a snap:

![Sunrise](https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fHN1bnJpc2V8ZW58MHx8fHwxNjYzMTc3NjI2&ixlib=rb-1.2.1&q=80&w=800)

---

## 🐾 My New Cat`,
      hintText: 'It comes as the second item in the array returned by useState.',
      difficulty: 2,
      lots: [],
      solution: {
        descriptiveSolution: 'setState'
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 60,
      points: 20,
      text: 'What function is used to update state in React functional components?',
      options: [],
      correctAnswer: 'setState'
    },
    {
      _id: 'q5',
      questionType: 'MCQ',
      questionText: 'Which of the following is NOT a feature of React?',
      hintText: 'Think about core features of React versus other frameworks.',
      difficulty: 3,
      lots: [
        {
          _lotId: 'lot5',
          items: [
            {
              _itemId: 'a',
              type: 'text',
              textValue: 'Two-way data binding'
            },
            {
              _itemId: 'b',
              type: 'text',
              textValue: 'Virtual DOM'
            },
            {
              _itemId: 'c',
              type: 'text',
              textValue: 'Component-based architecture'
            },
            {
              _itemId: 'd',
              type: 'text',
              textValue: 'JSX syntax'
            }
          ]
        }
      ],
      solution: {
        lotId: 'lot5',
        lotItemId: 'a'
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 45,
      points: 15,
      text: 'Which of the following is NOT a feature of React?',
      options: ['Two-way data binding', 'Virtual DOM', 'Component-based architecture', 'JSX syntax'],
      correctAnswer: 'Two-way data binding'
    },
    {
      _id: 'q6',
      questionType: 'MSQ',
      questionText: `## Multiple Selection Question
      
Select **all** of the following that are JavaScript frameworks or libraries:

* React is a popular UI library
* Vue provides reactive components
* Angular is maintained by Google 
* Svelte compiles to vanilla JavaScript

![JavaScript Frameworks](https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg)`,
      hintText: 'Think about which options are actually JavaScript frameworks/libraries versus other technologies.',
      difficulty: 2,
      lots: [
        {
          _lotId: 'lot_msq',
          items: [
            { _itemId: 'msq1', type: 'text', textValue: 'React' },
            { _itemId: 'msq2', type: 'text', textValue: 'Django' },
            { _itemId: 'msq3', type: 'text', textValue: 'Vue' },
            { _itemId: 'msq4', type: 'text', textValue: 'Flask' },
            { _itemId: 'msq5', type: 'text', textValue: 'Angular' },
            { _itemId: 'msq6', type: 'text', textValue: 'Svelte' }
          ]
        }
      ],
      solution: {
        lotId: 'lot_msq',
        lotItemIds: ['msq1', 'msq3', 'msq5', 'msq6']
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 90,
      points: 20
    },
    {
      _id: 'q7',
      questionType: 'NUMERICAL',
      questionText: `# Calculating Big O Complexity

Given the following code snippet:

\`\`\`javascript
function mystery(n) {
  let result = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      result += 1;
    }
  }
  return result;
}
\`\`\`

If n = 5, what is the exact number of times \`result += 1\` executes?

Count carefully and enter your numerical answer.`,
      hintText: 'Try tracing through the loops and count each iteration of the inner loop.',
      difficulty: 3,
      lots: [],
      solution: {
        numerical: {
          lowerLimit: 15,
          upperLimit: 15,
          decimalPrecision: 0,
          trueValue: 15
        }
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 120,
      points: 25
    },
    {
      _id: 'q8',
      questionType: 'TEXT',
      questionText: `## Regular Expression Challenge

Create a regex pattern that matches all valid email addresses according to the following rules:

1. Must start with one or more alphanumeric characters, dots, underscores, or hyphens
2. Followed by the @ symbol
3. Followed by one or more alphanumeric characters, dots, or hyphens
4. Must end with a dot followed by 2-4 alphabetic characters

For example: \`example.user-123@domain.com\` is valid.

**Write your regex pattern below:**`,
      hintText: 'Remember to use anchors (^ and $) to match start and end of the string.',
      difficulty: 3,
      lots: [],
      solution: {
        descriptiveSolution: "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,4}$"
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 180,
      points: 30
    },
    {
      _id: 'q9',
      questionType: 'MATCH',
      questionText: `# Match HTTP Status Codes

Match each HTTP status code with its correct description:`,
      hintText: 'Think about common web responses and their meanings.',
      difficulty: 1,
      lots: [
        {
          _lotId: 'lot_match',
          items: [
            { _itemId: 'code200', type: 'text', textValue: '200' },
            { _itemId: 'code301', type: 'text', textValue: '301' },
            { _itemId: 'code404', type: 'text', textValue: '404' },
            { _itemId: 'code500', type: 'text', textValue: '500' },
            { _itemId: 'descOk', type: 'text', textValue: 'OK - Request succeeded' },
            { _itemId: 'descRedir', type: 'text', textValue: 'Moved Permanently - Redirect' },
            { _itemId: 'descNot', type: 'text', textValue: 'Not Found - Resource doesn\'t exist' },
            { _itemId: 'descServ', type: 'text', textValue: 'Internal Server Error' }
          ]
        }
      ],
      solution: {
        lotId: 'lot_match',
        matches: [
          { lotItemIds: ['code200', 'descOk'] },
          { lotItemIds: ['code301', 'descRedir'] },
          { lotItemIds: ['code404', 'descNot'] },
          { lotItemIds: ['code500', 'descServ'] }
        ]
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 90,
      points: 15
    },
    {
      _id: 'q10',
      questionType: 'ORDERING',
      questionText: `## Software Development Lifecycle

Arrange the following phases of the traditional waterfall software development lifecycle in the correct order:

![SDLC](https://miro.medium.com/max/1400/1*0M-Yzd63L-mWiXIxMlQZbg.webp)

*Drag the items to reorder them.*`,
      hintText: 'Think about the logical progression of software development from initial planning to deployment.',
      difficulty: 2,
      lots: [
        {
          _lotId: 'lot_order',
          items: [
            { _itemId: 'ord1', type: 'text', textValue: 'Requirements Analysis' },
            { _itemId: 'ord2', type: 'text', textValue: 'Design' },
            { _itemId: 'ord3', type: 'text', textValue: 'Implementation' },
            { _itemId: 'ord4', type: 'text', textValue: 'Testing' },
            { _itemId: 'ord5', type: 'text', textValue: 'Deployment' },
            { _itemId: 'ord6', type: 'text', textValue: 'Maintenance' }
          ]
        }
      ],
      solution: {
        lotId: 'lot_order',
        orders: [
          { orderValue: 1, lotItemId: 'ord1' },
          { orderValue: 2, lotItemId: 'ord2' },
          { orderValue: 3, lotItemId: 'ord3' },
          { orderValue: 4, lotItemId: 'ord4' },
          { orderValue: 5, lotItemId: 'ord5' },
          { orderValue: 6, lotItemId: 'ord6' }
        ]
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 120,
      points: 20
    },
    {
      _id: 'q11',
      questionType: 'MCQ',
      questionText: `# Advanced Markdown Demo

## This question demonstrates rich markdown formatting

Here's a **bold statement** and *italicized text*.

### Code Example:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

#### Image Example:
![Nature Scene](https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=60)

#### Math Formula:
The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Which of the options below correctly describes a recursive function?`,
      hintText: 'Look at the code example above for inspiration.',
      difficulty: 2,
      lots: [
        {
          _lotId: 'lot_rich',
          items: [
            { _itemId: 'rich1', type: 'text', textValue: 'A function that calls itself' },
            { _itemId: 'rich2', type: 'text', textValue: 'A function that never terminates' },
            { _itemId: 'rich3', type: 'text', textValue: 'A function that only processes arrays' },
            { _itemId: 'rich4', type: 'text', textValue: 'A function that runs in constant time' }
          ]
        }
      ],
      solution: {
        lotId: 'lot_rich',
        lotItemId: 'rich1'
      },
      meta: {
        creator: 'system',
        studentGenerated: false,
        aiGenerated: true
      },
      timeLimit: 60,
      points: 10
    }
  ]
};

function SampleQuiz() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Sample Quiz</h1>
            <Quiz
                quizId={sampleQuiz._id}
                questionVisibility={sampleQuiz.questionVisibility}
                questions={sampleQuiz.questions}
                onComplete={(score, answers) => {
                    console.log('Quiz completed with score:', score);
                }}
            />
        </div>
    );
}

export default SampleQuiz;