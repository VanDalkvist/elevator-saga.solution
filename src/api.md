<div class="container" style="width: 960px">

<div class="header">

# Elevator Saga _Help and API documentation_

</div>

<div class="help">

## About the game

This is a game of programming!  
Your task is to program the movement of elevators, by writing a program in [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide).

The goal is to transport people in an efficient manner.  
Depending on how well you do it, you can progress through the ever more difficult challenges.  
Only the very best programs will be able to complete all the challenges.

## How to play

Enter your code in the input window below the game view, and press the <span class="emphasis-color">Apply</span> button to start the challenge.  
You can increase or decrease the speed of time by pressing the and buttons.

If your program contains an error, you can use the developer tools in your web browser to try and debug it. If you want to start over with the code, press the <span class="emphasis-color">Reset</span> button. This will revert the code to a working but simplistic implementation.  
If you have a favorite text editor, such as [Sublime Text](http://www.sublimetext.com/), feel free to edit the code there and paste it into the game editor.  
Your code is automatically saved in your local storage, so don't worry - it doesn't disappear if you accidentally close the browser.

## Basics

Your code must declare an object containing at least two functions called <span class="emphasis-color">init</span> and <span class="emphasis-color">update</span>. Like this:

<div>

    {
        init: function(elevators, floors) {
            // Do stuff with the elevators and floors, which are both arrays of objects
        },
        update: function(dt, elevators, floors) {
            // Do more stuff with the elevators and floors
            // dt is the number of game seconds that passed since the last time update was called
        }
    }

</div>

These functions will then be called by the game during the challenge.  
<span class="emphasis-color">init</span> will be called when the challenge starts, and <span class="emphasis-color">update</span> repeatedly during the challenge.

Normally you will put most of your code in the <span class="emphasis-color">init</span> function, to set up event listeners and logic.

## Code examples

### How to control an elevator

<dl>

<dt>

    elevator.goToFloor(1);

</dt>

<dd>Tell the elevator to move to floor 1 after completing other tasks, if any. Note that this will have no effect if the elevator is already queued to go to that floor.</dd>

<dt>

    if(elevator.currentFloor() > 2) { ... }

</dt>

<dd>Calling currentFloor gets the floor number that the elevator currently is on. Note that this is a rounded number and does not necessarily mean the elevator is in a stopped state.</dd>

</dl>

### Listening for events

It is possible to listen for events, like when stopping at a floor, or a button has been pressed.

<dl>

<dt>

    elevator.on("idle", function() { elevator.goToFloor(0); });

</dt>

<dd>Listen for the "idle" event issued by the elevator, when the task queue has been emptied and the elevator is doing nothing. In this example we tell it to move to floor 0.</dd>

<dt>

    elevator.on("floor_button_pressed", function(floorNum) { ... } );

</dt>

<dd>Listen for the "floor_button_pressed" event, issued when a passenger pressed a button inside the elevator. This indicates that the passenger wants to go to that floor.</dd>

<dt>

    floor.on("up_button_pressed", function() { ... } );

</dt>

<dd>Listen for the "up_button_pressed" event, issued when a passenger pressed the up button on the floor they are waiting on. This indicates that the passenger wants to go to another floor.</dd>

</dl>

## API documentation

### Elevator object

<table class="doctable">

<thead>

<tr>

<th width="150">Property</th>

<th width="90">Type</th>

<th width="190">Explanation</th>

<th width="*">Example</th>

</tr>

</thead>

<tbody>

<tr>

<td>goToFloor</td>

<td>function</td>

<td><small>Queue the elevator to go to specified floor number. If you specify true as second argument, the elevator will go to that floor directly, and then go to any other queued floors.</small></td>

<td>

    elevator.goToFloor(3); // Do it after anything else
    elevator.goToFloor(2, true); // Do it before anything else

</td>

</tr>

<tr>

<td>stop</td>

<td>function</td>

<td><small>Clear the destination queue and stop the elevator if it is moving. Note that you normally don't need to stop elevators - it is intended for advanced solutions with in-transit rescheduling logic. Also, note that the elevator will probably not stop at a floor, so passengers will not get out.</small></td>

<td>

    elevator.stop();

</td>

</tr>

<tr>

<td>currentFloor</td>

<td>function</td>

<td><small>Gets the floor number that the elevator currently is on.</small></td>

<td>

    if(elevator.currentFloor() === 0) {
        // Do something special?
    }

</td>

</tr>

<tr>

<td>goingUpIndicator</td>

<td>function</td>

<td><small>Gets or sets the going up indicator, which will affect passenger behaviour when stopping at floors.</small></td>

<td>

    if(elevator.goingUpIndicator()) {
        elevator.goingDownIndicator(false);
    }

</td>

</tr>

<tr>

<td>goingDownIndicator</td>

<td>function</td>

<td><small>Gets or sets the going down indicator, which will affect passenger behaviour when stopping at floors.</small></td>

<td>

    if(elevator.goingDownIndicator()) {
        elevator.goingUpIndicator(false);
    }

</td>

</tr>

<tr>

<td>maxPassengerCount</td>

<td>function</td>

<td><small>Gets the maximum number of passengers that can occupy the elevator at the same time.</small></td>

<td>

    if(elevator.maxPassengerCount() > 5) {
        // Use this elevator for something special, because it's big
    }

</td>

</tr>

<tr>

<td>loadFactor</td>

<td>function</td>

<td><small>Gets the load factor of the elevator. 0 means empty, 1 means full. Varies with passenger weights, which vary - not an exact measure.</small></td>

<td>

    if(elevator.loadFactor() < 0.4) {
        // Maybe use this elevator, since it's not full yet?
    }

</td>

</tr>

<tr>

<td>destinationDirection</td>

<td>function</td>

<td><small>Gets the direction the elevator is currently going to move toward. Can be "up", "down" or "stopped".</small></td>

</tr>

<tr>

<td>destinationQueue</td>

<td>array</td>

<td><small>The current destination queue, meaning the floor numbers the elevator is scheduled to go to. Can be modified and emptied if desired. Note that you need to call checkDestinationQueue() for the change to take effect immediately.</small></td>

<td>

    elevator.destinationQueue = [];
    elevator.checkDestinationQueue();

</td>

</tr>

<tr>

<td>checkDestinationQueue</td>

<td>function</td>

<td><small>Checks the destination queue for any new destinations to go to. Note that you only need to call this if you modify the destination queue explicitly.</small></td>

<td>

    elevator.checkDestinationQueue();

</td>

</tr>

<tr>

<td>getPressedFloors</td>

<td>function</td>

<td><small>Gets the currently pressed floor numbers as an array.</small></td>

<td>

    if(elevator.getPressedFloors().length > 0) {
        // Maybe go to some chosen floor first?
    }

</td>

</tr>

</tbody>

</table>

<table class="doctable">

<thead>

<tr>

<th width="150">Event</th>

<th width="280">Explanation</th>

<th>Example</th>

</tr>

</thead>

<tbody>

<tr>

<td>idle</td>

<td><small>Triggered when the elevator has completed all its tasks and is not doing anything.</small></td>

<td>

    elevator.on("idle", function() { ... });

</td>

</tr>

<tr>

<td>floor_button_pressed</td>

<td><small>Triggered when a passenger has pressed a button inside the elevator.</small></td>

<td>

    elevator.on("floor_button_pressed", function(floorNum) {
        // Maybe tell the elevator to go to that floor?
    })

</td>

</tr>

<tr>

<td>passing_floor</td>

<td><small>Triggered slightly before the elevator will pass a floor. A good time to decide whether to stop at that floor. Note that this event is not triggered for the destination floor. Direction is either "up" or "down".</small></td>

<td>

    elevator.on("passing_floor", function(floorNum, direction) { ... });

</td>

</tr>

<tr>

<td>stopped_at_floor</td>

<td><small>Triggered when the elevator has arrived at a floor.</small></td>

<td>

    elevator.on("stopped_at_floor", function(floorNum) {
        // Maybe decide where to go next?
    })

</td>

</tr>

</tbody>

</table>

### Floor object

<table class="doctable">

<thead>

<tr>

<th width="150">Property</th>

<th width="90">Type</th>

<th width="190">Explanation</th>

<th width="*">Example</th>

</tr>

</thead>

<tbody>

<tr>

<td>floorNum</td>

<td>function</td>

<td><small>Gets the floor number of the floor object.</small></td>

<td>

    if(floor.floorNum() > 3) { ... }

</td>

</tr>

</tbody>

</table>

<table class="doctable">

<thead>

<tr>

<th width="150">Event</th>

<th width="280">Explanation</th>

<th>Example</th>

</tr>

</thead>

<tbody>

<tr>

<td>up_button_pressed</td>

<td><small>Triggered when someone has pressed the up button at a floor. Note that passengers will press the button again if they fail to enter an elevator.</small></td>

<td>

    floor.on("up_button_pressed", function() {
        // Maybe tell an elevator to go to this floor?
    })

</td>

</tr>

<tr>

<td>down_button_pressed</td>

<td><small>Triggered when someone has pressed the down button at a floor. Note that passengers will press the button again if they fail to enter an elevator.</small></td>

<td>

    floor.on("down_button_pressed", function() {
        // Maybe tell an elevator to go to this floor?
    })

</td>

</tr>

</tbody>

</table>

</div>

<div class="footer">

#### Made by Magnus Wolffelt and contributors

#### [Source code](https://github.com/magwo/elevatorsaga) on GitHub

</div>

</div>

<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','//www.google-analytics.com/analytics.js','ga'); ga('create', 'UA-56810935-1', 'auto'); ga('send', 'pageview');</script>