import {PlaceableFit} from '../lib/placeable-fit.mjs';

class TokenGallery {
  static {
    Hooks.on('getFolderContextOptions', this.#addFolderContext);
  }

  static #addFolderContext(directory, options) {
    options.push({
      name: 'To Token Gallery',
      icon: '<i class="fa-solid fa-camera"></i>',
      condition: header => {
        const li = header.closest(".directory-item");
        const folder = fromUuidSync(li.dataset.uuid);
        return folder.type === 'Actor';
      },
      callback: async header => {
        const li = header.closest(".directory-item");
        const folder = await fromUuid(li.dataset.uuid);
        return TokenGallery.placeTokens(folder); 
      }
    });
  }

  static async placeTokens(folder) {
    const actors = this.folderChildren(folder)
    const center = canvas.scene.dimensions.sceneRect.center;
    const tokens = await Promise.all(actors.map(a => a.getTokenDocument()));
    const largest = tokens.sort( (a, b) => (a.height * a.width) - (b.height * b.width) );

    for (const token of largest) {
      const bounds = {x: center.x, y: center.y, width: token.width * canvas.scene.grid.size, height: token.height * canvas.scene.grid.size};
      const fitter = new PlaceableFit(bounds, {searchRange: 40});
      const {x, y} = fitter.find()
      const data = token.toObject();
      data.x = x;
      data.y = y;
      data.actorLink = false;
      await canvas.scene.createEmbeddedDocuments('Token', [data]);
    }
  }

  static folderChildren(folder) {
    if (!folder) return []; 
    const index = folder.contents;
    const descendents = folder.getSubfolders(false)?.flatMap(TokenGallery.folderChildren) ?? []
    return index.concat(descendents);
  }
}
