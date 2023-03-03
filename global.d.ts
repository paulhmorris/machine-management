/* eslint-disable @typescript-eslint/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    URL: string;
    DATABASE_URL: string;
    SESSION_SECRET: string;
  }
}
