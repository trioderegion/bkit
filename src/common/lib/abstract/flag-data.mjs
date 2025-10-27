export default class FlagData extends foundry.abstract.DataModel {
  static get scope() {
    return 'world';
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
