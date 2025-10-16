class FlagData extends foundry.abstract.DataModel {
  static get scope() {
    return 'dnd5e';
  }

  static get inner() {
    return '';
  }

  static get flagPath() {
    return `flags.${this.scope}${this.inner}`;
  }

  read(doc) {
    return foundry.utils.getProperty(doc, this.constructor.flagPath);
  }

  updateFrom(doc) {
    return this.updateSource(this.read(doc));
  }
}


class ToCEntryData extends FlagData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      title: new fields.StringField({required: false, label: 'Custom Title', nullable: true}),
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

  static cleanData(source = {}, options = {}) {
    const data = super.cleanData(source, options);
    data.title = !!data.title ? data.title : null;
    return data;
  }
}

class ToCPageData extends FlagData {

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      tocHidden: new fields.BooleanField({required: false, initial: undefined, label: 'Hide Page'}),
    };
  }
}

class NavData extends FlagData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      previous: new fields.DocumentIdField({required: false, readonly: false, initial: undefined, label: 'Previous (ID)'}),
      next: new fields.DocumentIdField({required: false, readonly: false, initial: undefined, label: 'Next (ID)'}),
      up: new fields.DocumentIdField({required: false, readonly: false, initial: undefined, label: 'Up (ID)'})
    }
  }

  static get inner() {
    return '.navigation';
  }
}

export default class Flagger extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    tag: 'form',
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      handler: this.prototype.submitHandler,
    },
    window: {
      contentClasses: ['standard-form']
    }
  }

  static APP_CONTROLS = {
    icon: 'fa-table-columns',
    label: 'Configure Flags',
    field: '',
  }

  static hook() {
    Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
      controls.push({
        icon: `fa-solid ${this.APP_CONTROLS.icon}`,
        label: this.APP_CONTROLS.label,
        onClick: () => new this({
          document: app.options.document
        }).render({force: true}),
        visible: () => this.compatible(app.options.document),
      });
    });
  }

  static compatible(doc) {
    return !!doc?.id;
  }

  flagData = null;

  get document() {
    return this.options.document;
  }

  constructor(flagModel, options) {
    super(options);

    this.flagData = new flagModel();
    this.flagData.updateFrom(this.document);
  }

  _initializeApplicationOptions(options) {
    options = super._initializeApplicationOptions(options);
    options.window.title = `Flagging ${options.document.documentName}: ${options.document.name}`;
    return options;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    this.flagData.updateFrom(this.document);
    context.entries = Object.entries(this.flagData.schema.fields).map( ([key, field]) => ({
      field,
      value: this.flagData[key],
    }));

    return context;
  }

  _ingestSubmit(update) {
    return update;
  }

  async submitHandler(evt, form, data) {
    const updateData = this._ingestSubmit(data.object);
    this.flagData.updateSource(updateData);
    await this.document.update({[this.flagData.constructor.flagPath]: this.flagData.toObject()});
  }

  async _renderHTML(context, options) {
    const buttons = await foundry.applications.handlebars.renderTemplate("templates/generic/form-footer.hbs", {buttons: [{type: 'submit', label: 'Submit'}]});

    /* Render entry inputs */ 
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.innerText = this.constructor.APP_CONTROLS.field;
    fieldset.appendChild(legend);
    context.entries.forEach( data => fieldset.appendChild(data.field.toFormGroup({}, {value: data.value})) );

    return [fieldset, buttons];
  }

  _replaceHTML(elements, content, options) {
    const footer = elements.pop();
    content.replaceChildren(...elements);
    content.insertAdjacentHTML('beforeend', footer);
  }
}

class ToCFlagger extends Flagger {

  static APP_CONTROLS = {
    icon: 'fa-table-columns',
    label: 'ToC Flags',
    field: 'Table of Contents',
  }

  static {
    this.hook();
  }

  static compatible(doc) {
    return super.compatible(doc) && (doc?.documentName.includes('JournalEntry') ?? false);
  }

  constructor(options) {
    const model = options.document?.documentName === 'JournalEntryPage' ? ToCPageData : ToCEntryData;
    super(model, options);
  }
}

class NavFlagger extends Flagger {
  static APP_CONTROLS = {
    icon: 'fa-compass',
    label: 'Nav Flags',
    field: 'Navigation',
  }

  static compatible(doc) {
    return super.compatible(doc) && (doc.documentName == 'JournalEntry')
  }

  static {
    this.hook();
  }

  constructor(options) {
    super(NavData, options);
  }
}
