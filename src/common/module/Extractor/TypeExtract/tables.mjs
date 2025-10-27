import ExtractorBase from './base.mjs';

class KeepIdTable extends CONFIG.RollTable.documentClass {
  static async create(data = {}, operation = {}) {
    operation.keepId = true;
    return super.create(data, operation);
  }

  static get implementation() {return this};
}

export default class TableExtractor extends ExtractorBase {

  static {
    Hooks.on('%id%.extractorEntries', entries => {
      entries.push({
        title: 'Extract Table',
        action: 'extract-table',
        cmd: (state, dispatch, view) => this.extract(state, view)
      });
    })
  }

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
    super();
    this.table = tableElement;
    this.lines = this._extract();
  }

  get documentName() {
    return 'RollTable';
  }

  async parse() {
    const lines = foundry.utils.duplicate(this.lines);
    const firstLine = lines.shift().replace('’', "'").replace('“', '"').replace('”', '"')
    const [pName, ...pDesc] = firstLine.split('.');
    const description = pDesc.join('.').trim();

    const answers = await this.promptContext('RollTable', {name: pName});
    const id = this.genID(answers.name, answers.prefix);
    const context = await this.validateTarget({id, type: 'RollTable', target: answers.target});

    const formula = lines.shift();
    const resultLabel = lines.shift().replace(/\<[^\>]*\>/g, '').trim();

    const rawPairs = [];
    while (lines.length) {
      const range = lines.shift();
      const resultLines = []
      do {
        resultLines.push(lines.shift());
      } while (this.parseRange(lines.at(0)).some(isNaN))

      const text = resultLines.join();

      rawPairs.push([range, text]);
    }

    const results = rawPairs.map(([range, value]) => this._createEntry(range, value));

    const data = {_id: id, name: answers.name, results, formula, description};

    await KeepIdTable.createDialog(data, context).then(table => {
      table.sheet.render(true);
      navigator.clipboard.writeText(`@Embed[${table.uuid} rollable classes="caption-top" resultLabel="${resultLabel}"]{${answers.name}}`);
    });
  }

  _createEntry(range, value) {
    const parsedRange = this.parseRange(range);
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

    if (node.classList.contains('ProseMirror')) return this.extract.name;

    return node?.previousElementSibling?.textContent.trim() ?? this.extract.name;
  }

  _extract() {
    const entries = []

    /* If the table has a caption element, it will be grabbed.
     * Otherwise, look at the prior sibling of this table */
    if (!this.table.querySelector('caption')) {
      entries.push([this._discoverTitle()]);
    } else {
      entries.push([this.table.querySelector('caption').innerText.trim()])
    }

    const rows = this.table.getElementsByTagName('tr');
    for (const row of rows) {
      const headers = row.getElementsByTagName('th')
      if (headers.length) {
        const [first, ...rest] = headers;
        const result = rest.map( e => e.innerText ).join(''); 
        entries.push([first.innerText.trim(), result.trim()]);
      }

      const cells = row.getElementsByTagName('td');
      if (cells.length) {
        const [first, ...rest] = cells;
        const result = rest.map( e => e.innerHTML ).join(''); 
        entries.push([first.innerText.trim(), result.trim()]);
      } 
    }
    console.debug(entries); 
    return entries.flat();
  }

}
