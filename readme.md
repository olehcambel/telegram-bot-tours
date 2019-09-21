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
IS_LOG_CHANNEL = 
CONSOLE_LOG_LEVEL = 
CHANNEL_LOG_LEVEL = 
CHANNEL_ADMIN = 
CHANNEL_SUPPORT = 
CHANNEL_LOG_ID = 
HTTP_PORT = 4999

MYSQL_HOST = 
MYSQL_USERNAME = 
MYSQL_PASSWORD = 
MYSQL_DATABASE = 
MYSQL_PORT = 3306
```
