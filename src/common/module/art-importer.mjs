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

  static imagePageData(images, category, level) {

    const data = images.map( path => {
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

    return data;
  }

  static async importTo(journal) {
    const categories = journal.categories.reduce( (acc, curr) => {
      acc[curr._id] = curr.name;
      return acc;
    }, {});

    const pickerField = new foundry.applications.elements.HTMLFilePickerElement();
    Object.assign(pickerField, { type: 'folder', noupload: true, name: 'anchor' });

    const fields = [
      //new foundry.data.fields.FilePathField({label: 'From', categories: ['image']}).toFormGroup({}, {name: 'anchor', }),
      pickerField,
      new foundry.data.fields.StringField({label: 'Category', choices: categories}).toFormGroup({}, {name: 'category',}),
      new foundry.data.fields.NumberField({label: 'Level', choices: {1:1,2:2,3:3}}).toFormGroup({}, {name: 'level'}),
      new foundry.data.fields.BooleanField({label: 'Recursive?'}).toFormGroup({}, {name: 'recursive', value: true}),
    ]

    const fieldset = document.createElement('fieldset');
    fieldset.append(...fields)

    const div = document.createElement('div');
    div.appendChild(fieldset);

    const {anchor, category, level, recursive} = await foundry.applications.api.DialogV2.prompt({
      content: div,
      window: {title: 'Configure Image Import', },
      ok: {
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
      },
      position: {top: 100},
      rejectClose: false,
    })

    ui.notifications.info('Selected: ' + anchor);
    
    //const parts = anchor.split('/');
    //parts.pop();
    //const queue = [parts.join('/')];
    const queue = [anchor];
    const extensions = Object.keys(CONST.IMAGE_FILE_EXTENSIONS).map(k => `.${k}`);

    const images = [];
    while (queue.length) {
      const folder = queue.pop();
      const {dirs, files} = await foundry.applications.apps.FilePicker.implementation.browse('data', folder, {extensions});
      if (recursive) queue.push(...dirs);
      images.push(...files);
    }

    const data = await this.imagePageData(images, category, level);
    console.debug('Art data', data);
    await journal.createEmbeddedDocuments('JournalEntryPage', data);
  }
}
