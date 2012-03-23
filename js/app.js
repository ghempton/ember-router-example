window.App = Ember.Application.create();

// Handlebars helper to generate text
Ember.Handlebars.registerHelper('lorem', function(options) {
  var opts = {ptags:true}
  if(options.hash.type) {
    opts.type = options.hash.type;
  }
  if(options.hash.amount) {
    opts.amount = options.hash.amount;
  }
  return new Handlebars.SafeString($('<div></div>').lorem(opts).html());
});


// define some data to play around with for the route parameters section
App.items = [];
for(var i = 1; i <= 10; i++) {
  App.items.pushObject(Em.Object.create({
    id: i,
    title: 'Item ' + i,
    url: "#route-parameters/" + i
  }));
}

// Small LayoutState extension to toggle the navigation css
App.NavState = Em.LayoutState.extend({
  navSelector: '.navbar .nav',
  enter: function(stateManager, transition) {
    this._super(stateManager, transition);
    var $nav = $(this.get('navSelector'));
    $nav.children().removeClass('active');
    var selector = this.get('selector') || ("." + this.get('path'));
    $nav.find(selector).addClass('active');
  }
});

App.SubNavState = App.NavState.extend({
  navSelector: '.subnav .nav'
})

// The top level layout
App.main = Em.View.create({
  templateName: 'main'
});

// Here we define the top level routes and
// their corresponding views (inline)
App.routeManager = Em.RouteManager.create({
  rootView: App.main,
  home: App.NavState.create({
    selector: '.home',
    viewClass: Em.View.extend({
      templateName: 'home'
    })
  }),
  layoutNesting: App.NavState.create({
    selector: '.layout-nesting',
    route: 'layout-nesting',
    viewClass: Em.View.extend({
      templateName: 'layout-nesting',
    }),
    section1: App.SubNavState.create({
      route: 'section1',
      viewClass: Em.View.extend({
        title: 'Section 1',
        templateName: 'section'
      })
    }),
    section2: App.SubNavState.create({
      route: 'section2',
      viewClass: Em.View.extend({
        title: 'Section 2',
        templateName: 'section'
      })
    }),
    section3: App.SubNavState.create({
      route: 'section3',
      viewClass: Em.View.extend({
        title: 'Section 3',
        templateName: 'section'
      })
    }),
    section4: App.SubNavState.create({
      route: 'section4',
      viewClass: Em.View.extend({
        title: 'Section 4',
        templateName: 'section'
      })
    })
  }),
  routeParameters: App.NavState.create({
    selector: '.route-parameters',
    route: 'route-parameters',
    viewClass: Em.View.extend({
      templateName: 'route-parameters',
    }),
    items: Em.LayoutState.create({
      viewClass: Em.View.extend({
        templateName: 'items',
        contentBinding: 'App.items'
      })
    }),
    item: Em.LayoutState.create({
      route: ':itemId', // specify the path to take a parameter
      viewClass: Em.View.extend({
        templateName: 'item'
      }),
      // consume the path parameter when the state is entered
      enter: function(stateManager, transition) {
        this._super(stateManager, transition);
        var itemId = stateManager.getPath('params.itemId');
        var item = App.items[itemId - 1];
        this.get('view').set('content', item);
      }
    })
  })
});

$(function() {
  App.main.appendTo('body');
  App.routeManager.start();
});