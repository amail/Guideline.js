Guideline.js
============

Guideline.js is a non-invasive JavaScript library for creating on-site guides/tours.

## TLDR;

### Create a guide

    var welcomeGuide = new Guideline.Guide("welcome");
    
    var homePage = welcomeGuide.addPage("ProjectListCtrl");
    
    homePage.addStep({
        type: "overlay",
        overlay: {
            style: {
                opacity: 0.9
            }
        },
        showContinue: false,
        content: "<div class='gl-overlay'>" + "<h1>Welcome to AlphaMail!</h1>" + "<p>Let's get familiar with the dashboard by creating <strong>a new project</strong>, <strong>build a template</strong> for it, and then <strong>send a test message</strong>.</p>" + "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Get started</button>" + "<br/>" + "<a href='#' class='gl-skip'>or skip this</a>" + "</div>"
    });
    
    homePage.addStep({
        title: "First, create a new project...",
        showAt: "#create-new-project",
        align: "right middle",
        continueWhen: "click #create-new-project",
        showContinue: false
    });

    welcomeGuide.register();
    
### Trigger a page

Tell Guideline.js which page you're on.

    Guideline.setCurrentPage("home");
    
### Start the guide

    Guideline.getGuide("welcome").start();

## Real world example

### AlphaMail (http://app.amail.io/)

Have a look at AlphaMail's welcome guide. It's the same one that runs when you sign in for the first time!

http://app.amail.io/js/guideline/guides.js

## Documentation

### Guideline

#### Methods

* void setCurrentPage(pageName)
> Sets the name of the current page. Should be called on each page change.

* Guide getGuide(guideName)
> Retrieve a guide by name. Requires that it has been registered.

* void registerGuide(guide)
> Registers a guide to retrieve page changes. Automatically done on guide intiailization.

### Guide

>A guide is a logical representation of pages and steps.

  ```var guide = new Guideline.Guide(name[, options]);```
  
#### Constructor

Guideline.Guide(name[, options]);

> The parameter 'name' is used when determining what page a guide is residing on. I.e. it's important that this value is kept unqiue.
> The parameter 'options' can be used to specify futher settings for this guide.

#### Events

* start
> Occurrs when the guide starts.

* skip
> Occurrs when the user activly skips the guide.

* restart
> Occurrs when the guide is restarted.

* complete
> Occurrs when the guide ends (without being skipped).

#### Methods

* void on(eventName, handler)
> Subscribe to a specific event.

* Page addPage(options)
> Adds a new page to the guide.

* void begin()
> Begins a new story.

* void restart()
> Restarts a story.

### Page

>A page is logical representation of steps.

  ```var page = new Guideline.Page(options);```
  
#### Events

* show
> Occurrs when the step is shown.

* hide
> Occurrs when the step is hidden.
  
#### Methods

* void on(eventName, handler)
> Subscribe to a specific event.

* Step addStep(options)
> Adds a new step to the page.

* Step[] getSteps()
> Retrieves all steps added to this page.

### Step

>A step is a logical representation of actions on a page.

  ```var step = new Guideline.Step(options);```
