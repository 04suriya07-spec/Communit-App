const ConnectRedis = require('connect-redis');
console.log('Type of exports:', typeof ConnectRedis);
console.log('Exports keys:', Object.keys(ConnectRedis));
console.log('Default export:', ConnectRedis.default);
console.log('RedisStore export:', ConnectRedis.RedisStore);
