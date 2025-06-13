import {authModuleOptions} from '#auth/index.js';
import {coursesModuleOptions} from '#courses/index.js';
import {docsModuleOptions} from '#docs/index.js';
import {usersModuleOptions} from '#users/index.js';
import {quizzesModuleOptions} from '#quizzes/index.js';
import {validationMetadatasToSchemas} from 'class-validator-jsonschema';
import {injectable} from 'inversify';
import {getMetadataArgsStorage} from 'routing-controllers';
import {routingControllersToSpec} from 'routing-controllers-openapi';

@injectable()
export class OpenApiSpecService {
  generateOpenAPISpec() {
    // Get validation schemas
    const rawSchemas = validationMetadatasToSchemas({
      refPointerPrefix: '#/components/schemas/',
      validationError: {
        target: true,
        value: true,
      },
    });

    // Filter and clean schemas to avoid missing pointer errors
    const schemas = this.cleanSchemas(rawSchemas);

    // Get metadata storage
    const storage = getMetadataArgsStorage();

    // Combine all controllers from different modules
    const allControllers = [
      ...(authModuleOptions.controllers || []),
      ...(coursesModuleOptions.controllers || []),
      ...(usersModuleOptions.controllers || []),
      ...(docsModuleOptions.controllers || []),
      ...(quizzesModuleOptions.controllers || []),
    ];

    // Create combined routing-controllers options
    const routingControllersOptions = {
      controllers: allControllers as Function[],
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
          description:
            'Operations for managing modules within a course version',
          'x-displayName': 'Modules',
          'x-resourceGroup': 'Courses',
        },
        {
          name: 'Course Sections',
          description:
            'Operations for managing sections within a course module',
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

    // Clean the entire spec to handle any remaining invalid references
    return this.cleanOpenAPISpec(spec);
  }

  private cleanSchemas(schemas: any): any {
    const cleanedSchemas: any = {};

    // First pass: collect all valid schema names
    const validSchemaNames = new Set<string>();
    for (const [name, schema] of Object.entries(schemas)) {
      if (schema && typeof schema === 'object' && name !== 'Array') {
        validSchemaNames.add(name);
        cleanedSchemas[name] = this.fixArraySchemas(schema);
      }
    }

    // Second pass: clean up references
    for (const [name, schema] of Object.entries(cleanedSchemas)) {
      cleanedSchemas[name] = this.cleanSchemaReferences(
        schema,
        validSchemaNames,
      );
    }

    return cleanedSchemas;
  }

  private fixArraySchemas(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.fixArraySchemas(item));
    }

    const fixed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'type' && value === 'array') {
        // Check if this array type has items property
        const parentObj = obj as any;
        if (!parentObj.items) {
          console.warn(
            'Warning: Array type missing items property, adding generic items',
          );
          fixed[key] = value;
          fixed['items'] = {type: 'object'};
        } else {
          fixed[key] = value;
          // Also copy the items property when it exists
          fixed['items'] = this.fixArraySchemas(parentObj.items);
        }
      } else if (typeof value === 'object' && value !== null) {
        fixed[key] = this.fixArraySchemas(value);
      } else {
        fixed[key] = value;
      }
    }

    // If this object has type: 'array' but no items, add default items
    if (fixed.type === 'array' && !fixed.items) {
      fixed.items = {type: 'object'};
    }

    return fixed;
  }

  private cleanSchemaReferences(obj: any, validSchemaNames: Set<string>): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item =>
        this.cleanSchemaReferences(item, validSchemaNames),
      );
    }

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        const refName = value.replace('#/components/schemas/', '');
        if (validSchemaNames.has(refName)) {
          cleaned[key] = value;
        } else {
          // Replace invalid reference with a generic object schema
          return {type: 'object'};
        }
      } else {
        cleaned[key] = this.cleanSchemaReferences(value, validSchemaNames);
      }
    }

    return cleaned;
  }

  private cleanOpenAPISpec(spec: any): any {
    // Get all available schema names
    const availableSchemas = new Set(
      Object.keys(spec.components?.schemas || {}),
    );

    // Recursively clean the entire spec
    return this.cleanSpecReferences(spec, availableSchemas);
  }

  private cleanSpecReferences(obj: any, availableSchemas: Set<string>): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanSpecReferences(item, availableSchemas));
    }

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        const refName = value.replace('#/components/schemas/', '');
        if (availableSchemas.has(refName)) {
          cleaned[key] = value;
        } else {
          // Replace invalid reference with a generic object schema
          console.warn(
            `Warning: Missing schema reference "${refName}" replaced with generic object`,
          );
          return {
            type: 'object',
            description: `Schema for ${refName} (reference not found)`,
          };
        }
      } else if (
        key === 'schema' &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        // Handle schema objects with $ref - add proper type checking
        const schemaObj = value as Record<string, any>;
        if (schemaObj.$ref && typeof schemaObj.$ref === 'string') {
          const refName = schemaObj.$ref.replace('#/components/schemas/', '');
          if (availableSchemas.has(refName)) {
            cleaned[key] = value;
          } else {
            console.warn(
              `Warning: Missing schema reference "${refName}" in schema object`,
            );
            cleaned[key] = {
              type: 'object',
              description: `Schema for ${refName} (reference not found)`,
            };
          }
        } else {
          cleaned[key] = this.cleanSpecReferences(
            this.fixArraySchemas(value),
            availableSchemas,
          );
        }
      } else {
        cleaned[key] = this.cleanSpecReferences(value, availableSchemas);
      }
    }

    return cleaned;
  }
}
