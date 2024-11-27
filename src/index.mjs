import './styles/main.scss';
import {detailsNodes, DetailsView} from '@mh4gf/prosemirror-details';

Hooks.on("renderItemSheetV2", (app) => app.activateTab("activities", {triggerCallback: true}));
Hooks.on('setup', () => {
  console.log('FCCT Loaded');

  //Object.assign(ProseMirror.defaultSchema, new ProseMirror.Schema({
  //  nodes: {
  //    ...ProseMirror.defaultSchema.nodes,
  //    ...detailsNodes({ 
  //      detailsGroup: 'block',
  //      detailsContent: 'block+',
  //      summaryContent: 'text*',
  //    })
  //  }
  //}));
  //ProseMirror.defaultPlugins.details = ProseMirrorDetails.build(ProseMirror.defaultSchema); 
});

class ProseMirrorDetails extends ProseMirror.ProseMirrorPlugin {

  constructor(schema, options = {}) {
 
    super(new ProseMirror.Schema({
     nodes: {
       ...schema.nodes,
       ...detailsNodes({ 
         detailsGroup: 'block',
         detailsContent: 'block+',
         summaryContent: 'text*',
       })
     }
   }));

  }

  views() {
    return {
      details: (node, view, getPos) => new DetailsView(node, view, getPos)
    }
  }

  static build(schema, options = {}) {
    const plugin = new ProseMirrorDetails(schema, options);
    return new ProseMirror.Plugin({
      //nodeViews: plugin.views(),
   //   view(eView) {
    });
  }
}

//Hooks.on('createProseMirrorEditor', (dataPath, plugins, editor) => {
//  console.log('PM Plugins', plugins);
//});
