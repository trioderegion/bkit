export default class CustomDocIndex {

  static augmentIndex() {
    const {_indexCompendium, _indexWorldCollection, _indexEmbeddedDocuments} = game.documentIndex;
    function indexCompendium(pack) {
      const packages = game.settings.get('%id%', 'docIndexPackages');
      if (packages.has(pack.metadata.packageName))
        _indexCompendium.call(game.documentIndex, pack);
    }

    function indexEmbeddedDocuments(parent) {
      const packages = game.settings.get('%id%', 'docIndexPackages');
      if (packages.has('embedded'))
        _indexEmbeddedDocuments.call(game.documentIndex, parent);
    }

    function indexWorldCollection(documentName) {
      const packages = game.settings.get('%id%', 'docIndexPackages');
      if (packages.has('world'))
        _indexWorldCollection(game.documentIndex, documentName);
    }

    game.documentIndex._indexCompendium = indexCompendium;
    game.documentIndex._indexEmbeddedDocuments = indexEmbeddedDocuments;
    game.documentIndex._indexWorldCollection = indexWorldCollection;

  }

  static {

    Hooks.on('setup', () => {
      const packages = game.getPackageScopes().filter(e => e !== 'core');
      packages.push('embedded');
      const choices = Object.fromEntries(packages.map( scope => [scope, scope]));

      game.settings.register('%id%', 'docIndexPackages', {
        name: 'Document Index Sources',
        hint: 'Defines packages to be added to the Document Index',
        scope: 'user',
        config: true,
        type: new foundry.data.fields.SetField(
          new foundry.data.fields.StringField({choices})
        ),
        default: packages,
        onChange: _ => {
          game.documentIndex.index().then( _ => {
            ui.notifications.info('Document Index updated.');
          });
        }
      });
      
      this.augmentIndex();
    });
  }
}

