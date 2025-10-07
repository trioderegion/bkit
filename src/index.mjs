import './common';

Hooks.once('ready', async () => {
  const systemInit = () => ui.notifications.success(`Common and '${game.system.id}' utilities initialized`);
  switch (game.system.id) {
    case 'dnd5e': 
      await import('./systems/dnd5e');
      systemInit();
      break;
    default:
      ui.notifications.info('Common utilities initialized');
      break;
  }
});

