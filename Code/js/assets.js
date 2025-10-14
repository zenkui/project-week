export class AssetManager {
  constructor() {
    this.images = {}
  }

  load(name, src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.images[name] = img
        resolve(img)
      }
      img.onerror = () => reject(`Failed to load ${src}`)
      img.src = src
    })
  }

  async loadAll(assetList) {
    const promises = assetList.map(asset => this.load(asset.name, asset.src))
    await Promise.all(promises)
  }

  get(name) {
    return this.images[name]
  }
}
