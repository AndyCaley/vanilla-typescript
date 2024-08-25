import { copyFile, stat } from "fs";

namespace GoalPlanning {
    /*
    POC concept:
    - Characters that can move around to various stations
    - Each station controls a subset of ship operations
    */

    enum Location {
        HelmStation,
        DockingStation,
    };

    class WorldState {
        constructor(
            public characterLocation: Location,
            public shipSpeed: number,
            public shipHeading: number,
            public dockingHeading: number,
            public shipDockingClamps: boolean) {
        }

        clone(): WorldState {
            return new WorldState(
                this.characterLocation,
                this.shipSpeed,
                this.shipHeading,
                this.dockingHeading,
                this.shipDockingClamps
            );
        }
    }

    // type WorldState = {
    //     characterLocation: Location;
    //     shipSpeed: number,
    //     shipHeading: number,
    //     dockingHeading: number,
    //     shipDockingClamps: boolean,
    // };

    type Action = {
        name: string;
        preconditions: (state: WorldState) => boolean;
        perform: (state: WorldState) => void;
    };

    type Goal = {
        name: string,
        distance: (state: WorldState) => number
    }

    const actions: Action[] = [
        {
            name: "move to helm",
            preconditions: (state: WorldState) => {
                return state.characterLocation != Location.HelmStation;
            },
            perform: (state: WorldState) => {
                state.characterLocation = Location.HelmStation;
            }
        },
        {
            name: "move to docking",
            preconditions: (state: WorldState) => {
                return state.characterLocation != Location.DockingStation;
            },
            perform: (state: WorldState) => {
                state.characterLocation = Location.DockingStation;
            }
        },
        {
            name: "Docking:Engage Clamps",
            preconditions: (state: WorldState) => {
                return state.characterLocation == Location.DockingStation 
                    && state.shipHeading == state.dockingHeading 
                    && state.shipSpeed < 2;
            },
            perform: (state: WorldState) => {
                state.shipDockingClamps = true;
            }
        },
        {
            name: "Helm:Align to Dock",
            preconditions: (state: WorldState) => {
                return state.characterLocation == Location.HelmStation;
            },
            perform: (state: WorldState) => {
                state.shipHeading = state.dockingHeading;
            }
        },
        {
            name: "Helm:Set Docking Speed",
            preconditions: (state: WorldState) => {
                return state.characterLocation == Location.HelmStation;
            },
            perform: (state: WorldState) => {
                state.shipSpeed = 1;
            }
        }
    ];

    const goals: Goal[] = [
        {
            name: "Dock Ship",
            distance: (state: WorldState) => {
                return (state.shipSpeed == 1 ? 0 : 1)
                    + (state.dockingHeading == state.shipHeading ? 0 : 1)
                    + (state.shipDockingClamps ? 0 : 1);
            }
        }
    ];

    function actionsForState(state: WorldState): Action[] {
        return actions.filter(x => x.preconditions(state));
    }

    function buildPlan(goal: Goal, state: WorldState): Action[] {
        if (goal.distance(state) == 0) {
            // if we are already at the goal, no action needed
            return [];
        }

        let plan: Action[] = [];
        let stack: [WorldState, Action?][] = [[state]];
        while (true) {
            let [nextState, nextAction] = stack.pop() || [];
            if (!nextState) break;

            if (goal.distance(nextState) <= 0) {
                if (nextAction) plan.push(nextAction);
                break;
            }

            let sortedActionStates = actionsForState(nextState!).map((action): [number, WorldState, Action] => {
                let cloneState = nextState!.clone();
                action.perform(cloneState);
                return [goal.distance(cloneState), cloneState, action];
            }).sort((a, b) => b[0] - a[0]);

            for (let [_, actionState, action] of sortedActionStates) {
                stack.push([actionState, action]);
            }

        }
        return plan;
    }

    let plan = buildPlan(goals[0], new WorldState(Location.DockingStation, 5, 213, 100, false));
    console.log(plan);

    //todo: this currently doesn't finish because the last step it needs to do is change from the
    //      helm station to the docking station which doesn't decrease the distance to the goal.
    //      I think this needs to do a combo of BFS plus DFS maybe? or just monte carlo?
}



