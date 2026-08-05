import ExtractorBase from './base.mjs';
import PageSplitter from './pages.mjs';

class KeepIdJournal extends CONFIG.JournalEntry.documentClass {
  static async create(data = {}, operation = {}) {
    operation.keepId = true;
    return super.create(data, operation);
  }

  static get implementation() {return this};
}

class JournalEntryExtractor extends ExtractorBase {
  static {

    Hooks.on('getJournalEntryPageContextOptions', (journal, options) => {
      options.push({
        name: 'Split into New',
        icon: '<i class="fa-solid fa-code-branch"></i>',
        callback: header => {
          const li = header.closest(".page");
          const us = journal.document.pages.get(li.dataset.pageId);
          (new this().extract({pageuuid: us.uuid}));
        }
      });
    });

  }

  get documentName() {
    return 'JournalEntry';
  }
  
  async extract({pageuuid}) {
    //const {range: fullRange = null} = this.getSelection();
    //const fragment = fullRange.cloneContents();

    //const wrapper = document.createElement("div");
    //wrapper.appendChild(fragment);

    ///* try to figure out where the name of the document lives */
    //let name = this.nameFromChildren(wrapper.childNodes);
    const sourcePage = await fromUuid(pageuuid);
    const answer = await this.promptContext(this.documentName, {name: sourcePage.name});
    if (!answer) return;

    /* Creation Data */
    const data = foundry.utils.expandObject({
      _id: this.genID(answer.name, answer.prefix),
      folder: answer.folder,
      name: answer.name,
    });

    /* Creation Context */
    const context = await this.validateTarget({id: data._id, type: this.documentName, target: answer.target});

    const journal = await KeepIdJournal.createDialog(data, context);

    await game.user.setFlag('%id%', this.documentName + '-extractor', {folder: journal.folder?.id});

    const pager = new PageSplitter();
    await pager.split({pageuuid, targetuuid: journal.uuid, level: 2, type: 'text', removeSource: false});
  }
}
