export default class DataView extends foundry.applications.api.ApplicationV2 {

  static DEFAULT_OPTIONS = {
    window: {
      resizable: true,
    },
    actions: {
      jsonclick: (evt, target) => {
        if (target.lastFocusedItem && 'path' in target.lastFocusedItem.dataset) {
          const root = target.dataset.path;
          const inner = target.lastFocusedItem.dataset.path;
          const path = root + inner;
          navigator.clipboard.writeText(path);
          console.log(`"${path}" copied to clipboard with value:`, foundry.utils.getProperty(target.data, inner));
        }
      }
    }
  }

  static {
    Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
      controls.push({
        icon: 'fa-solid fa-magnifying-glass',
        label: 'Inspect Data',
        onClick: () => new this({
          document: app.options.document
        }).render({force: true}),
        visible: function() { return this.options.document },
      });
    });
  }

  static TABS = {
    "app": {
      initial: 'core',
      tabs: [{
        id: 'core', icon: 'fa-solid fa-file-code', label: 'Core', path: '',
      },{
        id: 'system', icon: 'fa-solid fa-book', label: 'System', path: 'system.',
      },{
        id: 'flags', icon: 'fa-solid fa-flag', label: 'Flags', path: 'flags.'
      },{
        id: 'roll', icon: 'fa-solid fa-dice', label: 'Roll Data', functionName: 'getRollData', path: '@',
      }]
    }
  }

  _initializeApplicationOptions(options) {
    options = super._initializeApplicationOptions(options);
    options.window.title = `Inspecting ${options.document.documentName}: ${options.document.name}`;
    return options;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const {system, flags, ...core} = this.options.document.toObject();
    const roll = await this.options.document.getRollData?.();

    context.core = foundry.utils.isEmpty(core) ? null : JSON.stringify(core);
    context.system = foundry.utils.isEmpty(system) ? null : JSON.stringify(system);
    context.flags = foundry.utils.isEmpty(flags) ? null : JSON.stringify(flags);
    context.roll = foundry.utils.isEmpty(roll) ? null : JSON.stringify(roll);
    
    return context;
  }

  async _renderHTML(context, options) {
    const navHTML = await renderTemplate("templates/generic/tab-navigation.hbs", context);

    const views = Object.values(context.tabs).map( ({id, cssClass = '', functionName = null, path = ''}) => {
      const container = document.createElement('div');
      container.dataset.group = 'app';
      container.dataset.tab = id;
      const clsNames = cssClass.split(" ").filter(e => e)
      clsNames.push('tab', 'scrollable')
      
      if (foundry.utils.isEmpty(context[id])) {
        const note = document.createElement('p');
        note.innerHTML = `<em><strong>#${functionName ?? id}</strong> member ${functionName ? 'function' : ''} empty or missing.</em>`;
        note.classList.add('notification');
        container.appendChild(note);
      } else {
        const view = document.createElement('json-viewer');
        view.innerText = context[id];
        view.dataset.action = "jsonclick";
        view.dataset.path = path;
        container.appendChild(view);
      }

      container.classList.add(...clsNames);
      return container;
    });

    views.unshift(navHTML); 
    return views
  }

  _replaceHTML([navHTML, ...views], content, options) {
    content.replaceChildren(...views);
    content.insertAdjacentHTML('afterbegin', navHTML);
  }
}
