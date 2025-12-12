class ChangeType {
  static {
    Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
      controls.push({
        icon: 'fa-solid fa-code-compare',
        label: 'Change Type',
        onClick: () => this.changeType(app.document),
        visible: () => 'document' in app,
      });
    });
  }

  static async changeType(target) {
    const choices = target.constructor.TYPES;

    const fields = [
      new foundry.data.fields.StringField({label: 'New Type', choices}).toFormGroup({}, {name: 'typeindex', }).outerHTML,
    ]

    const content = `<fieldset>${fields.join('')}</fieldset>`;

    const answer = await foundry.applications.api.DialogV2.prompt({
      content,
      window: {
      title: 'Changing Type: ' + target.name,
      },
      ok: {
        callback: (event,button) => new foundry.applications.ux.FormDataExtended(button.form).object
      },
      position: {top: 100},
      rejectClose: true})

    const {typeindex} = answer;
    const type = choices[typeindex];

    const data = target.toObject();
    data['==system'] = data.system;
    delete data.system;
    data.type = type;
    try {
      await target.update(data);
    } catch (e) {
      ui.notifications.error(e);
    }
  }

}
