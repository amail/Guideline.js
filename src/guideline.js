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

	// Remove attached handler
	Utility.removeHandler = function(selector, eventName, callback) {

		var element = $(selector).off(eventName, callback)[0];
		var safeEventName = eventName.split('.')[0].split(' ')[0];
		// if( $._data(element, 'events')[safeEventName] ){
		// 	console.log('event found in jquery ._data');
		// }
	}

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

		// Add rounding
		xPosition = Number(Math.round(xPosition));
		yPosition = Number(Math.round(yPosition));

		return {
			'x': xPosition,
			'y': yPosition
		};
	};

	// Cookie handling
	// https://github.com/comfirm/Kaka.js

	Utility.Cookie = {};

	Utility.Cookie.get = function(name){
		return $.cookie(name);
	};

	Utility.Cookie.set = function(name, value, expires, path){
		path = path || '/';
		$.cookie(name, value, {path, expires});
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

			// Create new queue
			var items = [];
			var outerScope = this;
			var currentTime = new Date().getTime();

			for(var i=0;i<this._items.length;++i){
				var result = null;
				var item = this._items[i];
				if(item !== null){
					if(item.expireAt !== null && item.expireAt < currentTime){
						item.callback('Callback expired');
					}else if((result = item.condition())){
						item.callback(null, result);
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
		this._emitter = new EventEmitter();
		this.memoizeLasStep = options.memoizeLasStep || false;

		this.setName(name);
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
		this._skipAsDefault = skip === undefined ? true : skip;
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


	Guide.prototype.getPageByName = function(name){
        var pages = this._pages.filter(function(p){return p.getName() == name;});
        return pages? pages[0]: null;
	};

	Guide.prototype.changeToNextPage = function(){
		var nextPage = this.getNextPage();
		
		if(nextPage != null){
			this.setStepOffset(-1);
			this.incrementPageOffset();
			this._steps = this.getPage().getSteps();
		}

	};

	// Step
    
    Guide.prototype.saveStep = function(step){
        if(this.memoizeLasStep){
            var stepOffset = this.getStepOffset();
            if(step === null){++stepOffset;}
            Utility.Cookie.set("guideline_"+this.getName()+"_"+Guideline._currentPage, stepOffset);
        }
    };

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
			// Write page to begin at
			Utility.Cookie.set("guideline_"+this.getName(), this.getPageOffset());
			// Is this the last page? If so, the guide is complete!
			if(this.getNextPage() == null){
				this._emitter.emit('complete', this);
			}
		}else{
			this.setParentStep(nextStep);
			nextStep.show();
		}
		return nextStep
	};

    Guide.prototype.goToStep = function(step){
        if(step){
            var step_id = 0;
            var parentStep = this.getParentStep();
            if(parentStep){parentStep.hide();}
            while(step_id < step){
                var nextStep = this.getNextStep();
                this.incrementStepOffset();
                if(nextStep){
                    this.setParentStep(nextStep);
                    nextStep.hide();
                }
                step_id+=1;
            }
        }
    };

	Guide.prototype.changeToPreviousStep = function(){
		var parentStep = this.getParentStep();

		var previousStep = this.getPreviousStep();
		this.decrementStepOffset();
		
		if(parentStep == null){
			this._emitter.emit('start', this);
		}else{	
			parentStep.hide();
		}

		if(previousStep != null){
			this.setParentStep(previousStep);
			previousStep._hasChanged = false;
			previousStep.show();
		}
	};

	Guide.prototype.getNextStep = function(){
		var stepOffset = this.getStepOffset()+1;

		if(stepOffset >= 0 && stepOffset <= this._steps.length-1){
			return this.getStep(stepOffset);
		}

		return null;
	};

	Guide.prototype.getPreviousStep = function(){
		var stepOffset = this.getStepOffset()-1;

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

	Guide.prototype.decrementStepOffset = function(){
		--this._stepOffset;
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
		var parentStep = this.getParentStep();
		
		if(parentStep != null){
			parentStep.hide();
		}

		if(!this.getStarted()){
			var cookieValue = Utility.Cookie.get("guideline_"+this.getName());

			if(cookieValue === null && this._skipAsDefault){
				cookieValue = "skipped";
				Utility.Cookie.set("guideline_"+this.getName(), "skipped");
			}

			// Check whether or not this guide is skipped
			if(cookieValue == "skipped"){
				return;
			}
		}	

        var nextPage = this.getNextPage();

		if(nextPage != null){
			if(nextPage.getName() == pageName && (this.getStepOffset() >= -1 || this.isLastStepOffset())){
				this.changeToNextPage();
				if(this.memoizeLasStep){
					var current_step = Utility.Cookie.get("guideline_"+this.getName()+"_"+Guideline._currentPage);
					current_step = parseInt(current_step);
					this.goToStep(current_step);
				}
				this.changeToNextStep()
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
		if(this.getStarted()){
			return false;
		}

		this.reset();
		this.setStarted(true);
		Utility.Cookie.set("guideline_"+this.getName(), -1);

		// Check whether current page is our start page
		if(Guideline._currentPage == this.getPage(0).getName()){
			this.notifyPageChange(Guideline._currentPage);
		}else if(this.getStartOnUrl() != null){
			window.location.href = this.getStartOnUrl();
		}
	};

	Guide.prototype.restart = function(){
		this._emitter.emit('restart', this);
		
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
		/**
		 * Iterate steps and reset _hasChanged
		 * FIXES broken 'continue' buttons when tour restarted
		 */
		if (this._steps) {
			for(var i=0;i<this._steps.length;++i){
				this._steps[i]._hasChanged = false;
				// console.log('step title: ' + this._steps[i].title + ' num: ' + i);

				// Replace showAt property with original
				this._steps[i].showAt = this._steps[i].showAtOriginal|| "document";
			}
		}
		
		this._steps = [];
		this.setStarted(false);
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

	Page.prototype.addStep = function(options, condition){
		if(condition == undefined || condition()){
			options = options || {};
			options.guide = this.guide;
			options.page = this;
			
			var step = new Guideline.Step(options);
			this._steps.push(step);

			return step;
		}
		return null
	};

	// Remove steps
	Guide.prototype.removeSteps = function(options){

		// console.log('Guide.this._steps: ' + this._steps.length );

		// Remove steps from page
		var pageSteps = this.getPage().getSteps();
		// console.log('Page.this._steps: ' + pageSteps.length );

		// Iterate steps
		for(var i=0;i<this._steps.length;++i){
			// If not null
			if(this._steps[i] != null && pageSteps[i] != null) {

				// console.log('step[i]: ' + i);

				// Remove continueWhen event listeners
				// console.log('selector: ' + this._steps[i]._event_selector_name + ' eventname: ' + this._steps[i]._event_event_name + ' callback: ' + this._steps[i]._event_callback_function);
				if( typeof(this._steps[i].continueWhen) == 'function' ) {
					Utility.removeHandler(this._steps[i]._event_selector_name, this._steps[i]._event_event_name, this._steps[i]._event_callback_function);
					Utility.removeHandler(pageSteps[i]._event_selector_name, pageSteps[i]._event_event_name, pageSteps[i]._event_callback_function);
					// console.log('RS - continueWhen function');
				}

				// Remove showAt event listeners
				if( typeof(this._steps[i].showAt) == 'function' ) {
					// console.log('RS - showAt function');
				}

				this._steps[i] = pageSteps[i] = null;
			}
		};
		this._steps = pageSteps = [];

		// console.log('Guide.this._steps: ' + this._steps.length );
		// console.log('Page.this._steps: ' + pageSteps.length );
	};


	Page.prototype.getStep = function(offset){
		return offset < this._steps.length ? this._steps[offset] : null;
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
		this._event_selector_name = null;
		this._event_event_name = null;
		this._event_callback_function = null;

		this.type = options.type || 'bubble';
		this.guide = options.guide || null;
		this.page = options.page || null;
		this.title = options.title || null;
		this.content = options.content || null;
		this.showAtOriginal = options.showAt;
		this.showAt = options.showAt || "document";
		this.showSkip = options.showSkip == undefined || options.showSkip;
		this.align = options.align || "auto";
		this.overlayOptions = options.overlayOptions || {};
		this.scrollToItem = options.scrollToItem || false;
		
		this.continueHtml = options.continueHtml || null;
		this.previousHtml = options.previousHtml || null;
		this.stepControlContainer = options.stepControlContainer || null;
		this.continueAfter = options.continueAfter || 0;
		this.showAfter = options.showAfter || 0;
		this.showContinue = options.showContinue === true;
		this.showPrevious = options.showPrevious === true;

		if(options.continueWhen !== undefined && typeof (options.continueWhen) != 'string'){
			this.continueWhen = options.continueWhen;
		}else{
			if(options.continueWhen === undefined && typeof (options.showAt) == 'string'){
				options.continueWhen = 'click ' + this.showAt;
			}

			this.continueWhen = options.continueWhen ? Utility.parseEvent(options.continueWhen) : null;
		}

		// Add cleanup listener
		this._emitter.on('destroyBubble', function() {
            _self._bubble = null;
        });
	};

	Step.prototype.on = function(event, handler){
		this._emitter.on(event, handler);
		return this;
	};

	Step.prototype.show = function(){
		var outerScope = this;
		setTimeout(function(){
            var wasHidden = !outerScope._visible;
			outerScope._visible = true;

			if(wasHidden){
				outerScope._emitter.emit('show', outerScope);

				outerScope.getActor().show();

				if(outerScope.continueAfter){
					outerScope._hideTimeout = setTimeout(
						function(){ outerScope.changeToNextStep(); },
						outerScope.continueAfter*1000
					);
				}
			}
		}, this.showAfter*1000)
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
				this.guide.saveStep(this.guide.changeToNextStep());
			}
		}
	};

	Step.prototype.changeToPreviousStep = function(){
		if(!this._hasChanged && this._visible){
			this._hasChanged = false;
			if(this.guide){
				this.guide.changeToPreviousStep();
			}
		}
	};

	Step.prototype.getContentElements = function(){
		var outerScope = this;
		var contentElements = $("<div />");
        
        if(this.title){
			var headingLevel = !this.showAtOriginal && this.type == "overlay" ? 1 : 2;
			contentElements.append($("<h"+headingLevel+" />").html(this.title));
		}

		if(this.content){
			var contentElement = $("<div />").html(this.content);
			
			$(".gl-continue", contentElement).click(function(){
				outerScope.changeToNextStep();
			});

			$(".gl-previous", contentElement).click(function(){
				outerScope.changeToPreviousStep();
			});

			$(".gl-skip", contentElement).click(function(){
				outerScope.guide.skip();
				return false;
			});

			$(".gl-target-click", contentElement).click(function(){
				$(outerScope.showAt).click();
			});

			contentElements.append(contentElement);
		}

		if (this.showSkip) {
			var skipElement = $('<button type="button" class="gl-skip gl-close" title="Close Guide">&times;</button>');
			skipElement.click(function(){
				outerScope.guide.skip();
				return false;
			});
			contentElements.append(skipElement);
		}
        
        var stepControlContainer;
        if(this.showPrevious || this.showContinue){
            if (typeof(this.stepControlContainer) === "string") {
				stepControlContainer = $(this.stepControlContainer);
			} else {
				stepControlContainer = $("<div class='step-control-container' />");
			}
            contentElements.append(stepControlContainer);
        }

		if(this.showPrevious){
			var previousElement;
			
			if (typeof(this.previousHtml) === "string") {
				previousElement = $(this.previousHtml);
			} else {
				previousElement = $("<a />").attr("href", "#").text("Previous");
			}
			
			stepControlContainer.append(
				previousElement.click(function(){
					outerScope.changeToPreviousStep();
					return false;
				})
			);
		}

		if(this.showContinue){
			var continueElement;
			
			if (typeof(this.continueHtml) === "string") {
				continueElement = $(this.continueHtml);
			} else {
				continueElement = $("<a />").attr("href", "#").text("Continue");
			}
			
			stepControlContainer.append(
				continueElement.click(function(){
					var next_step = outerScope.changeToNextStep();
					
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
							Utility.attachOnFirst(event.selector, event.name, function matchCallback(){
								outerScope.changeToNextStep();
							});
							outerScope._event_selector_name = event.selector;
							outerScope._event_event_name = event.name;
							outerScope._event_callback_function = function matchCallback(){ outerScope.changeToNextStep(); };
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
		_self = this;
		if(!this._bubble){
			this._bubble = new Bubble({
				content: this.getContentElements(),
				type: this.type,
				showAt: this.showAt,
				showAtOriginal: this.showAtOriginal,
				align: this.align,
				_parent_emitter: this._emitter,
				scrollToItem: this.scrollToItem
			});	
		}
		return this._bubble;
	};

	Step.prototype.getBubble = function(){
		_self = this;

		if(!this._bubble){
			this._bubble = new Bubble({
				content: this.getContentElements(),
				showAt: this.showAt,
				align: this.align,
				_parent_emitter: this._emitter,
				scrollToItem: this.scrollToItem
			});	
		}
		return this._bubble;
	};

	// Bubble

	var Bubble = Guideline.Bubble = function(options){
		this._visible = false;
		this._cachedElement = null;
		this._cachedContainer = null;
		this._cachedOverlay = null; // Save reference to overlay
		this.content = options.content ||null;
		this.type = options.type ||null;
		this.showAtOriginal = options.showAtOriginal ||null;
		this.showAt = options.showAt ||null;
		this.align = options.align ||null;
		this._parent_emitter = options._parent_emitter ||null;
		this.scrollToItem = options.scrollToItem;
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
		target = $(target);
		var element = this.getElement();
		
		var alignment = Bubble.parseAlignment(align);
		element.addClass(Bubble.getArrowAlignment(alignment));
        try{
			if(!this._visible){
				return;
			}

			var position = Utility.getRelativeElementPosition(target, element, alignment.x, alignment.y);
			this.redrawPosition(position.x, position.y);
			if(this.showAtOriginal && this.type == "overlay"){
				var top = target.offset().top;
				var left = target.offset().left;
		        var width = target.outerWidth();
		        var height = target.outerHeight();
			    this.redrawHolePosition(top, left, width, height);
			}
		    // If scrollToItem parameter is true
			if (this.scrollToItem) {
				if(scroll){
					if(!$.isWindow(target.get(0))){
						$('html,body').animate({scrollTop:position.y-element.outerHeight()}, 'slow');
					}
				}
			}
		}catch(error){}
	};

	// Draws the element onto a new position. Could possibly animate using delta for smoothness.
	Bubble.prototype.redrawPosition = function(left, top){
		var element = this.getElement();
		if(top<0){
			element.find('.arrow').first().css({
	            top: '10%'
	        });
        }
        top = top < 0 ? 0: top;
        if(left<0){
			element.find('.arrow').first().css({
	            left: '10%'
	        });
        }
        left = left < 0 ? 0: left;
		element.css({
			left: left,
			top: top
		});
	};

	Bubble.prototype.redrawHolePosition = function(top, left, width, height){
		this.getContainer().find('.joyride-hole').css({
			top, left, width, height
		});
	};

    Bubble.prototype.getContainer = function(){
        this.getElement();
        return this._cachedContainer
    };

	Bubble.prototype.getElement = function(){
		if(!this._cachedElement){
			var arrow = $("<div />")
				.addClass("arrow");

			var container = $("<div />")

			var content = this.content ? $("<div />")
				.addClass("content ").html(this.content) : null;

			var cachedElement = $("<div />")
			if(!this.showAtOriginal && this.type == "overlay"){
                content.addClass('col-md-6 col-md-offset-3')
				cachedElement.addClass("gl-overlay row")
				.append(content)
			}else{
				cachedElement.addClass("gl-bubble")
				.css({
					display: "none",
					position: "absolute",
					"z-index": 999999999,
					left: 0,
					top: 0
				})
				.append(arrow)
				.append(content)
			}
            if(this.type == "overlay"){
			    container = $('<div class="joyride-overlay" />')
			    var hole = $('<div />')
			    container.append(hole)
			    if(this.showAtOriginal){
			    	hole.attr('class', 'joyride-hole')
		        }else{
		            hole.attr('class', 'joyride-hole-all')
		        }
		    }

			container.append(cachedElement)
			this._cachedElement = cachedElement
			this._cachedContainer = container
			this._cachedContainer.appendTo("body");
		}

		return this._cachedElement;
	};



	Bubble.prototype.show = function(){
		var outerScope = this;

		if(!this._visible){
			this._visible = true;
			var element = this.getElement();
			var container = this.getContainer();

			// console.log('Bubble showAt: ' + typeof(outerScope.showAt));

			if(typeof(outerScope.showAt) == 'function'){
				Guideline.registerConditionCheck(
					outerScope.showAt,
					function(error, result){
						outerScope.showAt = result;
						container.fadeIn();
						element.fadeIn();
						outerScope.positionAt(outerScope.showAt, outerScope.align);

						// Trigger event
						if (outerScope._parent_emitter) {
							outerScope._parent_emitter.emit('showAtConditionSatisfied', this);
						}
					}
				);
			}else{
				Guideline.registerConditionCheck(function(){
					return $(outerScope.showAt).length > 0 || outerScope.showAt === 'document';
				}, function(error){
                    container.fadeIn();
					element.fadeIn();
					outerScope.positionAt(outerScope.showAt, outerScope.align);
				});
			}

			return element;
		}
	};

	Bubble.prototype.hide = function(){
		var outerScope = this;

		if(this._visible){
			this._visible = false;
			this.getContainer().fadeOut(300, function(){
				// Trigger event
				// if (outerScope._parent_emitter) {
				// 	outerScope._parent_emitter.emit('destroyBubble', this);
				// }
			});
		}
	};
})();