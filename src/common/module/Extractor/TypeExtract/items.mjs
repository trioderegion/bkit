import ExtractorBase from './base.mjs';

class KeepIdItem extends CONFIG.Item.documentClass {
  static async create(data = {}, operation = {}) {
    operation.keepId = true;
    return super.create(data, operation);
  }

  static get implementation() {return this};
}

/** @TODO some parsing is system specific, but should "fail" gracefully */
export default class ItemExtractor extends ExtractorBase {

  static {
    Hooks.on('%id%.extractorEntries', entries => {
      entries.push({
        title: 'Extract Item',
        action: 'extract-item',
        cmd: () => new this().extract()
      });
    })
  }

  get documentName() {
    return 'Item';
  }

  nameFromChildren(childNodes) {
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

  async extract() {
    const {range: fullRange = null} = this.getSelection();
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

    let description = wrapper.innerHTML.trim();
    description = description.startsWith('.') ? description.substring(1).trim() : description;
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


    if (name.length < 1) {
      ui.notifications.warning(
        "Could not identify putative document name from selection"
      );
      return;
    }

    const answer = await this.promptContext('Item', {name});
    if (!answer) return;

    /* if a non <p> is the remaining first child, its likely an inline item */
    if (!['H1', 'H2', 'H3', 'P'].includes(wrapper.firstChild.nodeName)) {
      const parawrapper = document.createElement("p");
      parawrapper.replaceChildren(...wrapper.childNodes);
      wrapper.replaceChildren(parawrapper);
    }
    
    /* Creation Data */
    const data = foundry.utils.expandObject({
      _id: this.genID(answer.name, answer.prefix),
      type: answer.type ?? 'feat',
      folder: answer.folder,
      name: answer.name,
      "system.description.value": description,
      "system.price": price,
      "system.prerequisites.level": itemLevel,
    });

    /* Creation Context */
    const context = await this.validateTarget({id: data._id, type: 'Item', target: answer.target});

    const item = await KeepIdItem.createDialog(data, context);
    const embedText = `@Embed[${item.uuid} classes="caption-top item-card"]{${caption}}`;
    navigator.clipboard.writeText(embedText);
    ui.notifications.info(`"${embedText}" written to clipboard.`);
    await game.user.setFlag('%id%', 'Item-extractor', {type: item.type, folder: item.folder?.id});
  }
}

