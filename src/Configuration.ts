export interface Configuration {
  yandexCloud: {
    accessKey: string,
    folderId: string
  },
  azureCongnitiveServices?: {
    subscriptionKey: string
  }
}