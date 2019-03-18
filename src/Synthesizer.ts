import axios from 'axios';
import formurlencoded from 'form-urlencoded';

export interface Synthesizer {
  voices: string[];
  emotions: string[];
  getPause(n?: number): string,
  synthesize(text: string, voice?: string, emotion?: string): Promise<Buffer | undefined>;
}

export class YandexTextToSpeech implements Synthesizer {

  voices = ['alyss', 'zahar', 'jane', 'ermil', 'oksana', 'omazh'];
  emotions = ['neutral'];

  constructor(
    private accessKey: string,
    private folderId: string) { }

  private token!: string;

  getPause = (n: number = 2) => [...Array(n).keys()].map(x => '-').join(',') + ' ';

  private async getToken() {
    const url = 'https://iam.api.cloud.yandex.net/iam/v1/tokens';
    return axios.post(url, { "yandexPassportOauthToken": this.accessKey })
      .then(r => { return this.token = r.data.iamToken; })
      .catch(e => { console.log(e.response.data); return null; });
  }


  async synthesize(text: string, voice = 'alyss', emotion = 'neutral'): Promise<Buffer | undefined> {

    if (!this.token)
      await this.getToken();

    const url = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize';
    const headers = {
      "Authorization": `Bearer ${this.token}`
    };
    const data = formurlencoded({
      "format": "lpcm",
      "voice": voice,
      "emotion": emotion,
      "sampleRateHertz": "48000",
      "folderId": this.folderId,
      "text": text
    });

    return axios.post(url, data, { headers: headers, responseType: 'arraybuffer' })
      .then(response => {
        return response.data;
      })
      .catch(async err => {
        console.log(`${err.response.status}: ${err.response.statusText}`);
        switch (err.response.status) {
          case 401:
            if (await this.getToken())
              return this.synthesize(text, voice, emotion);
            break;
          default:
            break;
        }
      });
  }
}