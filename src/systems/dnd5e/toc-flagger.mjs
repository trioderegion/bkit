class ToCEntryData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      title: new fields.StringField({required: false, label: 'Custom Title'}),
      type: new fields.StringField({required: false, label: 'Type', choices: {
        chapter: 'Chapter',
        appendix: 'Appendix',
        special: 'Special',
        header: 'Header',
      }}),
      showPages: new fields.BooleanField({required: false, label: 'Show Pages', initial: undefined}),
      position: new fields.NumberField({required: false, label: 'Position', positive: true, integer: true, initial: undefined}),
      append: new fields.NumberField({required: false, label: 'Append Position*', positive: true, integer: true, initial: undefined}),
      order: new fields.NumberField({required: false, label: 'Sort Order*', positive: true, integer: true, initial: undefined}),
    };
  }
}

class ToCPageData extends foundry.abstract.DataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      tocHidden: new fields.BooleanField({required: false, initial: undefined, label: 'Hide Page'}),
    };
  }
}


export default class ToCFlagger extends foundry.applications.api.ApplicationV2 {

  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ['standard-form'],
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      handler: this.prototype.submitHandler,
    }
  }

  static {
    Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
      controls.push({
        icon: 'fa-solid fa-table-columns',
        label: 'Configure ToC',
        onClick: () => new this({
          document: app.options.document
        }).render({force: true}),
        visible: () => app.options.document?.documentName.includes('JournalEntry'),
      });
    });
  }

  _initializeApplicationOptions(options) {
    options = super._initializeApplicationOptions(options);
    options.window.title = `ToC Flagging ${options.document.documentName}: ${options.document.name}`;
    return options;
  }
  
  
  get isPage() {
    return this.options.document.documentName === 'JournalEntryPage';
  }

  get document() {
    return this.options.document;
  }

  tocData = null;

  constructor(options) {
    super(options);

    this.tocData = this.isPage ? new ToCPageData() : new ToCEntryData();
    this.tocData.updateSource(foundry.utils.getProperty(this.document, 'flags.dnd5e'));
  }

  async submitHandler(evt, form, data) {
    const combinedData = data.object;

    if ('title' in combinedData) {
      combinedData.title = !!combinedData.title ? combinedData.title : null;
    }

    this.tocData.updateSource(combinedData);
    await this.document.update({'flags.dnd5e': this.tocData.toObject()});
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.entries = Object.keys(this.tocData.schema.fields).map( field => ({
      field: this.tocData.schema.fields[field],
      value: this.document.getFlag('dnd5e', field),
    }));

    return context;
  }

  async _renderHTML(context, options) {
    const buttons = await foundry.applications.handlebars.renderTemplate("templates/generic/form-footer.hbs", {buttons: [{type: 'submit', label: 'Submit'}]});

    /* Render entry inputs */ 
    const entryInputs = context.entries.map( data => data.field.toFormGroup({}, {value: data.value}) );

    entryInputs.push(buttons);

    return entryInputs;
  }

  _replaceHTML(elements, content, options) {
    const footer = elements.pop();
    content.replaceChildren(...elements);
    content.insertAdjacentHTML('beforeend', footer);
  }
}
