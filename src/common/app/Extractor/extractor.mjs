export default class Extractor extends foundry.applications.api.ApplicationV2 {
  static {
    Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
      controls.push({
        icon: 'fa-solid fa-file-arrow-up',
        label: 'Document Extractor',
        onClick: () => new this({document: app.options.document}).render({force: true}),
        visible: () => !!app.options.document,
      });
    });
  }

  static DEFAULT_OPTIONS = {
    actions: {
      item: this.prototype.extractItem,
      actor: this.prototype.extractActor,
      pages: this.prototype.extractPages,
      table: this.prototype.extractTable,
    }
  }

  _initializeApplicationOptions(options) {
    options = super._initializeApplicationOptions(options);
    options.window.title = `Extracting from "${options.document.name}"`;
    return options;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actions = ['item'];
    return context;
  }

  async _renderHTML(context, options) {
    const buttons = context.actions.map(action => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.action = action;
      button.innerText = `Selection as [${action}]`;
      return button;
    });

    const section = document.createElement('section');
    section.replaceChildren(...buttons);

    return section;
  }

  _replaceHTML(node, content, options) {
    content.replaceChildren(node);
  }

  extractItem() {
    ItemExtractor.extract();
  }

  extractActor() {}

  extractPages() {}

  extractTable() {}

  static unlockedPacks() {
    const packs = game.packs.filter(p => !p.config.locked && p.metadata.type === "Item").map(p => p.metadata);
    return packs;
  }

  static getSelection() {
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

class ItemExtractor extends CONFIG.Item.documentClass {
  static async create(data = {}, operation = {}) {
    operation.keepId = true;
    return super.create(data, operation);
  }

  static get implementation() { return this };

  static async _promptContext(options = {}) {
    options = foundry.utils.mergeObject(game.user.getFlag('%id%', 'item-extract') ?? {}, options);
    const targets = {
      'WORLD': 'World',
    }

    const ourPacks = Extractor.unlockedPacks();
    const openActors = Array.from(foundry.applications.instances.values()).filter(app => app.document?.documentName == 'Actor');

    ourPacks.forEach(info => targets['PACK|' + info.id] = `${info.label} (${info.packageName})`);
    openActors.forEach(app => targets['ACTOR|' + app.document.uuid] = app.document.name);

    const fields = [
      new foundry.data.fields.StringField({label: 'Item Prefix'}).toFormGroup({}, {name: 'ITEM_PREFIX', value: options.ITEM_PREFIX}).outerHTML,
      new foundry.data.fields.StringField({label: 'Target Collection'}).toFormGroup({}, {name: 'TARGET', value: options.TARGET, choices: targets}).outerHTML,
    ]

    const content = `<fieldset>${fields.join('')}</fieldset>`;

    const answer = await foundry.applications.api.DialogV2.prompt({
      content,
      title: 'Static Item Identifiers',
      ok: {
        callback: (event, button) => new FormDataExtended(button.form).object
      },
      position: {top: 100},
      rejectClose: true
    });

    const result = foundry.utils.mergeObject(options, answer);
    await game.user.setFlag('%id%', 'item-extract', result);

    return result;
  }


  static async extract() {
    const {range: fullRange = null} = Extractor.getSelection();
    const fragment = fullRange.cloneContents();

    const wrapper = document.createElement("div");
    wrapper.appendChild(fragment);

    /* try to figure out where the name of the document lives */
    const nameFromChildren = (childNodes) => {
      while (childNodes.length > 0) {
        const node = childNodes[0];
        let nodeText = "";

        if (node.hasChildNodes()) {
          nodeText = nameFromChildren(node.childNodes);
          if (!node.hasChildNodes()) node.remove();
        } else {
          /* trim name of whitespace and remove any trailing punctuation */
          nodeText = node.textContent.trim().replace(/[^\w\d\)]\.*$/, "");
          node.remove();
        }

        if (nodeText.length > 0) {
          return nodeText;
        }
      }
    };

    let name = nameFromChildren(wrapper.childNodes);
    const caption = name;
    name = name.replace('’', "'");
    const priceRegex = /\s*\((?<value>\d*,?\d+) (?<denomination>[PGESC]P)\)/
    const result = priceRegex.exec(name);

    let price = {
      value: '0',
      denomination: 'gp',
    };

    if (result) {
      name = name.substring(0, result.index).trim();
      price.value = result.groups.value.replace(',', '');
      price.denomination = result.groups.denomination.toLowerCase();
    }

    if (name.length < 1) {
      ui.notifications.error(
        "Could not identify valid document name from selection"
      );
      return;
    }

    const defaults = game.user.getFlag('world', 'bkit');
    const answer = await this._promptContext(defaults);
    if (!answer) return;

    /* if a non <p> is the remaining first child, its likely an inline item */
    if (!['H1', 'H2', 'H3', 'P'].includes(wrapper.firstChild.nodeName)) {
      const parawrapper = document.createElement("p");
      parawrapper.replaceChildren(...wrapper.childNodes);
      wrapper.replaceChildren(parawrapper);
    }

    let description = wrapper.innerHTML.trim();
    /* move parenthetical uses into item description */
    const paraRegex = /\((?<use>[\w\d\s]+)\)\./;
    const paraResult = paraRegex.exec(name);
    if (paraResult) {
      name = name.substring(0, result.index).trim();
      description = `<p><strong>${result.groups.use}</strong></p>` + description;
    }

    /* Class features often lead with "Level N:" */
    let itemLevel;
    const levelRegex = /level\s(?<level>\d\d?)\:?/i
    const levelResult = levelRegex.exec(name);
    if (levelResult) {
      name = levelResult.input.replace(levelResult[0], "").trim();
      itemLevel = Number(levelResult.groups.level);
    }

    /* Creation Data */
    const data = foundry.utils.expandObject({
      _id: dnd5e.utils.staticID(`${answer.ITEM_PREFIX}${name.slugify({lowercase: false, replacement: '', strict: true})}`),
      type: answer.ITEM_TYPE ?? 'feat',
      folder: answer.ITEM_FOLDER,
      name,
      "system.description.value": description,
      "system.price": price,
      "system.prerequisites.level": itemLevel,
    });

    /* Creation Context */
    const context = {pack: null, parent: null};
    const targetParts = answer.TARGET.split('|');
    let exists = false;
    switch (targetParts.at(0)) {
      case 'WORLD':
        exists = game.items.has(data._id);
        break;
      case 'PACK':
        context.pack = targetParts.at(1);
        exists = game.packs.get(context.pack).index.has(data._id);
        break;
      case 'ACTOR':
        context.parent = await fromUuid(targetParts.at(1));
        exists = context.parent.items.has(data._id);
        break;
    }

    if (exists) {
      ui.notifications.error('Requested ID already exists!');
      return;
    }

    const item = await ItemExtractor.createDialog(data, context);
    const embedText = `@Embed[${item.uuid} classes="caption-top item-card"]{${caption}}`;
    navigator.clipboard.writeText(embedText);
    ui.notifications.info(`"${embedText}" written to clipboard.`);
    answer.ITEM_TYPE = item.type;
    answer.ITEM_FOLDER = item.folder?.id;
    await game.user.setFlag('%id%', 'item-extract', answer);
  }
}





/****** MAIN ********/

