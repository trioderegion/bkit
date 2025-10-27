export default class ExtractorBase {

  get documentName() {
    throw new TypeError('Child class of ExtractorBase requires "documentName" defined');
    return null;
  }

  genID(name, prefix = '') {
    const id = `${prefix}${name.slugify({lowercase: false, replacement: '', strict: true})}`;
    if (id.length >= 16) return id.substring(0, 16);
    return id.padEnd(16, foundry.utils.randomID());
  }

  async validateTarget({id, type = this.documentName, target}) {

    /* Creation Context */
    const context = {pack: null, parent: null, keepId: true};
    const targetParts = target.split('|');
    switch (targetParts.at(0)) {
      case 'PACK':
        context.pack = targetParts.at(1);
        break;
      case 'SHEET':
        context.parent = await fromUuid(targetParts.at(1));
        break;
    }

    const uuid = foundry.utils.buildUuid({id, documentName: type, ...context});
    if (await fromUuid(uuid)) {
      ui.notifications.error(`Putative UUID already exists! [${uuid}]`);
      throw new Error(`Putative UUID already exists! [${uuid}]`);
    }

    return context;
  }

  parseRange(range = '') {
    let [lower, upper] = range.split('–').flatMap(p => p.split('-'));
    if (lower == '00') lower = '100';
    if (upper == '00') upper = '100';
    upper ??= lower;
    console.log(upper, lower);
    lower = Number(lower);
    upper = Number(upper);

    if (isNaN(lower) || isNaN(upper)) {
      return [NaN, NaN]
    }

    return [lower, upper];
  }

  async promptContext(type = this.documentName, options = {}) {
    options = foundry.utils.mergeObject(game.user.getFlag('%id%', `${type}-extractor`) ?? {}, options);

    const targets = {
      'WORLD': 'World',
    }

    const ourPacks = this.unlockedPacks();
    const openSheets = this.openSheets();

    ourPacks.forEach(info => targets['PACK|' + info.id] = `${info.label} (${info.packageName})`);
    openSheets.forEach(doc => targets['SHEET|' + doc.uuid] = doc.name);

    const fields = [
      new foundry.data.fields.StringField({label: 'ID Prefix'}).toFormGroup({}, {name: 'prefix', value: options.prefix}).outerHTML,
      new foundry.data.fields.StringField({label: 'Document Name'}).toFormGroup({}, {name: 'name', value: options.name}).outerHTML,
      new foundry.data.fields.StringField({label: 'Target Collection'}).toFormGroup({}, {name: 'target', value: options.target ?? 'WORLD', choices: targets}).outerHTML,
    ]

    const content = `<fieldset>${fields.join('')}</fieldset>`;

    const answer = await foundry.applications.api.DialogV2.prompt({
      content,
      title: 'Document Extraction Context',
      ok: {
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
      },
      rejectClose: true
    });

    const result = foundry.utils.mergeObject(options, answer);
    await game.user.setFlag('%id%', `${type}-extractor`, result);

    return result;
  }


  unlockedPacks(type = this.documentName) {
    const packs = game.packs.filter(p => !p.locked && p.metadata.type === type).map(p => p.metadata);
    return packs;
  }

  openSheets(type = this.documentName) {
    const collectionField = CONFIG[type].documentClass.metadata.collection;
    if (!collectionField) return [];
    return Array.from(foundry.applications.instances.values())
      .filter(app => app.document?.collections[collectionField])
      .map(app => app.document);
  }

  getSelection() {
    const selection = window.getSelection();

    if (selection.type !== "Range") {
      ui.notifications.error("No Range selected for document extraction!");
      return;
    }

    /* get 'top' and 'bottom' ordered */
    if (selection.anchorOffset > selection.extentOffset) {
      ui.notifications.warn("Please select top to bottom.");
      return;
    }

    selection.modify("extend", "right", "lineboundary");

    const initialRange = selection.getRangeAt(0);
    const start =
      initialRange.commonAncestorContainer.nodeName == "P"
        ? initialRange.commonAncestorContainer
        : selection.anchorNode.parentElement;

    selection.setBaseAndExtent(
      start,
      0,
      selection.extentNode,
      selection.extentOffset
    );

    const fullRange = selection.getRangeAt(0);

    return {range: fullRange};
  }
}

