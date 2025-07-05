import env from "@/env";
import Redis from "ioredis"

const redisClient = new Redis(env.REDIS_URL);

export default redisClient;