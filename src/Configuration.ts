export interface Configuration {
  playCommand: string,
  yandexCloud: {
    accessKey: string,
    folderId: string
  },
  azureCongnitiveServices?: {
    subscriptionKey: string
  }
}