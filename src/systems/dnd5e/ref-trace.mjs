const findReferences = (text) => {
  const regex = /(?:@Embed|@UUID)\[([a-zA-Z0-9\.\-]*)\W/gi;
  let result;
  const uuids = []
  while (result = regex.exec(text)) {
    uuids.push(result.at(1));
  }

  return uuids;
}

const collectEntries = (folder, entries = []) => {
  entries.push(...folder.contents);
  folder.children.forEach(child => collectEntries(child.folder, entries));
  return entries;
}

class ReferenceTracer {

  static DEFAULT_ANSWERS = {
    first: 'folder.name',
    second: 'parsed.type',
    ignore: ['core', 'world'],
  }

  static {
    Hooks.on('getFolderContextOptions', this.#addFolderContext);
  }

  static #addFolderContext(directory, options) {
    options.push({
      name: 'Trace References',
      icon: '<i class="fa-solid fa-diagram-project"></i>',
      condition: header => {
        const li = header.closest(".directory-item");
        const folder = fromUuidSync(li.dataset.uuid);
        return folder.type === 'JournalEntry';
      },
      callback: async header => {
        const li = header.closest(".directory-item");
        const folder = await fromUuid(li.dataset.uuid);
        return ReferenceTracer.trace(folder);
      }
    });
  }

  static async trace(folder = null) {
    const defaults = game.user.getFlag('%id%', 'reference-tracer') ?? ReferenceTracer.DEFAULT_ANSWERS;
    const fields = [
      new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {label: 'Ignore Packs:'}).toFormGroup({}, {name: 'ignore', value: defaults.ignore, options: game.getPackageScopes().map(pkg => ({value: pkg, label: pkg}))}).outerHTML,
      new foundry.data.fields.StringField({label: 'First by:'}).toFormGroup({}, {placeholder: ReferenceTracer.DEFAULT_ANSWERS.first, name: 'first', value: defaults.first}).outerHTML,
      new foundry.data.fields.StringField({label: 'Then by:'}).toFormGroup({}, {placeholder: ReferenceTracer.DEFAULT_ANSWERS.second, name: 'second', value: defaults.second}).outerHTML,
    ]

    const content = `<p>Provided scope: uuid, doc, page, journal, folder, parsed.</p><fieldset>${fields.join('')}</fieldset>`;

    const answer = await foundry.applications.api.DialogV2.prompt({
      content,
      window: {title: 'Collate journal references by field', },
      ok: {
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
      },
      position: {top: 100},
      rejectClose: true
    });

    const {first = null, second = null} = answer;
    if (!first) return;

    await game.user.setFlag('%id%', 'reference-tracer', answer);

    let references = [];
    const seenRefs = new Set();

    const addReference = async (uuid, fromDoc, fromJournal, fromFolder, relativeTo = null) => {
      relativeTo ??= fromDoc;
      const parsed = foundry.utils.parseUuid(uuid, {relative: fromDoc});
      const packSource = parsed.collection?.metadata?.packageName;
      if (packSource && answer.ignore.includes(packSource)) return;
      if (seenRefs.has(parsed.uuid)) return;
      seenRefs.add(parsed.uuid);
      const data = {
        uuid: parsed.uuid,
        parsed,
        doc: await fromUuid(parsed.uuid),
        page: fromDoc,
        journal: fromJournal,
        folder: fromFolder,
      }

      references.push(data);
      return data;
    }

    const exploreJournals = folder ? collectEntries(folder) : game.journal;

    for (const journal of exploreJournals) {
      if (journal.folder.name.startsWith('_')) continue;
      await addReference(journal.uuid, journal.folder, journal, journal.folder, journal);
    }

    /* Second order references (appending until exhaustion) */
    for (let i = 0; i < references.length; i++) {
      const ref = references.at(i);

      if (!ref.doc) continue;
      let text = '';

      switch (ref.doc.documentName) {
        case 'JournalEntry': {
          for (const page of ref.doc.pages) {
            await addReference(page.uuid, ref.doc, ref.doc, ref.folder);
          }
          break;
        }
        case 'JournalEntryPage': {
          text = JSON.stringify(ref.doc.toObject());
          break;
        }
        case 'Actor': {
          text = JSON.stringify(foundry.utils.getProperty(ref.doc.system, 'details.biography') ?? foundry.utils.getProperty(ref.doc.system, 'description'));
          for (const item of ref.doc.items) {
            await addReference(item.uuid, ref.doc, ref.journal, ref.folder);
          }
          break;
        }
        case 'RollTable':
          text = (ref.doc.description ?? '')
            + " (description) "
            + ref.doc.results.contents.map(r =>
              r.documentUuid ? `@UUID[${r.documentUuid}] ${r.description}` : r.description);
          break;
        case 'Item': {
          text = JSON.stringify(ref.doc.system.description);
          for (const effect of ref.doc.effects) {
            await addReference(effect.uuid, ref.doc, ref.journal, ref.folder, effect.parent);
          }
          break;
        }
        case 'Scene': {
          for (const token of ref.doc.tokens) {
            await addReference(token.baseActor?.uuid, ref.doc, ref.doc.journal, ref.doc.folder);
          }

          break;
        }
        case 'ActiveEffect': {
          text = JSON.stringify(ref.doc.description);
          break;
        }
      }

      if (text) await Promise.all(findReferences(text).map(uuid => addReference(uuid, ref.doc, ref.journal, ref.folder)));
    }

    references = references.filter( ref => ref.doc?.parent?.uuid !== ref.page.uuid );

    const primaryGrouping = Object.groupBy(references, (r) => foundry.utils.getProperty(r, first));
    let html = '';
    for (const [primaryGroup, entries] of Object.entries(primaryGrouping)) {
      html += `<h3>${primaryGroup}</h3>`;
      //console.debug(entries);
      const secondaryGrouping = second ? Object.groupBy(entries, (r) => foundry.utils.getProperty(r, second)) : {'*': entries};
      for (const [secondaryGroup, results] of Object.entries(secondaryGrouping)) {
        const deduped = Map.groupBy(results, ({uuid}) => uuid);

        const resultLinks = [...deduped.entries()].map(([uuid, matches]) => {
          const seen = [...new Set(matches.map(r => r.page))].map(page => page?.toAnchor().outerHTML);
          const adv = [...new Set(matches.map(r => r.folder))].map(folder => folder.name);
          const doc = matches.at(0).doc;
          const link = doc ? doc.toAnchor().outerHTML : uuid;
          const cssCls = doc ? '' : 'class="notification error"';
          return `<li ${cssCls}>${link} — ${seen.join(', ')}` + ((first == 'folder.name' || second == 'folder.name') ? '' : ` <em>(${Array.from(new Set(adv)).join(', ')})</em></li>`);
        });

        html += `${second ? '<h4>' + secondaryGroup + '</h4>' : ''}
          <details><summary>References — ${resultLinks.length}</summary>
          <ol>
            ${resultLinks.join('')}
          </ol></details>`;
      }

      html += '<hr>';
    }

    html = '<div style="max-height: 80vh;overflow-y:scroll;min-width:max-content;">' + html + '</div>';

    foundry.applications.api.DialogV2.prompt({
      window: {
        resizable: true,
      },
      rejectClose: false,
      content: html,
      ok: {
        label: 'Close',
      }
    });

    this.createManifest(references);
  }

  static createManifest(references = []) {
    const nonWorld = references.filter(ref => (('metadata' in ref.parsed.collection) && ref.doc));

    const dbKeys = nonWorld.map(ref => {
      const collection = [ref.doc.collectionName];
      const id = [ref.doc.id];

      if (ref.doc.isEmbedded) {
        collection.unshift(ref.doc.parent.collectionName);
        id.unshift(ref.doc.parent.id);
      }

      return `!${collection.join('.')}!${id.join('.')}`;
    });

    //const deduped = Object.groupBy(references, ({parsed}) => parsed.collection.metadata?.name ?? 'WORLD');
    
    const manifest = nonWorld.reduce( (acc, ref) => {
      const pack = ref.parsed.collection.metadata.name;
      acc[pack] ??= {};
      
      const primaryId = ref.parsed.primaryId ?? ref.parsed.id;
      acc[pack][primaryId] ??= {};
      if (ref.doc.isEmbedded) {
        acc[pack][primaryId][ref.doc.collectionName] ??= [];
        acc[pack][primaryId][ref.doc.collectionName].push(ref.doc.id);
      }

      return acc;
    }, {} )

    console.log(dbKeys, manifest);
  }
}
