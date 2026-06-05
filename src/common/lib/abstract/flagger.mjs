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
    },
    actions: {
      reset: this.#reset,
    }
  }

  static APP_CONTROLS = {
    icon: 'fa-table-columns',
    label: 'Configure Flags',
    field: '',
  }

  static FLAG_MODEL = foundry.abstract.DataModel;

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

  static #reset(evt, data) {
    this._reset().then(_ => this.close());
  }

  constructor(options) {
    super(options);

    this.flagData = new this.constructor.FLAG_MODEL;
  }

  _reset() {
    const model = this.flagData.constructor;

    /* Flag data is held directly on the package scope */
    if (model.inner.length == 0) {
      const keys = Object.keys(this.flagData.schema.fields);
      return Promise.all(keys.map(key => 
        this.document.unsetFlag(this.flagData.constructor.scope, key)
      ));
    }

    /* flag data is a key within a package scope */
    if (model.inner.length == 1) {
      return this.document.unsetFlag(this.constructor.FLAG_MODEL.scope, this.constructor.FLAG_MODEL.inner.at(0));
    }

    if (model.inner.length > 1) {
      return ui.notifications.error('Complex flag structure requires specific _reset implementation! No updates performed.');
    }
  }

  get document() {
    return this.options.document;
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
    this.document.render({force: true});
  }

  async _renderHTML(context, options) {
    const buttons = await foundry.applications.handlebars.renderTemplate("templates/generic/form-footer.hbs", {buttons: [{type: 'submit', label: 'Submit'}, {type: 'button', label: 'Unset Flags', action: 'reset'}]});

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
