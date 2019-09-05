### Introduction

Telegram bot for tour agencies with auth system, admin panel, role based access for crud using forms. Stack: telegraf, mysql, typescript, typeorm, express

### Instalation

```sh
# edit your config file
$ cp example.env .env
$ npm i
# create schema in db
sql: CREATE SCHEMA tour_bot CHARSET = 'utf8mb4';
# run migrations
$ npm run migration:run
# add seeds to schema
$ npm run seed:run
# start app
$ npm run compile && npm start
```

### Commands
```
start - Start
settings - Update an own account info
contact - Ask question to support
about - Info about author of the project
menu - Menu with available command to related role
create_tour - Fill the form for tour
update_user - Update user info
update_currency - Update currency
get_tgcode - Your telegram ID
```

### Dotenv

```dotenv
BOT_TOKEN = 
IS_LOG_CHANNEL = false
CONSOLE_LOG_LEVEL = info
CHANNEL_LOG_LEVEL = error
CHANNEL_ADMIN = 
CHANNEL_SUPPORT = 
CHANNEL_LOG_ID = 
HTTP_PORT = 4999

TYPEORM_CONNECTION = mysql
TYPEORM_HOST = localhost
TYPEORM_USERNAME = root
TYPEORM_PASSWORD = password
TYPEORM_DATABASE = tour_bot
TYPEORM_PORT = 3306
TYPEORM_LOGGING = true

TYPEORM_ENTITIES = build/entity/**/*.js
TYPEORM_ENTITIES_DIR = src/entity
TYPEORM_MIGRATIONS = build/migration/**/*.js
TYPEORM_MIGRATIONS_DIR = src/migration
TYPEORM_SEEDS = build/seed/**/*.js
TYPEORM_SEEDS_DIR = src/seed
```
