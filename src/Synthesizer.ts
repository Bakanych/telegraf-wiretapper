import axios from 'axios';
import formurlencoded from 'form-urlencoded';

export const voices = ['oksana', 'alyss', 'jane', 'omazh', 'zahar', 'ermil'];
export const emotions = ['neutral'];

export interface Synthesizer {
  getPause(n?: number): string,
  synthesize(text: string, voice?: string, emotion?: string): Promise<Buffer | undefined>;
}

export class YandexTextToSpeech implements Synthesizer {

  constructor(
    private accessKey: string,
    private folderId: string) {
    this.setToken();
  }

  private token = { iamToken: null, expiresAt: null };

  getPause = (n: number = 2) => [...Array(n).keys()].map(x => '-').join(',') + ' ';

  private async setToken(): Promise<void> {
    const url = 'https://iam.api.cloud.yandex.net/iam/v1/tokens';
    console.log('Getting Yandex token...');
    return axios.post(url, { "yandexPassportOauthToken": this.accessKey })
      .then(r => this.token = r.data);
    //.catch(e => { console.log(e.response.data); return null; });
  }


  async synthesize(text: string, voice = 'alyss', emotion = 'neutral', format = 'oggopus'): Promise<Buffer | undefined> {

    if (!this.token.iamToken || this.token.expiresAt! < (new Date())) {
      await this.setToken();
    }

    const url = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize';
    const headers = {
      "Authorization": `Bearer ${this.token.iamToken}`
    };
    const data = formurlencoded({
      "format": format,
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
      });
  }
}