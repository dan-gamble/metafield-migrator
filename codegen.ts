
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "./schema.graphql",
  generates: {
    "shopify.ts": {
      plugins: ["typescript", "typescript-resolvers"]
    }
  }
};

export default config;
