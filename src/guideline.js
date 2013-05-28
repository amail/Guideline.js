// Guideline.js

;(function(){
	var Guideline = window.Guideline = window.Guideline || {};

	Guideline._guides = {};
	Guideline._currentPage = null;
	Guideline._conditionQueue = null;

	// Utilities

	var Utility = {};

	// Attach a handler to the top of the event queue
	Utility.attachOnFirst = function(selector, eventName, callback) {
		// Inspired by this SO post
		// http://stackoverflow.com/a/2641047/1967542
		var element = $(selector).on(eventName, callback)[0];
	    var safeEventName = eventName.split('.')[0].split(' ')[0];
	    var handlers = $._data(element, 'events')[safeEventName];
	    var handler = handlers.pop();
	    handlers.splice(0, 0, handler);
	};

	// Parse an event 
	Utility.parseEvent = function(rawEvent){
		var data = {};
		var buffer = "";
		var state = "name";

		for(var i=0;i<rawEvent.length;++i){
			var character = rawEvent[i];
			buffer += character;
			if(state == 'name' && character == ' '){
				data[state] = buffer;
				state = "selector";
				buffer = '';
			}
		}

		data[state] = buffer;
		
		return data;
	};

	Utility.getRelativeElementPosition = function(source, targetElement, xDirective, yDirective){
		var isSourceWindow = $.isWindow(source.get(0));

		var xPosition = isSourceWindow ? source.scrollLeft() : source.offset().left;
		var yPosition = isSourceWindow ? source.scrollTop() : source.offset().top;

		if(isSourceWindow){
			switch(xDirective){
				case 'left':
					break;
				case 'center':
					xPosition += (source.outerWidth()/2)-(targetElement.outerWidth()/2);
					break;
				case 'right':
					xPosition += source.outerWidth()-targetElement.outerWidth();
					break;
			}

			switch(yDirective){
				case 'top':
					break;
				case 'middle':
					yPosition += (source.outerHeight()/2)-(targetElement.outerHeight()/2);
					break;
				case 'bottom':
					yPosition += source.outerHeight();//-targetElement.outerHeight();
					break;
			}	
		}else{
			switch(xDirective){
				case 'left':
					xPosition -= targetElement.outerWidth();
					break;
				case 'center':
					xPosition += (source.outerWidth()/2)-(targetElement.outerWidth()/2);
					break;
				case 'right':
					xPosition += source.outerWidth();
					break;
			}

			switch(yDirective){
				case 'top':
					yPosition -= targetElement.outerHeight();
					break;
				case 'middle':
					yPosition += (source.outerHeight()/2)-(targetElement.outerHeight()/2);
					break;
				case 'bottom':yPosition
					yPosition += source.outerHeight();
					break;
			}
		}

		return {
			'x': xPosition,
			'y': yPosition
		};
	};

	// Cookie handling
	// https://github.com/comfirm/Kaka.js

	Utility.Cookie = {};

	Utility.Cookie.get = function(name){
		var cookies = {};
		var decodeComponent = decodeURIComponent;
		var data = (document.cookie || "").split("; ");

		for(var i=0;i<data.length;++i){
			var segments = data[i].split("=", 2);
			if(segments.length == 2){
				cookies[decodeComponent(segments[0])] = decodeComponent(segments[1]);
			}
		}

		return (name === undefined ? cookies : (name in cookies ? cookies[name] : null));
	};

	Utility.Cookie.set = function(name, value, expires, path){
		var variables = {};
		var encodeComponent = encodeURIComponent;

		variables[name] = value == undefined || value == null ? '' : value;
		variables['path'] = path || '/';

		if(expires && expires.toGMTString){
			variables["expires"] = expires.toGMTString();
		}

		var cookie = "";

		for(var key in variables){
			cookie += (cookie != "" ? "; " : "") + encodeComponent(key) + "=" + encodeComponent(variables[key]);
		}

		document.cookie = cookie;
	};

	Utility.Cookie.remove = function(name){
		Utility.Cookie.set(name, null, new Date(0));
	};

	// Core

	Guideline.assertEnginesOn = function(){
		if(Guideline._conditionQueue === null){
			Guideline._conditionQueue = new ConditionQueue();
		}
	};

	// Page handling

	Guideline.setCurrentPage = function(pageName){
		if(Guideline._currentPage != pageName){
			Guideline._currentPage = pageName;
			Guideline.notifyPageChange(Guideline._guides);
		}
	};

	Guideline.notifyPageChange = function(guides){
		if(Guideline._currentPage != null){
			for(var name in guides){
				var guide = guides[name];
				guide.notifyPageChange(Guideline._currentPage);
			}
		}
	};

	// Guide registration

	Guideline.registerGuide = function(guide){
		var guideName = guide.getName();
		if(!(guideName in Guideline._guides)){
			Guideline._guides[guideName] = guide;
			Guideline.notifyPageChange({'0':guide});
		}
	};

	Guideline.getGuide = function(name){
		return name in Guideline._guides ? Guideline._guides[name] : null;
	};

	// Conditions

	Guideline.registerConditionCheck = function(conditionFunction, callback, timeout){
		Guideline.assertEnginesOn();
		return Guideline._conditionQueue.add(conditionFunction, callback, timeout);
	};

	// Event emitter

	var EventEmitter = function(){
		this._events = {};
	};

	EventEmitter.prototype.emit = function(){
		if(arguments.length == 0){
			return false;
		}

		var argumentsCopy = $.makeArray(arguments).sort();
		var eventName = argumentsCopy.pop();

		if(eventName in this._events){
			var eventHandlers = this._events[eventName];
			for(var i=0;i<eventHandlers.length;++i){
				var handler = eventHandlers[i];
				handler.apply(handler, argumentsCopy || []);
			}
		}
	};

	EventEmitter.prototype.on = function(eventName, handler){
		if(!(eventName in this._events)){
			this._events[eventName] = [handler];
		}else{
			this._events[eventName].push(handler);
		}
	};

	// Condition queue

	var ConditionQueue = function(){
		this._items = null;
		this._polling = false;
		this._identityOffset = 0;
		this._defaultMsTimeout = 30*1000; // 30s
		this._msPollInterval = 250; // 250ms
	};

	ConditionQueue.prototype.assertPolling = function(){
		if(!this._polling){
			this.poll();
		}
	};

	ConditionQueue.prototype.add = function(conditionFunction, callback, timeout){
		if(timeout === undefined){
			timeout = this._defaultMsTimeout;
		}

		var identityOffset = ++this._identityOffset;

		if(this._items == null){
			this._items = [];
		}
		
		this._items.push({
			id: identityOffset,
			condition:conditionFunction,
			callback:callback,
			expireAt: timeout === null ? null : new Date().getTime()+timeout
		});
		
		this.assertPolling();

		return identityOffset;
	};

	ConditionQueue.prototype.cancel = function(itemId){
		for(var i=0;i<this._items.length;++i){
			var item = this._items[i];
			if(item.id == itemId){
				item.expireAt = 0;
				break;
			}
		}
	};

	ConditionQueue.prototype.poll = function(){
		if(!this._polling){
			this._polling = true;

			var items = [];
			var outerScope = this;
			var currentTime = new Date().getTime();

			for(var i=0;i<this._items.length;++i){
				var item = this._items[i];
				if(item !== null){
					if(item.expireAt !== null && item.expireAt < currentTime){
						item.callback('Callback expired');
					}else if(item.condition()){
						item.callback(null, item.id);
					}else{
						// Not finished yet, push back onto queue
						items.push(item);
					}
				}
			}

			this._items = items;
			this._polling = false;

			if(items.length > 0){
				setTimeout(function(){outerScope.poll();}, this._msPollInterval);
			}
		}
	};
	
	// Guide

	var Guide = Guideline.Guide = function(name, options){
		options = options || {};

		this._pages = [];
		this._steps = [];
		this._emitter = new EventEmitter();

		this.setName(name);
		this.setStarted(false);
		this.setStartOnUrl(options.startOnUrl);
		this.setSkipAsDefault(options.skipAsDefault);

		this.reset();
	};

	// Properties

	// Name

	Guide.prototype.getName = function(){
		return this._name;
	};

	Guide.prototype.setName = function(name){
		this._name = name;
	};

	// Started

	Guide.prototype.getStarted = function(){
		return this._started || false;
	};

	Guide.prototype.setStarted = function(started){
		this._started = started || false;
	};

	// Start on url

	Guide.prototype.getStartOnUrl = function(){
		return this._startOnUrl;
	};

	Guide.prototype.setStartOnUrl = function(url){
		this._startOnUrl = url || null;
	};

	// Skip on start

	Guide.prototype.getSkipAsDefault = function(){
		return this._skipAsDefault;
	};

	Guide.prototype.setSkipAsDefault = function(skip){
		this._skipAsDefault = skip || false;
	};

	// Page

	Guide.prototype.getNextPage = function(){
		var pageOffset = this.getPageOffset()+1;

		if(pageOffset >= 0 && pageOffset <= this._pages.length-1){
			return this.getPage(pageOffset);
		}

		return null;
	};

	Guide.prototype.getPage = function(offset){
		if(offset === undefined){
			offset = this.getPageOffset();
		}
		return this._pages[offset];
	};

	Guide.prototype.changeToNextPage = function(){
		var nextPage = this.getNextPage();
		
		if(nextPage != null){
			this.setStepOffset(-1);
			this.incrementPageOffset();
			this._steps = this.getPage().getSteps();
		}

		this.changeToNextStep();
	};

	// Step

	Guide.prototype.changeToNextStep = function(){
		var parentStep = this.getParentStep();

		var nextStep = this.getNextStep();
		this.incrementStepOffset();
		
		if(parentStep == null){
			this._emitter.emit('start', this);
		}else{
			parentStep.hide();
		}

		if(nextStep == null){
			// Is this the last page? If so, the guide is complete!
			if(this.getNextPage() == null){
				this._emitter.emit('complete', this);
			}

			// Write page to begin at
			Utility.Cookie.set("guideline_"+this.getName(), this.getPageOffset());
		}else{
			this.setParentStep(nextStep);
			nextStep.show();
		}
	};

	Guide.prototype.getNextStep = function(){
		var stepOffset = this.getStepOffset()+1;

		if(stepOffset >= 0 && stepOffset <= this._steps.length-1){
			return this.getStep(stepOffset);
		}

		return null;
	};

	Guide.prototype.getStep = function(offset){
		if(offset === undefined){
			offset = this.getStepOffset();
		}
		return this._steps[offset];
	};

	// Page offset

	Guide.prototype.getPageOffset = function(){
		var storedPageOffset = parseInt(Utility.Cookie.get("guideline_"+this.getName()));

		if(this._pageOffset == -1 && storedPageOffset >= -1){
			this._pageOffset = parseInt(storedPageOffset);
		}

		return this._pageOffset;
	};

	Guide.prototype.setPageOffset = function(offset){
		this._pageOffset = offset;
	};

	Guide.prototype.incrementPageOffset = function(){
		++this._pageOffset;
		return this._pageOffset;
	};

	// Step offset

	Guide.prototype.getStepOffset = function(){
		return this._stepOffset;
	};

	Guide.prototype.setStepOffset = function(offset){
		this._stepOffset = offset;
	};

	Guide.prototype.incrementStepOffset = function(){
		++this._stepOffset;
		return this._stepOffset;
	};

	Guide.prototype.isLastStepOffset = function(){
		return this.getStepOffset() == this._steps.length;
	};

	// Parent Step

	Guide.prototype.setParentStep = function(step){
		this._parentStep = step;
	};

	Guide.prototype.getParentStep = function(){
		return this._parentStep;
	}

	// Events

	Guide.prototype.on = function(event, handler){
		this._emitter.on(event, handler);
		return this;
	};

	Guide.prototype.notifyPageChange = function(pageName){
		var cookieValue = Utility.Cookie.get("guideline_"+this.getName());

		if(cookieValue === null && this._skipAsDefault){
			cookieValue = "skipped";
			Utility.Cookie.set("guideline_"+this.getName(), "skipped");
		}

		// Check whether or not this guide is skipped
		if(cookieValue == "skipped"){
			return;
		}

		var nextPage = this.getNextPage();

		if(nextPage != null){
			if(this.getParentStep() == null){
				//this._emitter.emit('start', this);
			}
			if(nextPage.getName() == pageName && (this.getStepOffset() == -1 || this.isLastStepOffset())){
				this.changeToNextPage();
			}else if(this.getPageOffset() != -1){
				this.skip();
			}
		}
	};

	// Pages

	Guide.prototype.addPage = function(name, options){
		options = options || {};
		options.guide = this;
		options.name = name;
		
		var page = new Guideline.Page(options);
		this._pages.push(page);

		return page;
	};

	Guide.prototype.start = function(){
		// Check whether current page is our start page
		if(Guideline._currentPage == this.getPage(0).getStep(0).getName()){
			this.notifyPageChange(Guideline._currentPage);
		}else if(this.getStartOnUrl() != null){
			window.location.href = this.getStartOnUrl();
		}
	};

	Guide.prototype.restart = function(){
		this._emitter.emit('restart', this);

		console.log("Restarting!");
		
		Utility.Cookie.set("guideline_"+this.getName(), -1);
		this.reset();

		return this;
	};

	Guide.prototype.register = function(){
		// Register the guide globally so we can
		// receive global page change notifications
		Guideline.registerGuide(this);
	};

	// Skip the guide
	Guide.prototype.skip = function(){
		var currentStep = this.getStep();

		if(currentStep){
			currentStep.hide();
		}

		this._emitter.emit('skip', this);
		Utility.Cookie.set("guideline_"+this.getName(), "skipped");

		this.reset();
	};

	Guide.prototype.reset = function(){
		this.setParentStep(null);
		this.setPageOffset(-1);
		this.setStepOffset(-1);
	};

	// Page

	// A page is a collection of steps that are a part of a guide. 

	var Page = Guideline.Page = function(options){
		this._steps = [];
		this.stepOffset = -1;
		this.name = options.name || null;
		this.guide = options.guide || null;
	};

	// Name

	Page.prototype.getName = function(){
		return this.name;
	};

	// Step

	Page.prototype.addStep = function(options){
		options = options || {};
		options.guide = this.guide;
		
		var step = new Guideline.Step(options);
		this._steps.push(step);

		return step;
	};

	Page.prototype.getSteps = function(){
		return this._steps;
	};

	// Step

	// A guide consists of many steps

	var Step = Guideline.Step = function(options){
		this._actor = null;
		this._hasChanged = false;
		this._hideTimeout = null;
		this._progressBar = null;
		this._bubble = null;
		this._emitter = new EventEmitter();

		this.type = options.type || 'bubble';
		this.guide = options.guide || null;
		this.title = options.title || null;
		this.content = options.content || null;
		this.showAt = options.showAt || "document";
		this.align = options.align || "auto";
		this.overlay = options.overlay || {};
		this.showSkip = options.showSkip || true;
		
		this.continueHtml = options.continueHtml || null;
		this.continueAfter = options.continueAfter || 0;
		this.showContinue = options.showContinue == null ? false : options.showContinue;
		this.continueWhen = options.continueWhen ? (typeof (options.continueWhen) != 'string' ?
			options.continueWhen : Utility.parseEvent(options.continueWhen)) : null;
	};

	Step.prototype.on = function(event, handler){
		this._emitter.on(event, handler);
		return this;
	};

	Step.prototype.show = function(){
		var outerScope = this;

		var wasHidden = !this._visible;
		this._visible = true;

		if(wasHidden){
			this._emitter.emit('show', this);

			this.getActor().show();

			if(this.continueAfter){
				this._hideTimeout = setTimeout(
					function(){ outerScope.changeToNextStep(); },
					this.continueAfter*1000
				);
			}
		}
	};

	Step.prototype.hide = function(){
		var wasVisible = this._visible;
		this._visible = false;

		if(this._hideTimeout){
			clearTimeout(this._hideTimeout);
		}

		if(this._progressBar){
			this._progressBar.stop();
		}

		if(wasVisible){
			this._emitter.emit('hide', this);
			this.getActor().hide();
		}
	};

	Step.prototype.changeToNextStep = function(){
		if(!this._hasChanged && this._visible){
			this._hasChanged = true;
			if(this.guide){
				this.guide.changeToNextStep();
			}
		}
	};

	Step.prototype.getContentElements = function(){
		var outerScope = this;
		var contentElements = $("<div />");

		if(this.title){
			contentElements.append($("<h2 />").text(this.title));
		}

		if(this.content){
			var contentElement = $("<div />").html(this.content);
			
			$(".gl-continue", contentElement).click(function(){
				outerScope.changeToNextStep();
			});

			$(".gl-skip", contentElement).click(function(){
				outerScope.guide.skip();
				return false;
			});

			contentElements.append(contentElement);
		}

		if (this.showSkip && this.type != "overlay") {
			var skipElement = $('<a href="#" class="gl-skip gl-close" title="Close Guide">&times;</a>');
			skipElement.click(function(){
				outerScope.guide.skip();
				return false;
			});
			contentElements.append(skipElement);
		}

		if(this.showContinue){
			var continueElement;
			
			if (typeof(this.continueHtml) === "string") {
				continueElement = $(this.continueHtml);
			} else {
				continueElement = $("<a />").attr("href", "#").text("Continue");
			}
			
			contentElements.append(
				continueElement.click(function(){
					outerScope.changeToNextStep();
					return false;
				})
			);
		}

		if(this.continueAfter > 0){
			var percentage = 0;
			var outerScope = this;

			var progressBar = this._progressBar = $("<div />")
				.addClass("progress-bar")
				.animate({ width: '100%' }, outerScope.continueAfter*1000);

			contentElements.append(progressBar);
		}

		if(this.continueWhen){
			var event = outerScope.continueWhen;
			var isEventFunction = event && typeof (event) == 'function';

			Guideline.registerConditionCheck(isEventFunction ? event : function(){
				return $(event.selector).length > 0;
			}, function(error, result){
				if(!error){
					$(document).ready(function(){
						if(isEventFunction){
							outerScope.changeToNextStep();
						}else{
							Utility.attachOnFirst(event.selector, event.name, function(){
								outerScope.changeToNextStep();
							});
						}
					});
				}
			}, null);
		}

		return contentElements;
	};

	Step.prototype.getActor = function(){
		if(!this._actor){
			this._actor = this.type == 'bubble' ? this.getBubble() : this.getOverlay();
		}
		return this._actor;
	};

	Step.prototype.getOverlay = function(){
		var outerScope = this;
		var overlayTarget = this.showAt == "window" || this.showAt == "document" ? undefined : $(this.showAt);

		return $.lightShow({
			overlay: overlayTarget,
			content: this.getContentElements(),
			callback: {
				hide: {
					after: function(){
						outerScope.changeToNextStep();
					}
				}
			},
			style: this.overlay.style
		});
	};

	Step.prototype.getBubble = function(){
		if(!this._bubble){
			this._bubble = new Bubble({
				content: this.getContentElements(),
				showAt: this.showAt,
				align: this.align
			});
		}
		return this._bubble;
	};

	// Bubble

	var Bubble = Guideline.Bubble = function(options){
		this._visible = false;
		this._cachedElement = null;
		this._redraw_position_timer_id = -1;
		this.content = options.content ||null;
		this.showAt = options.showAt ||null;
		this.align = options.align ||null;
	};

	Bubble.parseAlignment = function(alignment){
		var segments = alignment.split(' ', 2);

		if(segments.length == 0 || segments[0] == 'auto'){
			return {'x':'right','y':'bottom'};
		}

		if(segments.length != 2){
			return false;
		}

		return {'x':segments[0],'y':segments[1]};
	};

	Bubble.getArrowAlignment = function(alignment){
		if(alignment.x != 'center'){
			return alignment.x;
		}
		if(alignment.y != 'middle'){
			return alignment.y;
		}
		return null;
	};

	// Decide how we should position the bubble relative to the element
	Bubble.prototype.positionAt = function(target, align){
		var outerScope = this;

		target = $(target);
		var element = this.getElement();
		
		var alignment = Bubble.parseAlignment(align);
		var position = Utility.getRelativeElementPosition(target, element, alignment.x, alignment.y);
		element.addClass(Bubble.getArrowAlignment(alignment));

		if(scroll){
			if(!$.isWindow(target.get(0))){
				$.scrollTo(position.y/2, 400);
			}
		}

		var redrawPosition;
		redrawPosition = function(){
			if(!outerScope._visible){
				return;
			}

			var position = Utility.getRelativeElementPosition(target, element, alignment.x, alignment.y);

			outerScope.redrawPosition(position.x, position.y);
			outerScope._redraw_position_timer_id = setTimeout(redrawPosition, 100);
		};

		redrawPosition();
	};

	// Draws the element onto a new position. Could possibly animate using delta for smoothness.
	Bubble.prototype.redrawPosition = function(left, top){
		this.getElement().css({
			left: left,
			top: top
		});
	};

	Bubble.prototype.getElement = function(){
		if(!this._cachedElement){
			var arrow = $("<div />")
				.addClass("arrow");

			var content = this.content ? $("<div />")
				.addClass("content").html(this.content) : null;

			this._cachedElement = $("<div />")
				.addClass("gl-bubble")
				.css({
					display: "none",
					position: "absolute",
					"z-index": 999999999,
					left: 0,
					top: 0
				})
				.append(arrow)
				.append(content)
				.appendTo("body");
		}

		return this._cachedElement;
	};

	Bubble.prototype.show = function(){
		var outerScope = this;

		if(!this._visible){
			this._visible = true;
			var element = this.getElement();

			Guideline.registerConditionCheck(function(){
				return $(outerScope.showAt).length > 0;
			}, function(error){
				outerScope.positionAt(outerScope.showAt, outerScope.align);
				element.fadeIn();
			});

			return element;
		}
	};

	Bubble.prototype.hide = function(){
		if(this._visible){
			this._visible = false;
			clearTimeout(this._redraw_position_timer_id);
			this.getElement().fadeOut();
		}
	};
})();