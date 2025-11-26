import './TypeExtract';

export default class ProseMirrorExtractor {
  static {
    Hooks.on('getProseMirrorMenuDropDowns', (proseMirrorMenu, dropdowns) => {
      const entries = [];
      Hooks.callAll('%id%.extractorEntries', entries);
      dropdowns['%id%'] = {
        cssClass: 'extractor',
        icon: '<i class="fa-solid fa-helmet-safety"></i>',
        entries,
      }
    });
  }
}

