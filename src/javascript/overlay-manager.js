AUI.add('overlay-manager', function(A) {

var L = A.Lang,
	isString = L.isString,

	DEFAULT = 'default',
	HOST = 'host',
	OVERLAY_MANAGER = 'OverlayManager',
	GROUP = 'group',
	Z_INDEX = 'zIndex';

function OverlayManager(config) {
 	OverlayManager.superclass.constructor.apply(this, arguments);
}

A.mix(OverlayManager, {
	NAME: OVERLAY_MANAGER,

	NS: OVERLAY_MANAGER,

	overlays: {},

	ATTRS: {
		group: {
			value: DEFAULT,
			validator: isString
		}
	}
});

A.extend(OverlayManager, A.Plugin.Base, {
	initializer: function() {
		var instance = this;
		var group = instance.get(GROUP);

		if (!(group in OverlayManager.overlays)) {
			OverlayManager.overlays[group] = A.Array([]);
		}

		instance.register();
	},

	bringToTop: function() {
		var instance = this;
		var host = instance.get(HOST);
		var group = instance.get(GROUP);

		// Sort overlays by their numerical zIndex values
		var overlays = OverlayManager.overlays[group].sort(instance.sortByZIndexDesc);

		// Get the highest one
		var highest = overlays[0];

		// If the overlay is not the highest one, switch zIndices
		if (highest !== host) {
			var highestZ = highest.get(Z_INDEX);
			var hostZ = host.get(Z_INDEX);

			host.set(Z_INDEX, highestZ);
			highest.set(Z_INDEX, hostZ);
		}
	},

	destroy: function() {
		var instance = this;

		instance.remove();
	},

	register: function () {
		var instance = this;
		var group = instance.get(GROUP);
		var overlay = instance.get(HOST);
		var overlays = OverlayManager.overlays[group];
		var canRegister = overlays.indexOf(overlay) == -1;

		if (canRegister && overlay && (overlay instanceof A.Overlay)) {
			var zIndex = overlay.get(Z_INDEX);
			overlays.push(overlay);

			if (!zIndex) {
				overlay.set(Z_INDEX, overlays.length);
			}
		}

		return overlays;
	},

	remove: function () {
		var instance = this;
		var group = instance.get(GROUP);
		var overlay = instance.get(HOST);
		var overlays = OverlayManager.overlays[group];

		return A.Array.removeItem(overlays, overlay);
	},

	applyToAll: function(fn) {
		var instance = this;
		var group = instance.get(GROUP);
		var overlays = OverlayManager.overlays[group];

		A.Array.each(overlays, fn);
	},

	showAll: function(){
		this.applyToAll(function(overlay) {
			overlay.show();
		});
	},

	hideAll: function(){
		this.applyToAll(function(overlay) {
			overlay.hide();
		});
	},

	sortByZIndexDesc: function(a, b) {
		if (!a || !b || !a.hasImpl(A.WidgetStack) || !b.hasImpl(A.WidgetStack)) {
			return 0;
		}
		else {
			var aZ = a.get(Z_INDEX);
			var bZ = b.get(Z_INDEX);

			if (aZ > bZ) {
				return -1;
			} else if (aZ < bZ) {
				return 1;
			} else {
				return 0;
			}
		}
	}
});

A.namespace('Plugin');
A.Plugin.OverlayManager = OverlayManager;

}, '@VERSION', { requires: [ 'overlay' ] });