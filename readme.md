# [Telegraf](https://github.com/telegraf/telegraf) Wire Tapper
Telegraf middleware for those who tired to read [over9000](https://i.kym-cdn.com/entries/icons/original/000/000/056/itsover1000.jpg) unread chat messages and prefer to listen it as a podcast.
## Installation

```js
$ npm install telegraf-wiretapper
```
## Usage
### Yandex SpeechKit cloud API
This middleware uses [Yandex SpeechKit](https://cloud.yandex.ru/docs/speechkit/) to synthesize messages. You should have Yandex cloud account to access their API. Middleware configuration requires Yandex cloud folder id and access key. Please follow their [documentation](https://cloud.yandex.ru/docs/speechkit/concepts/auth) to setup it properly.
### Lame Encoder
Your bot host should have [Lame](http://lame.sourceforge.net/) installed.

### Bot example
```typescript
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { WireTapper, Configuration } from 'telegraf-wiretapper';

const botToken = process.env.BOT_TOKEN || 'your bot token';
const config: Configuration = {
  playCommand: 'play',
  yandexCloud: {
    accessKey: process.env.YANDEX_CLOUD_ACCESS_KEY || 'Yandex cloud access key',
    folderId: process.env.YANDEX_CLOUD_FOLDER_ID || 'Yandex cloud folder'
  }
};

const bot = new Telegraf(botToken);
const wireTapper = new WireTapper(config);

bot.use(wireTapper.middleware());
bot.launch();
```
### Docker example
Below is Dockerfile I used to run it:
```docker
FROM node
RUN apt-get update && apt-get install -y lame

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "start" ]
```

then run it using command:
```bash
docker run <your bot image> -d --env BOT_TOKEN=<your bot token> --env YANDEX_CLOUD_FOLDER_ID=<id of Yandex cloud folder> --env YANDEX_CLOUD_ACCESS_KEY=<Yandex cloud access key>
```


