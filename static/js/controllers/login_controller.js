Prediket.LoginController = Ember.ObjectController.extend({
	actions: {
		submitAction: function() {
		alert('now we can submit the model' + this.get('model'));
		}
	}
});