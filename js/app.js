App = Em.Namespace.create();

// Handlebars helper to generate text
Ember.Handlebars.registerHelper('lorem', function(options) {
  opts = {ptags:true}
  if(options.hash.type) {
    opts.type = options.hash.type;
  }
  if(options.hash.amount) {
    opts.amount = options.hash.amount;
  }
  return new Handlebars.SafeString($('<div></div>').lorem(opts).html());
});


// define some data to play around with for the route parameters section
App.posts = [];
for(var i = 1; i <= 10; i++) {
  App.posts.pushObject(Em.Object.create({
    id: i,
    title: 'Post ' + i,
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
App.main = Em.LayoutView.create({
  templateName: 'main'
});

// Here we define the top level routes and
// their corresponding views (inline)
App.routeManager = Em.RouteManager.create({
  rootLayout: App.main,
  home: App.NavState.create({
    selector: '.home',
    view: Em.View.create({
      templateName: 'home'
    })
  }),
  layoutNesting: App.NavState.create({
    selector: '.layout-nesting',
    path: 'layout-nesting',
    view: Em.LayoutView.create({
      templateName: 'layout-nesting',
    }),
    section1: App.SubNavState.create({
      path: 'section1',
      view: Em.View.create({
        title: 'Section 1',
        templateName: 'section'
      })
    }),
    section2: App.SubNavState.create({
      path: 'section2',
      view: Em.View.create({
        title: 'Section 2',
        templateName: 'section'
      })
    }),
    section3: App.SubNavState.create({
      path: 'section3',
      view: Em.View.create({
        title: 'Section 3',
        templateName: 'section'
      })
    }),
    section4: App.SubNavState.create({
      path: 'section4',
      view: Em.View.create({
        title: 'Section 4',
        templateName: 'section'
      })
    })
  }),
  routeParameters: App.NavState.create({
    selector: '.route-parameters',
    path: 'route-parameters',
    view: Em.LayoutView.create({
      templateName: 'route-parameters',
    }),
    posts: Em.LayoutState.create({
      view: Em.View.create({
        templateName: 'posts',
        contentBinding: 'App.posts'
      })
    }),
    post: Em.LayoutState.create({
      path: ':postId', // specify the path to take a parameter
      view: Em.View.create({
        templateName: 'post'
      }),
      // consume the path parameter when the state is entered
      enter: function(stateManager, transition) {
        this._super(stateManager, transition);
        var postId = stateManager.getPath('params.postId');
        var post = App.posts[postId - 1];
        this.get('view').set('content', post);
      }
    })
  })
});



App.main.appendTo('body');