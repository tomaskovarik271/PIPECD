import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "../netlify/functions/graphql/schema/**/*.graphql", // Path from frontend folder to schema
  documents: "src/**/*.tsx", // Scan .tsx files in src for GraphQL operations
  generates: {
    "src/generated/graphql/": {
      preset: "client", // Uses a preset for client-side operations (includes typescript, typescript-operations)
      config: {
        // Optional: You can add specific configurations for the preset or plugins here
        // e.g., naming conventions, enumsAsTypes, etc.
        // For now, defaults should be fine.
        enumsAsTypes: true, // Generates string literal types for enums instead of TypeScript enums
        strictScalars: true, // Makes scalars strict, useful for custom scalars if you define them
        useTypeImports: true, // Uses `import type` for generated types
        scalars: { // Add this section to map custom scalars
          DateTime: 'string', // Map the GraphQL DateTime scalar to TypeScript string
          Date: 'string', // Map the GraphQL Date scalar to TypeScript string
          JSON: 'Record<string, any>' // Map the GraphQL JSON scalar to TypeScript object
        }
      },
      plugins: [] // No additional plugins needed if client-preset handles everything
                  // If client-preset is not sufficient, we'd list individual plugins here
                  // e.g., ['typescript', 'typescript-operations']
    }
  },
  ignoreNoDocuments: true, // Prevents errors if no operations are found in some files
};

export default config; 