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
      speed: new fields.StringField({required: false, label: 'Speed', nullable: true, blank: false}),
      xp: new fields.StringField({required: false, label: 'XP', nullable: true, blank: false}),
      languages: new fields.StringField({required: false, label: 'Languages', nullable: true, blank: false}),
      initiative: new fields.StringField({required: false, label: 'Initiative', nullable: true, blank: false}),
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
}
