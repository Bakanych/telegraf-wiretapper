import axios from 'axios';
import formurlencoded from 'form-urlencoded';
import { YandexTextToSpeech } from "../src";
jest.mock('axios');

test('YandexTextToSpeech', async () => {

  const iamToken = 'my token', folderId = '123', text = 'бла бла', language = 'ru-RU', voice = 'адский голос', emotion = 'неимоверно веселый', format = 'неформат'
  const tts = new YandexTextToSpeech('', folderId);
  const data = formurlencoded({
    "format": format,
    "voice": voice,
    "emotion": emotion,
    "sampleRateHertz": "48000",
    "folderId": folderId,
    "text": text,
    "lang": language
  });
  const resp = { data: { iamToken: iamToken } };
  (axios.post as any).mockResolvedValue(resp);
  await tts.synthesize(text, language, voice, emotion, format);
  expect(axios.post).toHaveBeenNthCalledWith(3,
    'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
    data,
    { "headers": { "Authorization": `Bearer ${iamToken}` }, "responseType": "arraybuffer" }
  );
})