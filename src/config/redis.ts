/**
 * Let's have a separate file in case we ever need the Redis config in different configs
 */
export default {
  host: process.env.REDIS_HOST,
  port: 6379
};
