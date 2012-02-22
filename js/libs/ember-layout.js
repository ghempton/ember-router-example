
(function(exports) {
var get = Ember.get, set = Ember.set, meta = Ember.meta;

/**
  @class
  This is an extension of Ember.ContainerView who's content
  is restricted to a single child dicated by a property
  on another view.
 */
Ember.Handlebars.FrameView = Ember.ContainerView.extend({
  /**
    The view corresponding to the containing template
   */
  blockContainer: null,
  
  /**
    The property on the blockContainer which dictates the
    contents of this container.
   */
  childPath: 'content',
  
  /**
    Set up the listener on the view corresponding to the
    containing template
   */
  init: function() {
    this._super();
    var blockContainer = get(this, 'blockContainer');
    blockContainer.addObserver(get(this, 'childPath'), this, 'contentDidUpdate');
    this.contentDidUpdate();
  },
  
  /** @private
    Fired when the property specified by contentPath changes on
    the blockContainer
   */
  contentDidUpdate: function() {
    var blockContainer = this.get('blockContainer');
    var view = blockContainer.getPath(get(this, 'childPath'));
    ember_assert(view instanceof Ember.View, "dynamicView's content must be set to a subclass of Ember.View'");
    var childViews = this.get('_childViews');
    var len = childViews.get('length');
    var views = view ? [view] : [];
    childViews.replace(0, len, views);
  },
  
  destroy: function() {
    this._super();
    var blockContainer = get(this, 'blockContainer');
    blockContainer.removeObserver(get(this, 'childPath'), this, 'contentDidUpdate');
  }
});

Ember.Handlebars.dynamicViewHelper = Ember.Object.create({

  findContainingBlock: function(view) {
    if (!view) {
      return view;
    }
    // We are using _parentView here, because we need to go through the virtual YieldViews, so we can treat them differently.
    else if (view instanceof Ember.Handlebars.FrameView) {
      var blockContainer = Ember.get(view, 'blockContainer');
      return this.findContainingBlock(Ember.get(blockContainer, '_parentView'));
    }
    else if (view.isVirtual) {
      return this.findContainingBlock(Ember.get(view, '_parentView'));
    }
    return view;
  },

  helper: function(name, options) {
    // If no name is provided, use default and swap parameters
    if (name && name.data && name.data.isRenderData) {
      options = name;
      name = false;
    }
      
    var blockContainer = Ember.Handlebars.dynamicViewHelper.findContainingBlock(options.data.view);
    
    if(name) {
      options.hash.childPath = name;
    }
    options.hash.blockContainer = blockContainer;
    return Ember.Handlebars.helpers.view.call(this, 'Ember.Handlebars.FrameView', options);
  }
  
});

Ember.Handlebars.registerHelper('dynamicView', Ember.Handlebars.dynamicViewHelper.helper);



})({});


(function(exports) {
var get = Ember.get, set = Ember.set;

/**
  @class
  A convenient extension of Ember.State which makes it easy
  to swap out dynamic content during state transitions.
 */
Ember.LayoutState = Ember.State.extend({
  /**
    Convenience property to bind to.
   */
  active: false,
  
  isViewState: true,
  
  /**
    The property to set in the nearest parent view
    when this state is entered.
   */
  contentPath: 'content',
  
  init: function() {
    // This is currently experimental. We allow
    // the view itself to define it's substates
    // for better encapsulation. To do this, set
    // the layoutStates property.
    var viewClass = get(this, 'viewClass');
    if(viewClass) {
      var layoutStates = get(viewClass, 'proto').layoutStates;
      set(this, 'states', layoutStates);
    }
    
    this._super();
  },

  enter: function(stateManager, transition) {
    this._super(stateManager, transition);
    
    set(this, 'active', true);
    
    var viewClass = get(this, 'viewClass'), view;
    ember_assert('view cannot be set directly, use viewClass instead', !this.get('view'));
    view = this.createView(stateManager, transition);
    this.set('view', view);
    
    if (view) {
      ember_assert('view must be an Ember.View', view instanceof Ember.View);


      // if there is another view in the hierarchy then
      // set its content
      var parentView = get(this, 'parentView') || get(stateManager, 'rootView');
      if(parentView) {
        Ember.setPath(parentView, get(this, 'contentPath'), view);
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

    var parentView = get(this, 'parentView') || get(stateManager, 'rootView');
    if(parentView) {
      Ember.setPath(parentView, get(this, 'contentPath'), null);
    }
    else {
      view.remove();
    }
    set(this, 'view', null);
    set(this, 'active', false);
    this._super(stateManager, transition);
  },
  
  /**
    Instantiates viewClass. This method can be
    overridden.
   */
  createView: function(stateManager, transition) {
    var viewClass = get(this, 'viewClass');
    ember_assert('viewClass must extend Ember.View', Ember.View.detect(viewClass));
    return viewClass.create();
  },
    
  /**
    Recursively find the nearest parent view
    in the state hierarchy
   */
  parentView: Ember.computed(function() {
    var state = this.get('parentState');
    while(state && !state.get('view')) {
      state = state.get('parentState');
    }
    return state && state.get('view');
  }).property()
});

})({});


(function(exports) {
})({});
