import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'netlify/functions/graphql/schema/**/*.graphql',
  documents: [], // We are not generating types for client-side operations in this task
  generates: {
    'lib/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers',
      ],
      config: {
        contextType: '../../netlify/functions/graphql#GraphQLContext',
        // Optional: If you want to map your DB models to GraphQL types directly.
        // mappers: {
        //   User: './models#UserDbModel', // Example
        // },
        // Optional: To avoid default 'any' type if a resolver is not found for a field
        // defaultMapper: 'Partial<{T}>', 
        // Optional: Specify custom scalars if you have them
        scalars: {
          DateTime: 'Date',
          Date: 'Date',
          JSON: '{ [key: string]: any }',
        }
      },
    },
    'frontend/src/generated/graphql/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        // Consider 'typescript-graphql-request' for a typed SDK if using graphql-request extensively with operations files
      ],
      documents: [
        'frontend/src/**/*.ts',
        'frontend/src/**/*.tsx',
      ],
      config: {
        // Ensure scalars are mapped correctly if needed for frontend (e.g., DateTime to string)
        scalars: {
          DateTime: 'string', // For frontend, string is often preferred for DateTime
          Date: 'string', // For frontend, string is often preferred for Date
          JSON: 'Record<string, any>', // For frontend
        },
        // Generate enums as TypeScript enums instead of union types
        enumsAsTypes: false,
        // Avoids __typename on everything if not strictly needed by client cache/logic
        // skipTypename: true, 
      }
    }
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'], // Optional: Format generated files
  },
  // Emit ESModules for .ts config file if your project is ESM
  // config: {
  //   emitLegacyCommonJSImports: false, 
  // },
};

export default config; 