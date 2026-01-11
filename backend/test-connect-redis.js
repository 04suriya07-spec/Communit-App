const { RedisStore } = require("connect-redis");
const Redis = require("ioredis");

console.log("RedisStore class:", RedisStore);

try {
    const client = new Redis('redis://localhost:6379');
    const store = new RedisStore({
        client: client,
        prefix: "test:",
    });
    console.log("RedisStore instance created successfully");
    console.log("Store instance keys:", Object.keys(store));
    console.log("Store has 'get' method?", typeof store.get === 'function');

    // Cleanup
    client.quit();
} catch (e) {
    console.error("Failed to create RedisStore:", e);
}
