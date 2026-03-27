import { NavData } from "./toc-flagger.mjs";

class NavFromToC {
  static {
    Hooks.on('getHeaderControlsTableOfContentsCompendium', (app, controls) => {
      controls.push({
        icon: `fa-solid fa-sitemap`,
        label: 'Generate Navigation',
        onClick: () => NavFromToC.genNav(app),
      });
    });
  }

  static async genNav(tocApp) {

    const chapterId = (page) => page?.entryId ?? page?.id;
    
    const {chapters} = await tocApp._prepareContext();
    let lastJournal = chapterId(chapters.at(-1)?.pages.at(-1));

    /* Top level entries are 'chapters' that will have at least one page */
    await Promise.all(chapters.flatMap( (chapter, cIdx, cArray) => {

      /* Sibling pages are individual entries, just grab one
       * entry per parent journal ID */
      const uniquePages = chapter.pages.reduce( (list, page) => {
        if (list.find( entry => chapterId(entry) === chapterId(page) )) return list;
        list.push(page);
        return list;
      }, []);

      return uniquePages.map( (page, pIdx, pArray) => {

        /* UP returns to chapter page if not already the chapter page */
        const up = chapterId(page) !== chapter.id ? chapter.id : null;
        
        /* NEXT points to the next (unique) page in this chapter,
         * or first page of next chapter */
        const next = (pIdx + 1) < pArray.length //do we have more pages?
                      ? chapterId(pArray.at(pIdx + 1)) //use that page's journal
                      : (cIdx + 1) < cArray.length //do we have more chapters?
                        ? cArray.at(cIdx + 1).id //use that chapter journal
                        : cArray.at(0).id //wrap around to the first chapter

        /* PREVIOUS points to the last journal processed
         * unless it is also our 'UP' link */
        const previous = lastJournal === up ? null : lastJournal;
        
        /* Latch data and move the last journal marker */
        const data = new NavData({up, next, previous}); 
        lastJournal = chapterId(page);

        const journalUUID = tocApp.collection.index.get(chapterId(page))?.uuid;
        //console.table({cIdx, chapter, pIdx, page, up, next, previous});

        return foundry.utils.fromUuid(journalUUID).then( j => j.update({[data.constructor.flagPath]: data.toObject()}))
         
      });
    }));
  }
}


