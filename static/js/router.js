Prediket.Router.map(function() {
  // put your routes here
  this.route('index', {path: '/'});
  this.route('login', {path: '/login'});
  this.route('register', {path: '/register'});
  this.route('chart', {path: '/chart'});
});


// ROUTES
Prediket.HomepageRoute = Ember.Controller.extend({
	model: function() {
		return ['homepage route here'];
	}
});


Prediket.IndexRoute = Ember.Route.extend({
	model: function() {
		console.log("index route");
		return ['Stream 1', 'Stream 2', 'Stream 3', 'Stream 4'];
	}
});


Prediket.LoginRoute = Ember.Route.extend({
	model: function() {
		return Prediket.User.create();
	},
	setupController: function(controller, model) {
		controller.set("model", model);
	}
});

Prediket.ChartRoute = Ember.Route.extend({
	model: function() {
		return ['a','b'];
		//return Prediket.ChartController.loadChart();
	}
});

Prediket.ApplicationRoute = Ember.Route.extend({
	model: function() {
		console.log("application route");

		return Ember.$.getJSON('/streams').then(function(response) {
			return response.streams;
		});
	}
});


Prediket.RegisterRoute = Ember.Route.extend({
	model: function() {
		return ['register', 'up'];
	}
});

Prediket.IndexController = Ember.Controller.extend({
	message: "Welcome to Prediket!"
});

