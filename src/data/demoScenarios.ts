/**
 * Pre-built demo scenarios for stage presentations
 * These allow demonstrating the AR navigation without being in an actual station
 */

export type Direction = 'straight' | 'left' | 'right' | 'back' | 'up' | 'down' | 'arrived';

export interface DemoStep {
    instruction: string;
    direction: Direction;
    distance: number; // meters (for display)
    duration: number; // seconds to auto-advance (0 = manual only)
    aiResponse?: string; // What the AI would say
}

export interface DemoScenario {
    id: string;
    name: string;
    station: string;
    description: string;
    userQuery: string; // The question that starts this demo
    steps: DemoStep[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
    {
        id: 'park-to-red-sb',
        name: 'Find Red Line Southbound',
        station: 'Park Street',
        description: 'Navigate from Tremont Street entrance to Red Line southbound platform (Ashmont/Braintree)',
        userQuery: 'How do I get to the Red Line going to Ashmont?',
        steps: [
            {
                instruction: 'Enter through Tremont Street entrance',
                direction: 'straight',
                distance: 0,
                duration: 3,
                aiResponse: 'Welcome to Park Street! Go straight through the entrance towards the fare gates. [STRAIGHT]',
            },
            {
                instruction: 'Pass through the fare gates',
                direction: 'straight',
                distance: 10,
                duration: 3,
                aiResponse: 'Tap your CharlieCard and continue straight. [STRAIGHT]',
            },
            {
                instruction: 'Head to the stairs ahead',
                direction: 'straight',
                distance: 20,
                duration: 4,
                aiResponse: 'Walk straight ahead, you\'ll see stairs going down to the Red Line. [STRAIGHT]',
            },
            {
                instruction: 'Go down the stairs to Red Line',
                direction: 'down',
                distance: 0,
                duration: 4,
                aiResponse: 'Take these stairs down to reach the Red Line platform level. [DOWN]',
            },
            {
                instruction: 'Southbound platform on your right',
                direction: 'right',
                distance: 5,
                duration: 3,
                aiResponse: 'At the bottom, turn right for the Ashmont/Braintree platform. [RIGHT]',
            },
            {
                instruction: 'You\'ve arrived at the platform!',
                direction: 'arrived',
                distance: 0,
                duration: 0,
                aiResponse: 'You\'ve arrived at the Red Line Ashmont/Braintree platform! [ARRIVED]',
            },
        ],
    },
    {
        id: 'downtown-red-to-orange',
        name: 'Red Line to Orange Line Transfer',
        station: 'Downtown Crossing',
        description: 'Transfer from Red Line to Orange Line',
        userQuery: 'I\'m on the Red Line, how do I get to the Orange Line?',
        steps: [
            {
                instruction: 'Exit the Red Line train',
                direction: 'straight',
                distance: 0,
                duration: 2,
                aiResponse: 'Step off the train and look for Orange Line transfer signs. [STRAIGHT]',
            },
            {
                instruction: 'Find the escalators/stairs up',
                direction: 'up',
                distance: 15,
                duration: 4,
                aiResponse: 'Head toward the escalators and go up one level to the Orange Line. [UP]',
            },
            {
                instruction: 'Follow signs to Orange Line',
                direction: 'straight',
                distance: 30,
                duration: 5,
                aiResponse: 'Continue straight following the Orange Line signs through the corridor. [STRAIGHT]',
            },
            {
                instruction: 'Arrive at Orange Line platform',
                direction: 'arrived',
                distance: 0,
                duration: 0,
                aiResponse: 'You\'ve reached the Orange Line platform! Check the signs for Forest Hills or Oak Grove direction. [ARRIVED]',
            },
        ],
    },
    {
        id: 'park-to-green',
        name: 'Find Green Line',
        station: 'Park Street',
        description: 'Navigate from entrance to Green Line platforms',
        userQuery: 'Where is the Green Line?',
        steps: [
            {
                instruction: 'Enter and pass fare gates',
                direction: 'straight',
                distance: 10,
                duration: 3,
                aiResponse: 'Go through the entrance and tap through the fare gates. [STRAIGHT]',
            },
            {
                instruction: 'Turn right after fare gates',
                direction: 'right',
                distance: 0,
                duration: 3,
                aiResponse: 'After the fare gates, turn right toward the Green Line platforms. [RIGHT]',
            },
            {
                instruction: 'Continue to Green Line area',
                direction: 'straight',
                distance: 15,
                duration: 4,
                aiResponse: 'Walk straight ahead to the Green Line boarding area. [STRAIGHT]',
            },
            {
                instruction: 'Arrived at Green Line!',
                direction: 'arrived',
                distance: 0,
                duration: 0,
                aiResponse: 'You\'re at the Green Line! All branches (B, C, D, E) depart from here. [ARRIVED]',
            },
        ],
    },
    {
        id: 'find-exit',
        name: 'Find the Exit',
        station: 'Park Street',
        description: 'Navigate from platform to street exit',
        userQuery: 'How do I get out of here?',
        steps: [
            {
                instruction: 'Head toward the stairs',
                direction: 'straight',
                distance: 10,
                duration: 3,
                aiResponse: 'Look for the stairs or escalator leading up to the main level. [STRAIGHT]',
            },
            {
                instruction: 'Go up to fare gate level',
                direction: 'up',
                distance: 0,
                duration: 4,
                aiResponse: 'Take the stairs up to the fare gate level. [UP]',
            },
            {
                instruction: 'Exit through fare gates',
                direction: 'straight',
                distance: 15,
                duration: 3,
                aiResponse: 'Walk through the exit fare gates toward the street. [STRAIGHT]',
            },
            {
                instruction: 'You\'re at street level!',
                direction: 'arrived',
                distance: 0,
                duration: 0,
                aiResponse: 'You\'ve exited to Tremont Street. Boston Common is across the street! [ARRIVED]',
            },
        ],
    },
];

export const getScenarioById = (id: string): DemoScenario | undefined => {
    return DEMO_SCENARIOS.find(s => s.id === id);
};

export const getScenariosForStation = (stationName: string): DemoScenario[] => {
    return DEMO_SCENARIOS.filter(s => s.station.toLowerCase() === stationName.toLowerCase());
};
