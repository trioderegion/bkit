import FlagData from '../../common/lib/abstract/flag-data.mjs';
import Flagger from '../../common/lib/abstract/flagger.mjs';

class StatblockData extends FlagData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ac: new fields.StringField({required: false, label: 'AC', nullable: true, blank: false}),
      hp: new fields.StringField({required: false, label: 'HP', nullable: true, blank: false}),
      pb: new fields.StringField({required: false, label: 'PB', nullable: true, blank: false}),
      cr: new fields.StringField({required: false, label: 'CR', nullable: true, blank: false}),
    }
  }

  static get scope() {
    return 'dnd5e';
  }

  static get inner() {
    return ['statBlockOverride'];
  }
}

class StatblockFlagger extends Flagger {
  static APP_CONTROLS = {
    icon: 'fa-chart-bar',
    label: 'Statblock Overrides',
    field: 'Statblock Text Overrides',
  }

  static {
    this.hook();
  }

  static FLAG_MODEL = StatblockData;

  static compatible(doc) {
    return super.compatible(doc) && (doc?.type === 'npc');
  }

//  _reset() {
//    const model = this.flagData.constructor;
//
//    /* Flag data is held directly on the package scope */
//    if (model.inner.length == 0) {
//      const keys = Object.keys(this.flagData.schema.fields);
//      return Promise.all(keys.map(key => 
//        this.document.unsetFlag(this.flagData.constructor.scope, key)
//      ));
//    }
//
//    /* flag data is a key within a package scope */
//    if (model.inner.length == 1) {
//      return this.document.unsetFlag(this.constructor.FLAG_MODEL.scope, this.constructor.FLAG_MODEL.inner.at(0));
//    }
//
//    if (model.inner.length > 1) {
//      return ui.notifications.error('Complex flag structure requires specific _reset implementation! No updates performed.');
//    }
//  }
}
