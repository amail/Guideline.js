StoryLine Todo
--------------------------------------

* Implement support for delays. Each story should have a possibility to set a delay.
I.e. 'when completed, wait 10 seconds' or 'wait until element exists'... Etc.

* Implement continuation based on condition.
I.e. make it possible to pass a function to Story.continueWhen. This type of condition continues once the condition is met.
The condition is registered globally and evaluated once every 100-200ms. If the function returns true then the condition is met.

* Implement support for events. I.e. story.on('completed', callback);

* Navigation. Navigate back to a previous plot.

* Automatic placement of bubbles where best suited.
