class ArtImport {
  static {
    Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
      controls.push({
        icon: 'fa-solid fa-file-import',
        label: 'Import Artwork',
        onClick: () => this.importTo(app.document),
        visible: () => app.document?.constructor.documentName === "JournalEntry",
      });
    });
  }

  static async importTo(journal) {
    const categories = journal.categories.reduce( (acc, curr) => {
      acc[curr._id] = curr.name;
      return acc;
    }, {});

    const fields = [
      new foundry.data.fields.FilePathField({label: 'From', categories: ['IMAGE']}).toFormGroup({}, {name: 'anchor', }),
      new foundry.data.fields.StringField({label: 'Category', choices: categories}).toFormGroup({}, {name: 'category',}),
      new foundry.data.fields.NumberField({label: 'Level', choices: {1:1,2:2,3:3}}).toFormGroup({}, {name: 'level'}),
    ]

    const fieldset = document.createElement('fieldset');
    fieldset.append(...fields)

    const div = document.createElement('div');
    div.appendChild(fieldset);

    const {anchor, category, level} = await foundry.applications.api.DialogV2.prompt({
      content: div,
      window: {title: 'Clone Document Into', },
      ok: {
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
      },
      position: {top: 100},
      rejectClose: false,
    })

    ui.notifications.info('Selected: ' + anchor);
    
    const parts = anchor.split('/');
    parts.pop();

    const folder = parts.join('/');
    const images = await foundry.applications.apps.FilePicker.implementation.browse('data', folder);

    const data = images.files.map( path => {
      const parts = path.split('/');
      const fileName = parts.at(-1);
      const slugName = fileName.slice(0, fileName.lastIndexOf('.'));
      const name = slugName.split('-').filter( p => p).map( p => ['of', 'and'].includes(p) ? p : p.capitalize() ).join(' ');

      return {
        type: 'image',
        category,
        title: {
          level,
          show: false,
        },
        name,
        src: path,
      }
    });
    console.debug('Art data', data);
    await journal.createEmbeddedDocuments('JournalEntryPage', data);
  }
}
