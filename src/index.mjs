import './styles/main.scss';

Hooks.on("renderItemSheet5e", (app) => //app.activateTab("activities", {triggerCallback: true}));
app.changeTab('activities', 'primary'));
Hooks.on('setup', () => {
  console.log('FCCT Loaded');
 });

//Hooks.on("preCreateActor", assignRulesVersion);
//Hooks.on("preCreateItem", assignRulesVersion);

