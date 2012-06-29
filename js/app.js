window.App = Ember.Application.create({

  ApplicationController: Ember.Controller.extend(),
  ApplicationView: Ember.View.extend({
    templateName: 'application'
  }),

  HomeController: Ember.Controller.extend(),
  HomeView: Ember.View.extend({
    templateName: 'home'
  }),

  ItemsController: Ember.ArrayController.extend({
    init: function() {
      this._super();
      var items = []
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
      doItems: function(router, event) {
        router.transitionTo('items');
      },
      home: Ember.Route.extend({
        route: '/',
        connectOutlets: function(router, context) {
          router.get('applicationController').connectOutlet('home');
        }
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
