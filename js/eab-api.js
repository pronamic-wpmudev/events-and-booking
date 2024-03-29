/* ----- Login with Fb/Tw ----- */
(function ($) {

function rsvp_after_wordpress_login (data) {
	var status = 0;
	try { status = parseInt(data.status, 10); } catch (e) { status = 0; }
	if (!status) { // ... handle error
		//update error by Hoang
		if ($("#eab-wordpress_login-registration_wrapper").is(":visible")){
			$('#eab-wordpress-signup-status').text(l10nEabApi.wp_signup_error);
		}
		else if ($("#eab-wordpress_login-login_wrapper").is(":visible")){
			$('#eab-wordpress-login-status').text(l10nEabApi.wp_username_pass_invalid);
		}
		return false;
	}
	var $me = $("#eab-wordpress_login-wrapper");
	var post_id = $me.attr("data-post_id");
	// Get form if all went well
	$.post(_eab_data.ajax_url, {
		"action": "eab_get_form",
		"post_id": post_id
	}, function (data) {
		$("body").append('<div id="eab-wordpress_form">' + data + '</div>');
		$("#eab-wordpress_form").find("." + $me.attr("class")).click();
	});
}

function send_wordpress_registration_request () {
	var deferred = $.Deferred(),
		$root = $("#eab-wordpress_login-registration_wrapper"),
		data = {
			username: $("#eab-wordpress_login-registration_username").val(),
			email: $("#eab-wordpress_login-registration_email").val()
		}
	;
	deferred.done(function () {
		// Client-side validation first
		if (!data.username || !data.email) {
			$('#eab-wordpress-signup-status').text(l10nEabApi.wp_missing_user_email);
			return false;
		}
		$root.append('<img class="eab-waiting" src="' + _eab_data.root_url + '/waiting.gif" />');
		$.post(_eab_data.ajax_url, {
			"action": "eab_wordpress_register",
			"data": data
		}, function (data) {
			rsvp_after_wordpress_login(data);
		}).always(function () {
			$root.find("img.eab-waiting").remove();
		});
	});

	$(document).trigger("eab-api-registration-data", [data, deferred]);
	setTimeout(function () {
		if ('pending' === deferred.state()) deferred.resolve();
	}, 500);
}

function send_wordpress_login_request () {
	// Client-side validation first
	var username = $("#eab-wordpress_login-login_username").val();
	var password = $("#eab-wordpress_login-login_password").val();
	//if (!username) return false;
	//if (!password) return false;
	if(!username || !password){
		//output error here,update by Hoang
		$('#eab-wordpress-login-status').text(l10nEabApi.wp_missing_username_password);
		return false;
	}
	$.post(_eab_data.ajax_url, {
		"action": "eab_wordpress_login",
		"data": {
			"username": username,
			"password": password
		}
	}, function (data) {
		rsvp_after_wordpress_login(data);
	});
}

function dispatch_login_register () {
	if ($("#eab-wordpress_login-registration_wrapper").is(":visible")) return send_wordpress_registration_request();
	else if ($("#eab-wordpress_login-login_wrapper").is(":visible")) return send_wordpress_login_request();
	return false;
}

function create_wordpress_login_popup ($action, post_id) {
	if (!$("#eab-wordpress_login-background").length) {
		$("body").append(
			"<div id='eab-wordpress_login-background'></div>" +
			"<div id='eab-wordpress_login-wrapper' class='" + $action.removeClass("active").attr("class") + "' data-post_id='" + post_id + "'>" +
				"<div id='eab-wordpress_login-registration_wrapper' class='eab-wordpress_login-element_wrapper'>" +
					"<h4>" + l10nEabApi.wp_register + "</h4>" +
					"<p class='eab-wordpress_login-element eab-wordpress_login-element-message'>" +
						l10nEabApi.wp_registration_msg +
					"</p>" +
					"<p id='eab-wordpress-signup-status'></p>"+
					"<p class='eab-wordpress_login-element'>" +
						"<label for='eab-wordpress_login-registration_username'>" + l10nEabApi.wp_username + "</label>" +
							"<input type='text' id='eab-wordpress_login-registration_username' placeholder='' />" +
					"</p>" +
					"<p class='eab-wordpress_login-element'>" +
						"<label for='eab-wordpress_login-registration_email'>" + l10nEabApi.wp_email + "</label>" +
							"<input type='text' id='eab-wordpress_login-registration_email' placeholder='' />" +
					"</p>" +
				"</div>" +
				"<div id='eab-wordpress_login-login_wrapper' class='eab-wordpress_login-element_wrapper' style='display:none'>" +
					"<h4>" + l10nEabApi.wp_login + "</h4>" +
					"<p class='eab-wordpress_login-element eab-wordpress_login-element-message'>" +
						l10nEabApi.wp_login_msg +
					"</p>" +
					"<p id='eab-wordpress-login-status'></p>"+
					"<p class='eab-wordpress_login-element'>" +
						"<label for='eab-wordpress_login-login_username'>" + l10nEabApi.wp_username + "</label>" +
							"<input type='text' id='eab-wordpress_login-login_username' placeholder='' />" +
					"</p>" +
					"<p class='eab-wordpress_login-element'>" +
						"<label for='eab-wordpress_login-login_password'>" + l10nEabApi.wp_password + "</label>" +
							"<input type='password' id='eab-wordpress_login-login_password' placeholder='' />" +
					"</p>" +
				"</div>" +
				"<div id='eab-wordpress_login-mode_toggle'><a href='#' data-on='" + l10nEabApi.wp_toggle_on + "' data-off='" + l10nEabApi.wp_toggle_off + "'>" + l10nEabApi.wp_toggle_on + "</a></div>" +
				"<div id='eab-wordpress_login-command_wrapper'>" +
					"<input type='button' id='eab-wordpress_login-command-ok' value='" + l10nEabApi.wp_submit + "' />" +
					"<input type='button' id='eab-wordpress_login-command-cancel' value='" + l10nEabApi.wp_cancel + "' />" +
				"</div>" +
			"</div>"
		);
		$(document).trigger("eab-api-registration-form_rendered");
	}
	var $background = $("#eab-wordpress_login-background");
	var $wrapper = $("#eab-wordpress_login-wrapper");

	$background.css({
		"width": $(document).width(),
		"height": $(document).height()
	});
	$wrapper.css({
		"left": ($(document).width() - 300) / 2
	});
	//$("#eab-wordpress_login-mode_toggle a").on('click', function () {
	$("#eab-wordpress_login-mode_toggle a").click(function () {
		var $me = $(this);
		if ($("#eab-wordpress_login-registration_wrapper").is(":visible")) {
			$me.text($me.attr("data-off"));
			$("#eab-wordpress_login-registration_wrapper").hide();
			$("#eab-wordpress_login-login_wrapper").show();
		} else {
			$me.text($me.attr("data-on"));
			$("#eab-wordpress_login-login_wrapper").hide();
			$("#eab-wordpress_login-registration_wrapper").show();
		}
		return false;
	});
	//$("#eab-wordpress_login-command-ok").on('click', dispatch_login_register);
	$("#eab-wordpress_login-command-ok").click(dispatch_login_register);
	//$("#eab-wordpress_login-command-cancel, #eab-wordpress_login-background").on('click', function () {
	$("#eab-wordpress_login-command-cancel, #eab-wordpress_login-background").click(function () {
		$wrapper.remove();
		$background.remove();
		return false;
	});
}

function get_google_login_button () {
	if (!l10nEabApi.data.gg_client_id) return '<li><a href="#" class="wpmudevevents-login_link wpmudevevents-login_link-google">' + l10nEabApi.google + '</a></li>';
	return '<li><span id="signinButton"> <span class="g-signin" data-callback="eab_google_plus_login_callback" data-clientid="' + l10nEabApi.data.gg_client_id + '" data-cookiepolicy="single_host_origin" data-scope="profile email"> </span> </span></li>';
}

function create_login_interface ($me) {
	if ($("#wpmudevevents-login_links-wrapper").length) {
		$("#wpmudevevents-login_links-wrapper").remove();
	}
	$me.parents('.wpmudevevents-buttons').after('<div id="wpmudevevents-login_links-wrapper" />');
	var $root = $("#wpmudevevents-login_links-wrapper");
	var post_id = $me.parents(".wpmudevevents-buttons").find('input:hidden[name="event_id"]').val();
	$root.html(
		'<ul class="wpmudevevents-login_links">' +
			(l10nEabApi.data.show_facebook ? '<li><a href="#" class="wpmudevevents-login_link wpmudevevents-login_link-facebook">' + l10nEabApi.facebook + '</a></li>' : '') +
			(l10nEabApi.data.show_twitter ? '<li><a href="#" class="wpmudevevents-login_link wpmudevevents-login_link-twitter">' + l10nEabApi.twitter + '</a></li>' : '') +
			(l10nEabApi.data.show_google ? get_google_login_button() : '') +
			(l10nEabApi.data.show_wordpress ? '<li><a href="#" class="wpmudevevents-login_link wpmudevevents-login_link-wordpress">' + l10nEabApi.wordpress + '</a></li>' : '') +
			'<li><a href="#" class="wpmudevevents-login_link wpmudevevents-login_link-cancel">' + l10nEabApi.cancel + '</a></li>' +
		'</ul>'
	);
	$me.addClass("active");
	$root.find(".wpmudevevents-login_link").each(function () {
		var $lnk = $(this);
		var callback = false;
		if ($lnk.is(".wpmudevevents-login_link-facebook")) {
			// Facebook login
			callback = function () {
				FB.login(function (resp) {
					if (resp.authResponse && resp.authResponse.userID) {
						// change UI
						$root.html('<img src="' + _eab_data.root_url + 'waiting.gif" /> ' + l10nEabApi.please_wait);
						$.post(_eab_data.ajax_url, {
							"action": "eab_facebook_login",
							"user_id": resp.authResponse.userID,
							"token": FB.getAccessToken()
						}, function (data) {
							var status = 0;
							try { status = parseInt(data.status, 10); } catch (e) { status = 0; }
							if (!status) { // ... handle error
								$root.remove();
								$me.click();
								return false;
							}
							// Get form if all went well
							$.post(_eab_data.ajax_url, {
								"action": "eab_get_form",
								"post_id": post_id
							}, function (data) {
								$("body").append('<div id="eab-facebook_form">' + data + '</div>');
								$("#eab-facebook_form").find("." + $me.removeClass("active").attr("class")).click();
							});
						});
					}
				}, {scope: _eab_data.fb_scope});
				return false;
			};
		} else if ($lnk.is(".wpmudevevents-login_link-twitter")) {
			callback = function () {
				var init_url = '//api.twitter.com/';
				var twLogin = window.open(init_url, "twitter_login", "scrollbars=no,resizable=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no,height=400,width=600");
				$.post(_eab_data.ajax_url, {
					"action": "eab_get_twitter_auth_url",
					"url": window.location.toString()
				}, function (data) {
					try {
						twLogin.location = data.url;
					} catch (e) { twLogin.location.replace(data.url); }
					var tTimer = setInterval(function () {
						try {
							if (twLogin.location.hostname == window.location.hostname) {
								// We're back!
								var location = twLogin.location;
								var search = '';
								try { search = location.search; } catch (e) { search = ''; }
								clearInterval(tTimer);
								twLogin.close();
								// change UI
								$root.html('<img src="' + _eab_data.root_url + 'waiting.gif" /> ' + l10nEabApi.please_wait);
								$.post(_eab_data.ajax_url, {
									"action": "eab_twitter_login",
									"secret": data.secret,
									"data": search
								}, function (data) {
									var status = 0;
									try { status = parseInt(data.status, 10); } catch (e) { status = 0; }
									if (!status) { // ... handle error
										$root.remove();
										$me.click();
										return false;
									}
									// Get form if all went well
									$.post(_eab_data.ajax_url, {
										"action": "eab_get_form",
										"post_id": post_id
									}, function (data) {
										$("body").append('<div id="eab-twitter_form">' + data + '</div>');
										$("#eab-twitter_form").find("." + $me.removeClass("active").attr("class")).click();
									});
								});
							}
						} catch (e) {}
					}, 300);
				});
				return false;
			};
		} else if ($lnk.is(".wpmudevevents-login_link-google")) {
			callback = function () {
				var googleLogin = window.open('https://www.google.com/accounts', "google_login", "scrollbars=no,resizable=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no,height=400,width=800");
				$.post(_eab_data.ajax_url, {
					"action": "eab_get_google_auth_url",
					"url": window.location.href
				}, function (data) {
					var href = data.url;
					googleLogin.location = href;
					var gTimer = setInterval(function () {
						try {
							if (googleLogin.location.hostname == window.location.hostname) {
								// We're back!
								clearInterval(gTimer);
								googleLogin.close();
								// change UI
								$root.html('<img src="' + _eab_data.root_url + 'waiting.gif" /> ' + l10nEabApi.please_wait);
								$.post(_eab_data.ajax_url, {
									"action": "eab_google_login"
								}, function (data) {
									var status = 0;
									try { status = parseInt(data.status, 10); } catch (e) { status = 0; }
									if (!status) { // ... handle error
										$root.remove();
										$me.click();
										return false;
									}
									// Get form if all went well
									$.post(_eab_data.ajax_url, {
										"action": "eab_get_form",
										"post_id": post_id
									}, function (data) {
										$("body").append('<div id="eab-google_form">' + data + '</div>');
										$("#eab-google_form").find("." + $me.removeClass("active").attr("class")).click();
									});
								});
							}
						} catch (e) {}
					}, 300);
				});
				return false;
			};
		}
		else if ($lnk.is(".wpmudevevents-login_link-wordpress")) {
			// Pass on to wordpress login
			callback = function () {
				//window.location = $me.attr("href");
				create_wordpress_login_popup($me, post_id);
				return false;
			};
		} else if ($lnk.is(".wpmudevevents-login_link-cancel")) {
			// Drop entire thing
			callback = function () {
				$me.removeClass("active");
				$root.remove();
				return false;
			};
		}
		if (callback) $lnk
			.unbind('click')
			.bind('click', callback)
		;
	});
	if (l10nEabApi.data.gg_client_id && "undefined" !== typeof gapi && "undefined" !== typeof gapi.signin) gapi.signin.go();
}

// Init
$(function () {
	$(
		"a.wpmudevevents-yes-submit, " +
		"a.wpmudevevents-maybe-submit, " +
		"a.wpmudevevents-no-submit"
	)
		.css("float", "left")
		.unbind('click')
		.on('click touchend', function () {
			$(
				"a.wpmudevevents-yes-submit, " +
				"a.wpmudevevents-maybe-submit, " +
				"a.wpmudevevents-no-submit"
			).removeClass("active");
			create_login_interface($(this));
			return false;
		})
	;
	if (l10nEabApi.data.gg_client_id) {
		window.eab_google_plus_login_callback = signinCallback;
		(function() {
			var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
			po.src = 'https://apis.google.com/js/client:plusone.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
		})();
	}
});

function signinCallback(authResult) {
	if (authResult['status']['signed_in']) {
		$.post(_eab_data.ajax_url, {
			"action": "eab_google_plus_login",
			"token": authResult['access_token']
		}, function (data) {
			window.location.href = window.location.href;
		});
	}
}

})(jQuery);