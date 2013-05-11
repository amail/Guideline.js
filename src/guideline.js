var Guideline = window.Guideline = window.Guideline || {};

Guideline._guides = {};
Guideline._currentPage = null;

// Page handling

Guideline.setCurrentPage = function(pageName){
	if(Guideline._currentPage != pageName){
		Guideline._currentPage = pageName;
		Guideline.notifyPageChange(Guideline._guides);
	}
};

Guideline.notifyPageChange = function(stories){
	if(Guideline._currentPage != null){
		for(var name in stories){
			stories[name].notifyPageChange(Guideline._currentPage);
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

// Guide

var Guide = Guideline.Guide = function(name){
	this._pages = [];
	this._steps = [];

	// Initialize properties
	this.setName(name);
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
	
	if(parentStep != null){
		parentStep.hide();
	}

	var nextStep = this.getNextStep();
	this.incrementStepOffset();

	if(nextStep == null){
		// Last step? Write page to begin at.
		Guideline.Cookie.set("guideline_"+this.getName(), this.getPageOffset());
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
	var storedPageOffset = parseInt(Guideline.Cookie.get("guideline_"+this.getName()));

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
	return this.getStepOffset() == Math.max(this._steps.length, 0);
};

// Parent Step

Guide.prototype.setParentStep = function(step){
	this._parentStep = step;
};

Guide.prototype.getParentStep = function(){
	return this._parentStep;
}

// Events

Guide.prototype.notifyPageChange = function(pageName){
	var nextPage = this.getNextPage();

	if(nextPage != null){
		if(nextPage.getName() == pageName){
			if(this.getStepOffset() == -1 || this.isLastStepOffset()){
				this.changeToNextPage();
			}
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

Guide.prototype.begin = function(){
	// Register the guide globally so we can
	// receive global page change notifications
	Guideline.registerGuide(this);
};

Guide.prototype.restart = function(){
	Guideline.Cookie.remove("guideline_"+this.getName());
	this.reset();
	this.begin();
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
	this._steps.push(new Guideline.Step(options));
};

Page.prototype.getSteps = function(){
	return this._steps;
};

// Step

// A guide consists of many steps

var Step = Guideline.Step = function(options){
	this._actor = null;
	this._hideTimeout = null;
	this._progressBar = null;

	this.type = options.type || 'bubble';
	this.guide = options.guide || null;
	this.title = options.title || null;
	this.content = options.content || null;
	this.showAt = options.showAt || "document";
	this.align = options.align || "auto";

	this.continueAfter = options.continueAfter || 0;
	this.continueWhen = options.continueWhen ? Guideline.parseEvent(options.continueWhen) : null;
	this.showNextStep = options.showNextStep == null ? true : options.showNextStep;
};

Step.prototype.show = function(){
	var outerScope = this;

	this._visible = true;
	this.getActor().show();

	if(this.continueAfter){
		this._hideTimeout = setTimeout(
			function(){ outerScope.guide.changeToNextStep(); },
			this.continueAfter*1000
		);
	}
};

Step.prototype.hide = function(){
	this._visible = false;
	clearTimeout(this._hideTimeout);
	
	if(this._progressBar){
		this._progressBar.stop();
	}

	this.getActor().hide();
};

Step.prototype.getContentElements = function(){
	var outerScope = this;
	var contentElements = $("<div />");

	if(this.title){
		contentElements.append($("<h2 />").text(this.title));
	}

	if(this.content){
		contentElements.append($("<div />").html(this.content));
	}

	if(this.showNextStep){
		contentElements.append(
			$("<a />").attr("href", "#").text("Continue").click(function(){
				if(outerScope.guide){
					outerScope.guide.changeToNextStep();
				}
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
		var event = this.continueWhen;
		$(document).ready(function(){
			$(event.selector).on(event.name, function(){
				if(outerScope._visible){
					outerScope.guide.changeToNextStep();
				}
			});
		});
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
	return $.lightShow({
		overlay: this.showAt,
		content: this.getContentElements()
	});
};

Step.prototype.getBubble = function(){
	var bubble = new Bubble({ content: this.getContentElements() });
	bubble.positionAt(this.showAt, this.align);
	return bubble;
};

// Utilities

Guideline.parseEvent = function(rawEvent){
	var data = {};
	var buffer = "";
	var state = "name";

	for(var i=0;i<rawEvent.length;++i){
		var character = rawEvent[i];
		buffer += character;
		if(character == ' '){
			data[state] = buffer;
			state = "selector";
			buffer = '';
		}
	}

	data[state] = buffer;
	
	return data;
};

Guideline.getRelativeElementPosition = function(source, targetElement, xDirective, yDirective){
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
				yPosition += source.outerHeight()-targetElement.outerHeight();
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

// Bubble

var Bubble = Guideline.Bubble = function(options){
	this._cachedElement = null;
	this.content = options.content ||null;
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
	var position = Guideline.getRelativeElementPosition(target, element, alignment.x, alignment.y);
	element.addClass(Bubble.getArrowAlignment(alignment));
	this.redrawPosition(position.x, position.y);

	if(!$.isWindow(target.get(0))){
		$.scrollTo(position.y/2, 400);
	}
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
	return this.getElement().fadeIn();
};

Bubble.prototype.hide = function(){
	return this.getElement().fadeOut();
};

// Cookie handling
// https://github.com/comfirm/Kaka.js

Guideline.Cookie = {};

Guideline.Cookie.get = function(name){
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

Guideline.Cookie.set = function(name, value, expires, path){
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

Guideline.Cookie.remove = function(name){
	Guideline.Cookie.set(name, null, new Date(0));
};