class PageMerge {
  static {
    Hooks.on('getJournalEntryPageContextOptions', this.#addPageContext);
  }

  static #addPageContext(journal, options) {
    options.push({
      name: 'Append to Above',
      icon: '<i class="fa-solid fa-code-merge"></i>',
      condition: header => {
        const li = header.closest(".page");
        return !!li.previousElementSibling;
      },
      callback: header => {
        const li = header.closest(".page");
        const us = journal.document.pages.get(li.dataset.pageId);
        const them = journal.document.pages.get(li.previousElementSibling.dataset.pageId);
        PageMerge.merge(us, them); 
      }
    });
  }

  static async merge(us, them) {
    if (them?.type !== 'text' || us?.type !== them?.type) return ui.notifications.error('Must merge text pages');

    const ourLevel = us.title.level;
    const ourHeader = `<h${ourLevel}>${us.name}</h${ourLevel}>`;

    const ourContent = ourHeader + us.text.content;
    await them.update({'text.content': them.text.content + ourContent});
    await us.delete();
  }
}
