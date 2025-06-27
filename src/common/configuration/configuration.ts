import { envSchema } from '../schemas/config.schema';

export default () => {
  // Validate ENV first
  const env = envSchema.parse(process.env);

  return {
    port: env.PORT,
    database: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      name: env.DB_NAME,
      password: env.DB_PASSWORD,
    },
    database_url: env.DATABASE_URL,
    jwt: {
      secret: env.JWT_SECRET,
    },
  };
};
