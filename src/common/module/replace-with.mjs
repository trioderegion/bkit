export default class ReplaceWith {
  static async replaceWith(target) {
    const fields = [
      new foundry.data.fields.DocumentUUIDField({label: 'From'}).toFormGroup({}, {name: 'source', }).outerHTML,
      new foundry.data.fields.BooleanField({label: 'Embedded Only?'}).toFormGroup({}, {name: 'onlyembedded', }).outerHTML,
    ]

    const {source, onlyembedded} = await foundry.applications.api.DialogV2.prompt({
      content: `<fieldset>${fields.join('')}</fieldset>`,
      window: {title: 'Clone Document Into', },
      ok: {
        callback: (event, button) => new FormDataExtended(button.form).object
      },
      position: {top: 100},
      rejectClose: false,
    })

    const sDoc = await fromUuid(source);
    const tDoc = target;

    if (sDoc.constructor.documentName !== tDoc.constructor.documentName) return ui.notifications.error('Heterogenous document classes!');

    const data = sDoc.toObject();

    await Promise.all(Object.entries(tDoc.constructor.metadata.embedded)
      .map(([name, collection]) => tDoc.deleteEmbeddedDocuments(name, [], {deleteAll: true})
        .then(_ => {
          data[collection].forEach( d => { if ('origin' in d) delete d.origin } );
          tDoc.createEmbeddedDocuments(name, data[collection], {keepId: true, keepEmbeddedIds: true})
        })
        .then(_ => delete data[collection])));

    if (onlyembedded) return ui.notifications.success('Embedded documents replaced.')

    ['_stats', '_id', 'sort', 'folder'].forEach(key => { if (key in data) delete data[key]});

    if ('system' in data) {
      data['==system'] = data.system;
      delete data.system;
    }

    await tDoc.update(data);

    return ui.notifications.success('Document replaced!')
  }

  static {
    Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
      controls.push({
        icon: 'fa-solid fa-clone',
        label: 'Replace With...',
        onClick: () => this.replaceWith(app.document),
        visible: () => 'document' in app,
      });
    });
  }
}
