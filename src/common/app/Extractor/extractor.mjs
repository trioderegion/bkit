export default class Extractor extends foundry.applications.api.ApplicationV2 {
  static {
    Hooks.on('getProseMirrorMenuDropDowns', (proseMirrorMenu, dropdowns) => {
      dropdowns['%id%'] = {
        action: 'badger',
        title: '<i class="fa-solid fa-helmet-safety"></i>',
        entries: [
          {
            title: 'Extract Item',
            action: 'extract-item',
            cmd: () => {
              ItemExtractor.extract()
            }
          },
          {
            title: 'Split Headers',
            action: 'split-headers',
            cmd: (state, dispatch, view) => {
              const element = view.dom.closest('prose-mirror');
              const pageuuid = element?.dataset?.documentUuid;
              PageSplitter.split({pageuuid});
            }
          }
        ]
      }
    });
  }

  static genID(name, prefix = '') {
    const id = `${prefix}${name.slugify({lowercase: false, replacement: '', strict: true})}`;
    if (id.length >= 16) return id.substring(0, 16);
    return id.padEnd(16, 'F');
  }

  static async validateTarget({id, type, target}) {

    /* Creation Context */
    const context = {pack: null, parent: null};
    const targetParts = target.split('|');
    switch (targetParts.at(0)) {
      case 'PACK':
        context.pack = targetParts.at(1);
        break;
      case 'SHEET':
        context.parent = await fromUuid(targetParts.at(1));
        break;
    }

    const uuid = buildUuid({id, type, ...context});
    if (await fromUuid(uuid)) {
      throw new Error(`Putative UUID already exists! [${uuid}]`);
    }

    return context;
  }

  static parseRange(range = '') {
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

  static async promptContext(type = 'Item', options = {}) {
    options = foundry.utils.mergeObject(game.user.getFlag('%id%', `${type}-extractor`) ?? {}, options);

    const targets = {
      'WORLD': 'World',
    }

    const ourPacks = Extractor.unlockedPacks();
    const openSheets = Extractor.openSheets();

    ourPacks.forEach(info => targets['PACK|' + info.id] = `${info.label} (${info.packageName})`);
    openSheets.forEach(doc => targets['SHEET|' + doc.uuid] = doc.name);

    const fields = [
      new foundry.data.fields.StringField({label: 'Document Prefix'}).toFormGroup({}, {name: 'prefix', value: options.prefix}).outerHTML,
      new foundry.data.fields.StringField({label: 'Target Collection'}).toFormGroup({}, {name: 'target', value: options.target, choices: targets}).outerHTML,
    ]

    const content = `<fieldset>${fields.join('')}</fieldset>`;

    const answer = await foundry.applications.api.DialogV2.prompt({
      content,
      title: 'Document Extraction Context',
      ok: {
        callback: (event, button) => new FormDataExtended(button.form).object
      },
      //position: {top: 100},
      rejectClose: true
    });

    const result = foundry.utils.mergeObject(options, answer);
    await game.user.setFlag('%id%', `${type}-extractor`, result);



    return result;
  }


  static unlockedPacks(type = 'Item') {
    const packs = game.packs.filter(p => !p.config.locked && p.metadata.type === type).map(p => p.metadata);
    return packs;
  }

  static openSheets(type = 'Item') {
    const collectionField = CONFIG[type].documentClass.metadata.collection;
    if (!collectionField) return [];
    return Array.from(foundry.applications.instances.values())
      .filter(app => app.document?.collections.has(collectionField))
      .map(app => app.document);
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

class TableExtractor {
  static async extract(state, view) {
    /* Get table around cursor position */
    const cursor = view.domAtPos(state.selection.anchor).node;
    const element = cursor?.nodeType === cursor.TEXT_NODE ? cursor.parentElement : cursor;
    const table = element.closest('table');
    const extractor = new this(table);
    extractor.parse();
  }

  /** @type HTMLElement */
  table = null;


  extract = {
    name: '(No Title)',
  };

  embed = {
    resultLabel: null,
  }


  constructor(tableElement) {
    this.table = tableElement;
    this.lines = this._extract();
  }

  async parse() {
    const answers = Extractor.promptContext('RollTable');
    const lines = foundry.utils.duplicate(this.lines);
    const name = lines.shift().trim().replace('’', "'").replace().replace('“', '"').replace('”', '"');
    const id = Extractor.genID(name, answers.prefix);
    await Extractor.validateTarget({id, type: 'RollTable', target: answers.target});

    const formula = lines.shift();
    const resultLabel = lines.shift();

    const rawPairs = [];
    while (lines.length) {
      const range = lines.shift();
      const resultLines = []
      do {
        resultLines.push(lines.shift());

      } while (parseRange(lines.at(0)).some(isNaN))

      const text = resultLines.length > 1 ? '<p>' + resultLines.join('</p><p>') + '</p>' : resultLines.at(0);

      rawPairs.push([range, text]);
    }

    const results = rawPairs.map(([range, value]) => this._createEntry(range, value));

    const data = {_id: id, name, results, formula};

    await RollTable.create(data, {pack: targetPack, keepId: true}).then(table => {
      table.sheet.render(true);
      navigator.clipboard.writeText(`@Embed[${table.uuid} rollable classes="caption-top" resultLabel="${resultLabel}"]{${name}}`);
    });
  }

  _createEntry(range, value) {
    const parsedRange = Extractor.parseRange(range);
    return {
      type: 0,
      text: value,
      range: parsedRange,
    };
  }

  _discoverTitle() {
    let node = this.table;
    while (!node.previousElementSibling) {
      node = node.parentElement;
    }

    if (node.classList.has('ProseMirror')) return;

    return node?.textContent ?? this.extract.name;
  }

  _extract() {
    const text = this.table.innerText.trim();
    const lines = text.split('\n').filter(e => !!e);

    /* If the table has a caption element, it will be grabbed.
     * Otherwise, look at the prior sibling of this table */
    if (!this.table.querySelector('caption')) {
      lines.unshift(this._discoverTitle());
    }

    return lines;
  }

}

class PageSplitter {
  static async split({pageuuid = null, targetuuid = null, level = null, type = 'text'}) {
    const fields = [
      new foundry.data.fields.StringField({label: 'Page to Split'}).toFormGroup({}, {name: 'pageuuid', value: pageuuid}).outerHTML,
      new foundry.data.fields.DocumentUUIDField({label: 'Target Journal'}).toFormGroup({}, {name: 'targetuuid', value: targetuuid}).outerHTML,
      new foundry.data.fields.NumberField({label: 'Split at Header'}).toFormGroup({}, {name: 'level', value: level, choices: {1: 1, 2: 2, 3: 3, 4: 4, 5: 5}}).outerHTML,
      new foundry.data.fields.StringField({label: 'Create as Type'}).toFormGroup({}, {name: 'type', value: type ?? 'text'}).outerHTML,

    ]

    const content = `<fieldset>${fields.join('')}</fieldset>`;

    const answer = await foundry.applications.api.DialogV2.prompt({
      content,
      title: 'Split Page by Headers',
      ok: {
        callback: (event, button) => new FormDataExtended(button.form).object
      },
      position: {top: 100},
      rejectClose: true
    })

    pageuuid = answer.pageuuid;
    targetuuid = answer.targetuuid;
    level = answer.level;
    type = answer.type;

    const targetHeaders = Array.from({length: level}, (v, i) => `h${i + 1}`);
    const elementToSplitOn = `:is(${targetHeaders.join(',')})`

    const page = await fromUuid(pageuuid);
    const journal = await fromUuid(targetuuid);

    function nextUntil(elem, selector, filter) {

      // matches() polyfill
      if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
      }

      // Setup siblings array
      const siblings = [];

      // Get the next sibling element
      elem = elem.nextElementSibling;

      // As long as a sibling exists
      while (elem) {

        // If we've reached our match, bail
        if (elem.matches(selector)) break;

        // If filtering by a selector, check if the sibling matches
        if (filter && !elem.matches(filter)) {
          elem = elem.nextElementSibling;
          continue;
        }

        // Otherwise, push it to the siblings array
        siblings.push(elem);

        // Get the next sibling element
        elem = elem.nextElementSibling;

      }

      return siblings;

    };

    const div = document.createElement("div");
    div.innerHTML = page.text.content;
    const headings = div.querySelectorAll(elementToSplitOn);
    const pageData = [];

    for (const heading of headings) {
      let siblings = nextUntil(heading, elementToSplitOn);
      let pageHTML = "";
      for (const sibling of siblings) {
        pageHTML += sibling.outerHTML;
      }
      pageData.push({type, name: heading.innerText ?? '(No Title)', "text.content": pageHTML, "title.level": heading.tagName.at(1)});

    }

    await journal.createEmbeddedDocuments("JournalEntryPage", pageData);
  }
}

class ItemExtractor extends CONFIG.Item.documentClass {
  static async create(data = {}, operation = {}) {
    operation.keepId = true;
    return super.create(data, operation);
  }

  static get implementation() {return this};

  static nameFromChildren(childNodes) {
    while (childNodes.length > 0) {
      const node = childNodes[0];
      let nodeText = "";

      if (node.hasChildNodes()) {
        nodeText = this.nameFromChildren(node.childNodes);
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
  }


  static async extract() {
    const {range: fullRange = null} = Extractor.getSelection();
    const fragment = fullRange.cloneContents();

    const wrapper = document.createElement("div");
    wrapper.appendChild(fragment);

    /* try to figure out where the name of the document lives */
    let name = this.nameFromChildren(wrapper.childNodes);
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

    const answer = await Extractor.promptContext('Item');
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
      _id: Extractor.staticID(name, answer.prefix),
      type: answer.type ?? 'feat',
      folder: answer.folder,
      name,
      "system.description.value": description,
      "system.price": price,
      "system.prerequisites.level": itemLevel,
    });

    /* Creation Context */
    const context = Extractor.validateTarget({id: data._id, type: 'Item', target: answer.target});

    const item = await ItemExtractor.createDialog(data, context);
    const embedText = `@Embed[${item.uuid} classes="caption-top item-card"]{${caption}}`;
    navigator.clipboard.writeText(embedText);
    ui.notifications.info(`"${embedText}" written to clipboard.`);
    await game.user.setFlag('%id%', 'item-extractor', {type: item.type, folder: item.folder?.id});
  }
}

