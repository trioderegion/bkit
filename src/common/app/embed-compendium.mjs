class EmbedConfig extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      config: new fields.StringField({required: false, label: 'Config', nullable: true}),
      options: new fields.StringField({required: false, label: 'Options', nullable: true}),
      level: new fields.NumberField({required: false, label: 'Page Level', nullable: false, initial: 1, choices: {1:1, 2:2, 3:3}}),
      show: new fields.BooleanField({required: true, label: 'Show Title', initial: false, nullable: false}),
    }
  }

  saveState() {
    return game.user.setFlag('%id%', 'embedConfig', this.toObject());
  }

  static loadState() {
    return new EmbedConfig(game.user.getFlag('%id%', 'embedConfig'));
  }
}

class EmbedCompendium extends foundry.applications.api.ApplicationV2 {
  static {
    Hooks.on('getCompendiumContextOptions', this.#addContextEntry);
  }

  static DEFAULT_OPTIONS = {
    tag: 'form',
    window: {
      contentClasses: ['standard-form'],
    },
    form: {
      handler: this.prototype._submitHandler,
      closeOnSubmit: true,
    },
    pack: null,
  }

  static #addContextEntry(compDirectory, menuItems) {
    menuItems.push({
      name: 'Embed All',
      icon: '<i class="fa-solid fa-anchor"></i>',
      condition: li => game.packs.get(li.dataset.pack)?.documentName !== 'Adventure',
      callback: li => {
        const pack = game.packs.get(li.dataset.pack);
        const embedder = new EmbedCompendium({pack});
        embedder.render({force: true});
      }
    });
  }

  constructor(options) {
    super(options);
    this.config = EmbedConfig.loadState();
  }

  get pack() { return this.options.pack }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.entries = Object.entries(this.config.schema.fields).map( ([key, field]) => ({
      field,
      value: this.config[key] ?? undefined,
    }));
    

    return context;
  }

  async _renderHTML(context, options) {

    const targetField = (new foundry.data.fields.DocumentUUIDField({label: 'Target Journal'})).toFormGroup({}, {name: 'target'});

    /* Entry inputs */
    const inputs = context.entries.map( e => e.field.toFormGroup({}, {value: e.value}));

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.innerText = "Embed Configuration";
    fieldset.append(legend, targetField, ...inputs);

    const wrapper = document.createElement('div');
    wrapper.append(fieldset);

    /* Footer/Submit */
    const buttons = await foundry.applications.handlebars.renderTemplate("templates/generic/form-footer.hbs", {buttons: [{type: 'submit', label: 'Embed Documents'}]});
    wrapper.insertAdjacentHTML('beforeend', buttons)
    
    return wrapper;
  }

  _replaceHTML(element, content, options) {
    content.replaceChildren(...element.children);
  }

  async _submitHandler(evt, form, data) {
    const journal = await fromUuid(data.object.target);
    const isStatblock = this.config.config.includes('statblock');
    this.config.updateSource(data.object);
    await this.config.saveState();

    const index = (await this.pack.getIndex()).contents;
    index.sort( (a, b) => a.name.localeCompare(b.name));

    const pages = index.map( entry => ({type: 'text', name: entry.name, title: {level: this.config.level, show: this.config.show}, text: {content: `${isStatblock ? '<p>@Embed[' + entry.uuid + ' inline]{' + entry.name + '}</p>' : ''}<p>@Embed[${[entry.uuid, this.config.config, this.config.options].filter(e=>e).join(' ')}]</p>`}}));

    await journal.createEmbeddedDocuments('JournalEntryPage', pages);
  }
}
