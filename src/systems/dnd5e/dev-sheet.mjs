import './dev-sheet.scss';

export default class DevSheet5e {

  static {
    Hooks.on("renderItemSheet5e", (app) => app.constructor.itemHasActivities(app.document) ? app.changeTab('activities', 'primary') : void 0);
  }

}
