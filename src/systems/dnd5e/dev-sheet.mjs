import './dev-sheet.scss';

export default class DevSheet5e {

  static {
    game.settings.register('%id%', 'taboo', {
      name: 'Flatten Item Sheets',
      hint: "It's...tab-boo :D",
      scope: 'user',
      type: Boolean,
      config: true,
      default: false,
    });

    Hooks.on("renderActivitySheet", (app, frame) => {
      frame.classList.toggle('taboo', game.settings.get('%id%', 'taboo'));
    });

    Hooks.on("renderItemSheet5e", (app, /** @type HTMLElement */ frame) => {
      const enabled = game.settings.get('%id%', 'taboo');
      frame.classList.toggle('taboo', enabled);
      if (enabled && app.constructor.itemHasActivities(app.document)) {
        app.changeTab('activities', 'primary');
      }
    })
  }

}
