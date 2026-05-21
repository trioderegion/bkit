class OpenParent {
  static {
    Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
      controls.push({
        icon: 'fa-solid fa-hands-holding-child',
        label: 'Show Parent',
        onClick: () => app.document.parent.sheet.render({force: true}),
        visible: () => app.document?.parent,
      });
    });
  }
}
