import axios from 'axios';
import formurlencoded from 'form-urlencoded';
import { YandexTextToSpeech, Voice } from "../src/Synthesizer";
jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
});

test('YandexTextToSpeech cache token', async () => {

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 1);
  const resp = { data: { iamToken: 'any', expiresAt: expiresAt } };
  (axios.post as any).mockResolvedValue(resp);

  const tts = new YandexTextToSpeech('', '');
  await tts.synthesize('', 'en-US', Voice.Alyss);
  await tts.synthesize('', 'en-US', Voice.Alyss);
});


test('YandexTextToSpeech refresh token', async () => {

  const axios_calls = (axios.post as any).mock.calls;

  const resp = { data: { iamToken: 'any', expiresAt: new Date() } };
  (axios.post as any).mockResolvedValue(resp);

  const tts = new YandexTextToSpeech('', '');
  await tts.synthesize('', 'en-US', Voice.Alyss);

  await new Promise(r => setTimeout(r, 1));

  await tts.synthesize('', 'en-US', Voice.Alyss);


  // as token expired, every call of synthesize should refresh token first
  expect(axios_calls[1][0]).toMatch('tokens');
  expect(axios_calls[3][0]).toMatch('tokens');

});


test('YandexTextToSpeech synthesize', async () => {

  const iamToken = 'my token', folderId = '123', text = 'бла бла', language = 'ru-RU', voice = Voice.Oksana, emotion = 'неимоверно веселый', format = 'неформат'
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
  const resp = { data: { iamToken: iamToken, expiresAt: new Date() } };
  (axios.post as any).mockResolvedValue(resp);
  await tts.synthesize(text, language, voice, emotion, format);

  expect(axios.post).toHaveBeenNthCalledWith(3,
    'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
    data,
    { "headers": { "Authorization": `Bearer ${iamToken}` }, "responseType": "arraybuffer" }
  );
})