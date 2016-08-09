// dependencies

// exports

module.exports = {
    init: _init,
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
};

// initialization

// private methods

function _init(elevators, floors) {

    var generalQueue = [];
    var upQueue = [];
    var downQueue = [];

    floors.forEach(function (floor) {

        floor.on("up_button_pressed", function() {

            var floorNum = floor.floorNum();

            //debugger;
            var stopped = _getStoppedElevator();
            if (stopped !== null) {
                stopped.goToFloor(floorNum, true);
                console.log('stopped elevator goes to ' + floorNum);
                return;
            }

            var matched = elevators.filter(function (elevator) {
                return elevator.destinationDirection() === "up"
                    && elevator.currentFloor() < floorNum
                    && elevator.loadFactor() <= 0.7;
            });

            if (matched && matched.length > 0) {
                matched[0].goToFloor(floorNum);
                console.log(floorNum + ' floor added to elevator queue (up)');
                return;
            }

            if (generalQueue.indexOf(floorNum) < 0) {
                generalQueue.push(floorNum);
                console.log(floorNum + ' floor pushed to generalQueue');
            }
            if (upQueue.indexOf(floorNum) < 0) {
                upQueue.push(floorNum);
                upQueue = upQueue.sort();
                console.log(floorNum + ' floor pushed to upQueue');
            }

            //for (var i = 0; i < elevators.length; i++) {
            //    var elevator = elevators[0];

            //    elevator.destinationQueue = [];
            //    elevator.checkDestinationQueue();
            // elevator.goToFloor(floor.floorNum(), true);
            //}
        });

        floor.on("down_button_pressed", function() {
            var floorNum = floor.floorNum();

            //debugger;

            var stopped = _getStoppedElevator();
            if (stopped !== null) {
                stopped.goToFloor(floorNum, true);
                console.log('stopped elevator goes to ' + floorNum);
                return;
            }

            var matched = elevators.filter(function (elevator) {
                return elevator.destinationDirection() === "down"
                    && elevator.currentFloor() > floorNum
                    && elevator.loadFactor() <= 0.7;
            });

            if (matched && matched.length > 0) {
                matched[0].goToFloor(floorNum);
                console.log(floorNum + ' floor added to elevator queue (down)');
                return;
            }

            if (generalQueue.indexOf(floorNum) < 0) {
                generalQueue.push(floorNum);
                console.log(floorNum + ' floor pushed to generalQueue');
            }
            if (downQueue.indexOf(floorNum) < 0) {
                downQueue.push(floorNum);
                downQueue = downQueue.sort();
                console.log(floorNum + ' floor pushed to downQueue');
            }
        });
    });

    elevators.forEach(function (elevator) {
        elevator.on("idle", function() {

            var identity = _getFloorComparer(elevator);
            var nearPressedFloor = _getNearPressedFloor(elevator, generalQueue, identity);

            if (nearPressedFloor === undefined || nearPressedFloor === null) {
                console.log('pop from generalQueue');
            } else {
                var index = generalQueue.indexOf(nearPressedFloor);
                generalQueue.splice(index, 1);
                elevator.goToFloor(nearPressedFloor);
                console.log('go to near floor');
            }
        });

        elevator.on("stopped_at_floor", function(floorNum) {
            var identity = _getFloorComparer(elevator);
            var nearPressedFloor = _getNearPressedFloor(elevator, elevator.getPressedFloors(), identity);

            if (nearPressedFloor === undefined || nearPressedFloor === null) {
                console.log('floor_button_pressed: nothing to do');
                return;
            }
            //debugger;
            elevator.goToFloor(nearPressedFloor, true);
            console.log('go to nearPressedFloor (stopped at floor) - ' + nearPressedFloor);
        });

        elevator.on('floor_button_pressed', function (floorNum) {
            console.log('floor button has been pressed - ' + floorNum);

            var identity = _getFloorComparer(elevator);
            var nearPressedFloor = _getNearPressedFloor(elevator, elevator.getPressedFloors(), identity);

            if (nearPressedFloor === undefined || nearPressedFloor === null) {
                console.log('floor_button_pressed: nothing to do');
                return;
            }
            //debugger;
            elevator.goToFloor(nearPressedFloor, true);
            console.log('go to nearPressedFloor (floor_button_pressed)- ' + nearPressedFloor);
        });

        elevator.on("passing_floor", function(floorNum, direction) {
            console.log('passing_floor: ' + floorNum + ', ' + direction);
            var queue = direction === "up" ? upQueue : downQueue;

            var pressedFloors = elevator.getPressedFloors();

            if (pressedFloors.indexOf(floorNum) > -1) {
                elevator.goToFloor(floorNum, true);
                console.log('go to one of pressed floors - ' + floorNum);
                var foundIndex = queue.indexOf(floorNum);
                if (foundIndex > -1) {
                    queue.splice(foundIndex, 1);
                }
            }

            //debugger
            var foundIndex = queue.indexOf(floorNum);
            if (foundIndex > -1) {
                if (elevator.loadFactor() <= 0.75) {
                    queue.splice(foundIndex, 1);
                    console.log('calculated min - stopping on ' + floorNum);
                    elevator.goToFloor(floorNum, true);
                }
                else {
                    console.log('elevator is too busy...');
                }
            }
            else {
                console.log('could not calculate min');
            }
        });
    });

    function _getStoppedElevator() {
        var matched = elevators.filter(function (elevator) {
            return elevator.destinationDirection() === "stopped";
        });

        if (matched && matched.length === 1) {
            console.log('getting first stopped elevator');
            return matched[0];
        }

        if (matched && matched.length > 1) {
            // todo: optimize

            console.log('getting first (from many) stopped elevator');
            return matched[0];
        }

        return null;
    }

    function _getFloorComparer(elevator) {
        if (elevator.goingUpIndicator()) {
            return function (floor) {
                return floor > elevator.currentFloor();
            };
        }
        else if (elevator.goingDownIndicator()) {
            return function (floor) {
                return floor < elevator.currentFloor();
            };
        }
        return function (floor) {
            return floor;
        };
    }

    function _getNearPressedFloor(elevator, floorList, identity) {
        var pressed = floorList;

        if (pressed.length === 0) {
            return null;
        }

        if (pressed.length === 1) {
            return pressed[0];
        }

        var floors = pressed.filter(identity);

        var sorted = floors.sort();

        var indexOfMin = _getMin(sorted, function (floor) {
            return Math.abs(floor - elevator.currentFloor());
        });

        var choice = sorted[indexOfMin];
        console.log('choice - ' + choice);
        return choice;
    }

    function _getMin(arr, predicate) {
        var foundIndex = -1;
        var minValue = -1;

        for ( var i = 0; i < arr.length; i++ ) {
            var el = arr[i];

            var calc = predicate(el);
            if (calc < minValue) {
                minValue = calc;
                foundIndex = i;
            }
        }

        return i;
    }
}