import ExtractorBase from './base.mjs';

export default class PageSplitter extends ExtractorBase {

  static {
    Hooks.on('%id%.extractorEntries', entries => {
      entries.push({
        title: 'Split Headers',
        action: 'split-headers',
        cmd: (state, dispatch, view) => {
          const element = view.dom.closest('prose-mirror');
          const pageuuid = element?.dataset?.documentUuid;
          new this().split({pageuuid});
        }
      });
    });
  }

  get documentName() {
    return 'JournalEntryPage';
  }

  async split({pageuuid = null, targetuuid = null, level = null, type = 'text'}) {
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

      const name = heading.innerText ?? '(No Title)';
      const _id = this.genID(name);
      this.validateTarget({id: _id, type: this.documentName, target: targetuuid}); 
      pageData.push({_id, type, name, "text.content": pageHTML, "title.level": heading.tagName.at(1)});

    }

    await journal.createEmbeddedDocuments("JournalEntryPage", pageData, {keepId: true});
  }
}

