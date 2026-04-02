import 'dotenv/config';
import { defineConfig } from 'prisma/config';
export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'node --no-warnings=ExperimentalWarning --loader ts-node/esm ./prisma/seed.ts',
    },
    datasource: {
        url: process.env['DATABASE_URL'],
    },
});
//# sourceMappingURL=prisma.config.js.map