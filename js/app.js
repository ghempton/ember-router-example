(function() {

// Handlebars helper to generate lorem ipsum text
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

// A helper function for better code-reuse
function sectionRoute(name) {
  return Ember.Route.extend({
    route: name,
    connectOutlets: function(router, context) {
      var SectionView = Ember.View.extend({
        templateName: 'section' + name
      });
      router.get('sectionsController').connectOutlet({viewClass: SectionView});
    }
  });
}

// Create the application
window.App = Ember.Application.create({

  // Define the main application controller. This is automatically picked up by
  // the application and initialized.
  ApplicationController: Ember.Controller.extend(),
  ApplicationView: Ember.View.extend({
    templateName: 'application'
  }),

  HomeController: Ember.Controller.extend(),
  HomeView: Ember.View.extend({
    templateName: 'home'
  }),

  SectionsController: Ember.Controller.extend(),
  SectionsView: Ember.View.extend({
    templateName: 'sections'
  }),

  ItemsController: Ember.ArrayController.extend({
    init: function() {
      this._super();
      var items = [];
      for(var i = 0; i < 10; i++) {
        var description = $('<div></div>').lorem({ptags:true}).html();
        items.push({id: i, title: 'Item ' + i, description: description});
      }
      this.set('content', Ember.A(items));
    }
  }),
  ItemsView: Ember.View.extend({
    templateName: 'items'
  }),

  ItemController: Ember.ObjectController.extend(),
  ItemView: Ember.View.extend({
    templateName: 'item'
  }),

  Router: Ember.Router.extend({
    root: Ember.Route.extend({
      doHome: function(router, event) {
        router.transitionTo('home');
      },
      doSections: function(router, event) {
        router.transitionTo('sections.index');
      },
      doItems: function(router, event) {
        router.transitionTo('items');
      },
      home: Ember.Route.extend({
        route: '/',
        connectOutlets: function(router, event) {
          router.get('applicationController').connectOutlet('home');
        }
      }),
      sections: Ember.Route.extend({
        route: '/sections',
        connectOutlets: function(router, event) {
          router.get('applicationController').connectOutlet('sections');
        },
        index: Ember.Route.extend({
          route: '/'
        }),
        doSectionA: function(router, event) { router.transitionTo('sections.sectionA'); },
        sectionA: sectionRoute('A'),
        doSectionB: function(router, event) { router.transitionTo('sections.sectionB'); },
        sectionB: sectionRoute('B'),
        doSectionC: function(router, event) { router.transitionTo('sections.sectionC'); },
        sectionC: sectionRoute('C'),
        doSectionD: function(router, event) { router.transitionTo('sections.sectionD'); },
        sectionD: sectionRoute('D')
      }),
      items: Ember.Route.extend({
        route: '/items',
        connectOutlets: function(router, context) {
          router.get('applicationController').connectOutlet('items');
        },
        doItem: function(router, event) {
          router.transitionTo('item', {item_id: event.context.id});
        }
      }),
      item: Ember.Route.extend({
        route: '/items/:item_id',
        connectOutlets: function(router, context) {
          var item = router.getPath('itemsController.content').objectAt(context.item_id);
          router.get('itemController').set('content', item);
          router.get('applicationController').connectOutlet('item');
        }
      })
    })
  })

});

App.initialize();

})();