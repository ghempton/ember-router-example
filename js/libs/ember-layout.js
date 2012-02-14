
(function(exports) {
Ember.Handlebars.YieldContainerView = Ember.ContainerView.extend({
  templateContext: null,
  template: null,
  blockContainer: null,
  yieldName: '_default',
  init: function() {
    this._super();
    var layout = this.get('blockContainer');
    var yieldContent = layout.get('yieldContent');
    yieldContent.addObserver(this.get('yieldName'), this, 'contentDidUpdate');
    this.contentDidUpdate();
  },
  contentDidUpdate: function() {
    var layout = this.get('blockContainer');
    var yieldContent = layout.get('yieldContent');
    var view = yieldContent.get(this.get('yieldName'));
    var childViews = this.get('_childViews');
    var len = childViews.get('length');
    var views = view ? [view] : [];
    childViews.replace(0, len, views);
  },
  destroy: function() {
    this._super();
    var layout = this.get('blockContainer');
    var yieldContent = layout.get('yieldContent');
    yieldContent.removeObserver(this.get('yieldName'), this, 'contentDidUpdate');
  }
});

// Ember.Handlebars.YieldView = Ember.View.extend(Ember.Metamorph, {
  // itemViewClass: Ember.View.extend(Ember.Metamorph),
  // templateContext: null,
  // template: null,
  // blockContainer: null   
// });

// function findContainingLayout(view) {
  // // We are using _parentView here, because we need to go through the virtual YieldViews, so we can treat them differently.
  // if (!view) {
    // return view;
  // }
  // else if (view instanceof Ember.Handlebars.YieldContainerView) {
    // var blockContainer = Ember.get(view, 'blockContainer');
    // ember_assert("YieldContainerView representing the current block doesn't have a blockContainer set.", blockContainer);
    // return this._findContainingTemplateView(Ember.get(blockContainer, '_parentView'));
  // }
  // else if (view.isVirtual) {
    // return this._findContainingTemplateView(Ember.get(view, '_parentView'));
  // }
  // else {
    // return view;
  // }
// }

function findContainingLayout(view) {
  if(!(view instanceof Ember.LayoutView)) {
    view = view.nearestInstanceOf(Ember.LayoutView);
  }
  return view;
}

Ember.Handlebars.yieldHelper = Ember.Object.create({

  helper: function(name, options) {
    // If no name is provided, use default and swap parameters
    if (name && name.data && name.data.isRenderData) {
      options = name;
      name = "_default";
    }
      
    var layout = findContainingLayout(options.data.view);
    
    if (layout) {
      options.hash.yieldName = name;
      options.hash.blockContainer = layout;
      return Ember.Handlebars.helpers.view.call(this, 'Ember.Handlebars.YieldContainerView', options);
    }
  }
  
});


Ember.Handlebars.contentForHelper = Ember.Object.create({
  
  helper: function(name, options) {
    // If no name is provided, use default and swap parameters
    if (name && name.data && name.data.isRenderData) {
      options = name;
      name = "_default";
    }
    
    var layout = findContainingLayout(options.data.view);
    
    if (layout) {
      options.hash.blockContainer = layout;
  
      // We pass this proxy into the default view helper
      // to conform to the convention of assigning the
      // yieldContent value rather than appending as a child
      var viewProxy = Ember.Object.create({
        appendChild: function(view, options) {
          view = view.create(options);
          layout.setPath('yieldContent.' + name, view);
        }
      });
      
      options.data.view = viewProxy;
      
      Ember.Handlebars.helpers.view.call(this, 'Ember.View', options);
    }
  }
  
})

Ember.Handlebars.registerHelper('yield', Ember.Handlebars.yieldHelper.helper);
Ember.Handlebars.registerHelper('contentFor', Ember.Handlebars.contentForHelper.helper);

})({});


(function(exports) {
var get = Ember.get, set = Ember.set;

Ember.LayoutState = Ember.State.extend({
  active: false,
  isViewState: true,
  contentKey: '_default',
  
  init: function() {
    var viewClass = get(this, 'viewClass');
    if(viewClass) {
      layoutStates = get(viewClass, 'layoutStates');
      set(this, 'states', layoutStates);
    }
    
    this._super();
  },

  enter: function(stateManager, transition) {
    this._super(stateManager, transition);
    
    set(this, 'active', true);
    
    var viewClass = get(this, 'viewClass'), view;
    ember_assert('view cannot be set directly, use viewClass instead', !this.get('view'));
    ember_assert('viewClass must extend Ember.View', Ember.View.detect(viewClass));
    view = this.createView(stateManager, transition);
    this.set('view', view);
    
    if (view) {
      ember_assert('view must be an Ember.View', view instanceof Ember.View);

      // if there is another layout state in the hierarchy, we set
      // the yieldContent of it's layout
      var layout = this.get('layout') || stateManager.get('rootLayout');
      if(layout) {
        var yieldContent = layout.get('yieldContent');
        if(!yieldContent) debugger;
        yieldContent.set(this.contentKey, view);
      }
      // otherwise we just append to the rootElement on the
      // state manager
      else {
        var root = stateManager.get('rootElement') || 'body';
        view.appendTo(root);
      }
    }
  },

  exit: function(stateManager, transition) {
    var view = get(this, 'view');

    var layout = this.get('layout') || stateManager.get('rootLayout');
    if(layout) {
      var yieldContent = layout.get('yieldContent');
      yieldContent.set(this.contentKey, null);
    }
    else {
      view.remove();
    }
    set(this, 'view', null);
    set(this, 'active', false);
    this._super(stateManager, transition);
  },
  
  // Called during state entry. Creates the view
  // that will be displayed. Can be overridden
  // to initialize the view
  createView: function(stateManager, transition) {
    return this.get('viewClass').create();
  },
    
  // Recursively find the first parent state with a layout
  layout: Ember.computed(function() {
    var state = this.get('parentState');
    while(state && !state.get('view') && !(state.get('view') instanceof Ember.LayoutView)) {
      state = state.get('parentState');
    }
    return state && state.get('view');
  }).property()
});

})({});


(function(exports) {
var get = Ember.get, set = Ember.set, meta = Ember.meta;

Ember.LayoutView = Ember.View.extend({
  
  yieldContent: null,
  
  init: function() {
    this._super();
    set(this, 'yieldContent', Ember.Object.create());
  }
  
});

})({});


(function(exports) {
})({});
