import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envVariables = z.object({
    PORT: z.string().nonempty().default("8080"),
    MONGO_URI: z.string().nonempty(),
    JWT_SECRET: z.string().nonempty(),
    OPENROUTER_API_KEY: z.string().nonempty(),
    AI_MODEL: z.string().nonempty(),
    NODE_ENV: z.string().default("development"),
});

envVariables.parse(process.env);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ProcessEnv extends z.infer<typeof envVariables> { }
    }
}

const config = {
    port: Number.parseInt(process.env.PORT || "8080"),
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
};




export { config };

