import FlagData from '../../lib/abstract/flag-data.mjs';
import Flagger from '../../lib/abstract/flagger.mjs';

class JournalFlags extends FlagData {
  static get scope() {
    return 'core';
  }

  static defineSchema() {
    const fields = foundry.data.fields;
    const modes = CONFIG.JournalEntry.sheetClasses.base['core.JournalEntrySheet'].cls.VIEW_MODES;
    return {
      viewMode: new fields.NumberField({
        required: false,
        label: 'View Mode',
        nullable: true,
        choices: {
          0: 'Default',
          [modes.SINGLE]: 'Single Page',
          [modes.MULTIPLE]: 'Multi-Page',
        }
      })
    }
  }
}

class JournalFlagger extends Flagger {
  static APP_CONTROLS = {
    icon: 'fa-flag',
    label: 'Core Flags',
    field: 'Core Flags',
  }

  static {
    this.hook();
  }

  static compatible(doc) {
    return super.compatible(doc) && (doc.documentName == 'JournalEntry');
  }

  constructor(options) {
    super(JournalFlags, options);
  }
}
