import axios from 'axios';

export class AzureComputerVision {

  constructor(
    private subscriptionKey: string) { }

  private uriBase =
    'https://southeastasia.api.cognitive.microsoft.com/vision/v2.0/analyze';

  private headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': this.subscriptionKey
  };

  // Request parameters.
  private params = {
    'visualFeatures': 'Description',
    'details': '',
    'language': 'en'
  };

  async getImageDescription(imageUrl: string) {
    const response = await axios.post(this.uriBase, { "url": imageUrl }, { params: this.params, headers: this.headers });
    console.log(response.data.description);
    if (response.data.description.captions.length > 0)
      return response.data.description.captions[0].text;

    return null;
  }
}