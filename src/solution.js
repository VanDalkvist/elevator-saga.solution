{
    init: function _init(elevators, floors) {

        var sharedQueue = [];
        var upQueue = [];
        var downQueue = [];

        floors.forEach(function (floor) {
            floor.on("up_button_pressed", _handleUpButtonPressOnFloor.bind(null, floor));

            floor.on("down_button_pressed", _handleDownButtonPressOnFloor.bind(null, floor));
        });

        elevators.forEach(function (elevator) {
            elevator.on("idle", _findFloorToGoTo.bind(null, elevator));

            elevator.on("stopped_at_floor", _stoppedAtFloorHandler.bind(null, elevator));

            elevator.on('floor_button_pressed', _floorButtonPressHandler.bind(null, elevator));

            elevator.on("passing_floor", _passingFloorHandler.bind(null, elevator));
        });

        function _handleUpButtonPressOnFloor(floor) {
            var floorNum = floor.floorNum();

            console.log('up button has been pressed at ' + floorNum + ' floor');

            var stopped = _getStoppedElevator();
            if (stopped !== null) {
                stopped.goToFloor(floorNum, true);
                console.log('stopped elevator goes to ' + floorNum);
                return;
            }

            if (sharedQueue.indexOf(floorNum) < 0) {
                sharedQueue.push(floorNum);
                console.log(floorNum + ' floor pushed to sharedQueue');
            }
            if (upQueue.indexOf(floorNum) < 0) {
                upQueue.push(floorNum);
                upQueue = upQueue.sort();
                console.log(floorNum + ' floor pushed to upQueue');
            }

            console.log('up button: up queue: ' + upQueue.join(', ') + '; down queue: ' + downQueue.join(', ') + '; shared queue: ' + sharedQueue.join(', '));
        }

        function _handleDownButtonPressOnFloor(floor) {
            var floorNum = floor.floorNum();
            console.log('down button has been pressed at ' + floorNum + ' floor');

            var stopped = _getStoppedElevator();
            if (stopped !== null) {
                stopped.goToFloor(floorNum, true);
                console.log('stopped elevator goes to ' + floorNum);
                return;
            }

            if (sharedQueue.indexOf(floorNum) < 0) {
                sharedQueue.push(floorNum);
                console.log(floorNum + ' floor pushed to sharedQueue');
            }
            if (downQueue.indexOf(floorNum) < 0) {
                downQueue.push(floorNum);
                downQueue = downQueue.sort();
                console.log(floorNum + ' floor pushed to downQueue');
            }
            console.log('down button: up queue: ' + upQueue.join(', ') + '; down queue: ' + downQueue.join(', ') + '; shared queue: ' + sharedQueue.join(', '));
        }

        function _findFloorToGoTo(elevator) {
            var identity = _getFloorComparer(elevator);
            console.log('idle on ' + elevator.currentFloor() + ' floor. Searching near floor...');
            console.log('idle: up queue: ' + upQueue.join(', ') + '; down queue: ' + downQueue.join(', ') + '; shared queue: ' + sharedQueue.join(', '));

            _findFloorAndElevator(elevator, sharedQueue, identity);
        }

        function _findFloorAndElevator(elevator, floorList, identity, excludedFloors) {
            var nearPressedFloor = _getNearPressedFloor(elevator, floorList, identity, excludedFloors);

            if (nearPressedFloor === undefined || nearPressedFloor === null) {
                console.log('near floor was not found.');
                return {};
            }

            _syncQueues(nearPressedFloor);
            console.log(
                'idle: up queue: ' + upQueue.join(', ')
                + '; down queue: ' + downQueue.join(', ')
                + '; shared queue: ' + sharedQueue.join(', '));

            var betterElevator = _getBetterElevator(elevator, nearPressedFloor);
            if (betterElevator != null) {
                excludedFloors = excludedFloors || [];
                excludedFloors.push(nearPressedFloor);

                _findFloorAndElevator(elevator, floorList, identity, excludedFloors);
            }
            else {
                elevator.goToFloor(nearPressedFloor);

                console.log('go to near floor - ' + nearPressedFloor);
            }
        }

        function _getBetterElevator(elevatorToIgnore, purposeFloor) {
            for (var i = 0; i < elevators.length; i++) {
                var elevator = elevators[i];
                if (elevator === elevatorToIgnore) continue;

                // todo: optimize - select elevator only if it has little time to go to purpose floor (think up)
                if (elevator.getPressedFloors().indexOf(purposeFloor) > -1) {
                    return elevator;
                }
            }
            return null;
        }

        function _stoppedAtFloorHandler(elevator, floorNum) {
            var identity = _getFloorComparer(elevator);

            _syncQueues(floorNum);

            console.log('elevator stopped at ' + elevator.currentFloor() + ' floor. Searching near floor...');

            var pressedFloors = elevator.getPressedFloors();
            var nearPressedFloor = _getNearPressedFloor(elevator, pressedFloors, identity);

            if (nearPressedFloor === undefined || nearPressedFloor === null) {
                console.log('stopped at floor: nothing to do');
                return;
            }

            _syncQueues(nearPressedFloor);

            elevator.goToFloor(nearPressedFloor, true);
            console.log('go to nearPressedFloor (stopped at floor) - ' + nearPressedFloor);
        }

        function _syncQueues(floor) {
            _removeIfExists(sharedQueue, floor);
            _removeIfExists(upQueue, floor);
            _removeIfExists(downQueue, floor);
        }

        function _removeIfExists(arr, element) {
            var foundIndex = arr.indexOf(element);
            if (foundIndex > -1) {
                arr.splice(foundIndex, 1);
            }
        }

        function _floorButtonPressHandler(elevator, floorNum) {
            console.log('floor button has been pressed - ' + floorNum + '. Searching near elevator...');

            var identity = _getFloorComparer(elevator);
            var nearPressedFloor = _getNearPressedFloor(elevator, elevator.getPressedFloors(), identity);

            if (nearPressedFloor === undefined || nearPressedFloor === null) {
                console.log('floor_button_pressed: nothing to do');
                return;
            }

            _syncQueues(nearPressedFloor);

            elevator.goToFloor(nearPressedFloor, true);
            console.log('go to nearPressedFloor (floor_button_pressed)- ' + nearPressedFloor);
        }

        function _passingFloorHandler(elevator, floorNum, direction) {
            console.log('passing_floor: ' + floorNum + ', ' + direction);
            console.log('up queue: ' + upQueue.join(', ') + '; down queue: ' + downQueue.join(', ') + '; shared queue: ' + sharedQueue.join(', '));

            var pressedFloors = elevator.getPressedFloors();
            if (pressedFloors.indexOf(floorNum) > -1) {
                elevator.goToFloor(floorNum, true);
                console.log('go to one of pressed floors - ' + floorNum);
                _syncQueues(floorNum);
                return;
            }

            var queue = direction === "up" ? upQueue : downQueue;
            var foundIndex = queue.indexOf(floorNum);
            if (foundIndex > -1) {
                if (elevator.loadFactor() <= 0.75) {
                    _syncQueues(floorNum);

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
        }

        function _getStoppedElevator() {
            var matched = elevators.filter(function (elevator) {
                return elevator.destinationDirection() === "stopped" && elevator.loadFactor() === 0;
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
                return floor !== undefined && floor !== null;
            };
        }

        function _getNearPressedFloor(elevator, floorList, identity, excludedFloors) {
            var pressed = floorList;

            if (pressed.length === 0) {
                return null;
            }

            if (pressed.length === 1) {
                return pressed[0];
            }

            var floors = pressed.filter(function (floor) {
                return identity(floor) && (!!excludedFloors ? excludedFloors.indexOf(floor) < 0 : true);
            });
            console.log('filtered: ' + floors.join(', '));

            var sorted = floors.sort();

            var indexOfMin = _getMin(sorted, function (floor) {
                return Math.abs(floor - elevator.currentFloor());
            });

            var choice = sorted[indexOfMin];
            console.log(sorted.join(', ') + ' [' + indexOfMin + '] - ' + choice);
            return choice;
        }

        function _getMin(arr, predicate) {
            var foundIndex = -1;
            var minValue = Number.MAX_VALUE;

            for (var i = 0; i < arr.length; i++) {
                var el = arr[i];

                var calc = predicate(el);
                if (calc < minValue) {
                    minValue = calc;
                    foundIndex = i;
                }
            }

            return foundIndex;
        }
    }
,
    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}