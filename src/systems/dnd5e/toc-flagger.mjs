import FlagData from '../../common/lib/abstract/flag-data.mjs';
import Flagger from '../../common/lib/abstract/flagger.mjs';

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

  static get scope() {
    return 'dnd5e';
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

  static get scope() {
    return 'dnd5e';
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

  static get scope() {
    return 'dnd5e';
  }

  static get inner() {
    return '.navigation';
  }
}


class ToCEntryFlagger extends Flagger {

  static APP_CONTROLS = {
    icon: 'fa-table-columns',
    label: 'ToC Flags',
    field: 'Table of Contents',
  }

  static {
    this.hook();
  }

  static FLAG_MODEL = ToCEntryData;

  static compatible(doc) {
    return super.compatible(doc) && (doc?.documentName === 'JournalEntry');
  }
}

class ToCPageFlagger extends ToCEntryFlagger {
  static FLAG_MODEL = ToCPageData;

  static {
    this.hook();
  }

  static compatible(doc) {
    return Flagger.compatible(doc) && (doc?.documentName === 'JournalEntryPage');
  }

  async submitHandler(evt, form, data) {
    await super.submitHandler(evt, form, data);
    await this.document.parent.render({force: true});
  }
}

class NavFlagger extends ToCEntryFlagger {
  static APP_CONTROLS = {
    icon: 'fa-compass',
    label: 'Nav Flags',
    field: 'Navigation',
  }

  static FLAG_MODEL = NavData;

  static {
    this.hook();
  }
}
