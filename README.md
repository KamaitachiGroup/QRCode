# QRCode
A Bot for our discord server

## How to run the Bot localy

### Without Docker

Run: `DISCORD_TOKEN=<token> npm run start-dev`

### With Docker

Run: `DISCORD_TOKEN=<token> docker-compose up --build`

## Deployment

Every push on `master` trigger the CI that will redeploy the bot Automatically
