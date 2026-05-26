import ExtractorBase from './base.mjs';

export default class PageSplitter extends ExtractorBase {

  static {
    Hooks.on('getJournalEntryPageContextOptions', (journal, options) => {
      options.push({
        name: 'Split on Headers',
        icon: '<i class="fa-solid fa-code-branch"></i>',
        callback: header => {
          const li = header.closest(".page");
          const us = journal.document.pages.get(li.dataset.pageId);
          (new this().split({pageuuid: us.uuid, targetuuid: us.parent.uuid, level: 3, type: 'text'}));
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
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
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

    /* Insert faux header representing the page title/header */
    const fauxLevel = page.title.level;
    const fauxHeader = `<h${fauxLevel}>${page.name}</h${fauxLevel}>`;
    div.insertAdjacentHTML('afterbegin', fauxHeader);

    const headings = div.querySelectorAll(elementToSplitOn);

    const pageData = Array.from(headings).map( (heading, index) => {

      const _id = index == 0 ? page.id : this.genID(heading.innerText ?? 'split');
      if (index != 0) this.validateTarget({id: _id, type: this.documentName, target: targetuuid}); 

      const siblings = nextUntil(heading, elementToSplitOn);
      const pageHTML = siblings.map( sib => sib.outerHTML ).join('');

      if (index == 0) return {
        text: {content: pageHTML},
      }

      return {
        _id,
        type,
        name: (heading.innerText ?? '[Split Page]'),
        sort: (page.sort + 100 * index),
        'text.content': pageHTML,
        'title.level': (heading.tagName?.at(1) ?? 1),
      }

    });

    const [update, ...creation] = pageData;
    await journal.createEmbeddedDocuments("JournalEntryPage", creation, {keepId: true});
    await page.update(update);
  }
}

