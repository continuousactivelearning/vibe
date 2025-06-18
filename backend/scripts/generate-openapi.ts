import 'reflect-metadata';
import {getMetadataArgsStorage} from 'routing-controllers';
import {routingControllersToSpec} from 'routing-controllers-openapi';
import {validationMetadatasToSchemas} from 'class-validator-jsonschema';
import * as fs from 'fs';
import * as path from 'path';

// Set environment variable to skip database initialization
process.env.SKIP_DB_CONNECTION = 'true';

// Parse command line arguments
const args = process.argv.slice(2);
const outputToStdout = args.includes('--stdout');
// Parse output file argument
const outputFileIndex = args.findIndex(
  arg => arg === '--output' || arg === '-o',
);
const outputFile =
  outputFileIndex !== -1 && outputFileIndex + 1 < args.length
    ? args[outputFileIndex + 1]
    : null;
// Import module options using ES modules
import {authModuleOptions} from '../src/modules/auth/index.js';
import {coursesModuleOptions} from '../src/modules/courses/index.js';
import {usersModuleOptions} from '../src/modules/users/index.js';
import {quizzesModuleOptions} from '../src/modules/quizzes/index.js';
import {genaiModuleOptions} from '../src/modules/genai/index.js';

// Create combined metadata for OpenAPI
const generateOpenAPISpec = () => {
  // Get validation schemas
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
    validationError: {
      target: true,
      value: true,
    },
  });

  // Get metadata storage
  const storage = getMetadataArgsStorage();

  // Combine all controllers from different modules
  const allControllers = [
    ...(authModuleOptions.controllers || []),
    ...(coursesModuleOptions.controllers || []),
    ...(usersModuleOptions.controllers || []),
    ...(quizzesModuleOptions.controllers || []),
    ...(genaiModuleOptions.controllers || []),
  ] as Function[]; // Explicitly cast to Function[]

  // Create combined routing-controllers options
  const routingControllersOptions = {
    controllers: allControllers,
    validation: true,
  };

  // Create OpenAPI specification
  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    info: {
      title: 'ViBe API Documentation',
      version: '1.0.0',
      description: 'API documentation for the ViBe platform',
      contact: {
        name: 'ViBe Team',
        email: 'support@vibe.com',
      },
    },
    tags: [
      // Authentication section
      {
        name: 'Authentication',
        description: 'Operations for user authentication and authorization',
      },

      // Course section and sub-components
      {
        name: 'Courses',
        description: 'Operations related to courses management',
        'x-displayName': 'Courses',
      },
      {
        name: 'Course Versions',
        description: 'Operations for managing different versions of a course',
        'x-displayName': 'Versions',
        'x-resourceGroup': 'Courses',
      },
      {
        name: 'Course Modules',
        description: 'Operations for managing modules within a course version',
        'x-displayName': 'Modules',
        'x-resourceGroup': 'Courses',
      },
      {
        name: 'Course Sections',
        description: 'Operations for managing sections within a course module',
        'x-displayName': 'Sections',
        'x-resourceGroup': 'Courses',
      },
      {
        name: 'Course Items',
        description:
          'Operations for managing individual items within a section',
        'x-displayName': 'Items',
        'x-resourceGroup': 'Courses',
      },

      // User management section
      {
        name: 'Users',
        description: 'Operations for managing user accounts and information',
      },
      {
        name: 'User Enrollments',
        description: 'Operations for managing user enrollments in courses',
      },
      {
        name: 'User Progress',
        description: 'Operations for tracking and managing user progress',
      },

      // Quiz and assessment section
      {
        name: 'Quizzes',
        description: 'Operations for managing quizzes and assessments',
      },
      {
        name: 'Questions',
        description: 'Operations for managing individual quiz questions',
      },
      {
        name: 'Question Banks',
        description: 'Operations for managing collections of questions',
      },
      {
        name: 'Quiz Attempts',
        description: 'Operations for managing quiz attempts and submissions',
      },

      // GenAI section
      {
        name: 'GenAI',
        description: 'Operations for AI-powered content generation',
      },
    ],
    // Use Scalar's preferred grouping approach
    'x-tagGroups': [
      {
        name: 'Authentication',
        tags: ['Authentication'],
      },
      {
        name: 'Course Management',
        tags: [
          'Courses',
          'Course Versions',
          'Course Modules',
          'Course Sections',
          'Course Items',
        ],
      },
      {
        name: 'User Management',
        tags: ['Users', 'User Enrollments', 'User Progress'],
      },
      {
        name: 'Quiz Management',
        tags: ['Quizzes', 'Questions', 'Question Banks', 'Quiz Attempts'],
      },
      {
        name: 'AI Content Generation',
        tags: ['GenAI'],
      },
      {
        name: 'Data Models',
        tags: ['Models'],
      },
    ],
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      {
        url: 'http://localhost:4001',
        description: 'Development server',
      },
      {
        url: 'https://api.vibe.com',
        description: 'Production server',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  });

  return spec;
};

// Execute and save the OpenAPI specification
const outputDir = path.resolve(__dirname, '../openapi');
const openApiSpec = generateOpenAPISpec();

if (outputToStdout) {
  // Output to console
  console.log(JSON.stringify(openApiSpec, null, 2));
} else {
  // Output to file
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  console.log(`Output directory: ${outputFile}`);
  const outputPath = path.join(outputDir, outputFile || 'openapi.json');
  console.log(`Writing OpenAPI specification to: ${outputPath}`);
  try {
    fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2));
    console.log(`✨ OpenAPI specification generated at: ${outputPath}`);
  } catch (error) {
    console.error('Error writing OpenAPI specification to file:', error);
    throw error;
  }
}
