// require('dotenv').config({ path });

/** @type {import("typeorm").ConnectionOptions} */
module.exports = {
  type: 'mysql',
  port: process.env.MYSQL_PORT || 3306,
  host: process.env.MYSQL_HOST,
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,

  logging: true,
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },

  entities: ['build/entity/**/*.js'],
  migrations: ['build/migration/**/*.js'],

  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
  },
};
