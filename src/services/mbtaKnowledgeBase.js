// Complete MBTA knowledge base for offline use
export const mbtaKnowledgeBase = {
    routes: [
        {
            id: 'red',
            name: 'Red Line',
            color: '#DA291C',
            stops: ['Alewife', 'Davis', 'Porter', 'Harvard', 'Central', 'Kendall/MIT',
                'Charles/MGH', 'Park Street', 'Downtown Crossing', 'South Station',
                'Broadway', 'Andrew', 'JFK/UMass', 'North Quincy', 'Wollaston',
                'Quincy Center', 'Quincy Adams', 'Braintree'],
            ashmont_branch: ['JFK/UMass', 'Savin Hill', 'Fields Corner', 'Shawmut', 'Ashmont'],
            typical_frequency: '4-6 minutes peak, 8-13 minutes off-peak',
            avg_speed: '21 mph',
            endpoints: ['Alewife to Braintree/Ashmont']
        },
        {
            id: 'orange',
            name: 'Orange Line',
            color: '#ED8B00',
            stops: ['Oak Grove', 'Malden Center', 'Wellington', 'Assembly', 'Sullivan Square',
                'Community College', 'North Station', 'Haymarket', 'State',
                'Downtown Crossing', 'Chinatown', 'Tufts Medical Center', 'Back Bay',
                'Massachusetts Avenue', 'Ruggles', 'Roxbury Crossing', 'Jackson Square',
                'Stony Brook', 'Green Street', 'Forest Hills'],
            typical_frequency: '4-7 minutes peak, 9-13 minutes off-peak',
            avg_speed: '19 mph',
            endpoints: ['Oak Grove to Forest Hills']
        },
        {
            id: 'green',
            name: 'Green Line',
            color: '#00843D',
            core_stops: ['Government Center', 'Park Street', 'Boylston', 'Arlington',
                'Copley', 'Hynes Convention Center', 'Kenmore'],
            branches: {
                'B': {
                    name: 'Boston College',
                    route: 'via Commonwealth Ave',
                    stops: ['Blandford Street', 'BU East', 'BU Central', 'BU West',
                        'St. Paul Street', 'Pleasant Street', 'Babcock Street',
                        'Packards Corner', 'Harvard Avenue', 'Griggs Street',
                        'Allston Street', 'Warren Street', 'Washington Street',
                        'Sutherland Road', 'Chiswick Road', 'Chestnut Hill Avenue',
                        'South Street', 'Boston College']
                },
                'C': {
                    name: 'Cleveland Circle',
                    route: 'via Beacon St',
                    stops: ['St. Mary Street', 'Hawes Street', 'Kent Street', 'St. Paul Street',
                        'Coolidge Corner', 'Summit Avenue', 'Brandon Hall', 'Fairbanks Street',
                        'Washington Square', 'Tappan Street', 'Dean Road', 'Englewood Avenue',
                        'Cleveland Circle']
                },
                'D': {
                    name: 'Riverside',
                    route: 'via Brookline',
                    stops: ['Fenway', 'Longwood', 'Brookline Village', 'Brookline Hills',
                        'Beaconsfield', 'Reservoir', 'Chestnut Hill', 'Newton Centre',
                        'Newton Highlands', 'Eliot', 'Waban', 'Woodland', 'Riverside']
                },
                'E': {
                    name: 'Heath Street',
                    route: 'via Huntington Ave',
                    stops: ['Prudential', 'Symphony', 'Northeastern University',
                        'Museum of Fine Arts', 'Longwood Medical Area', 'Brigham Circle',
                        'Fenwood Road', 'Mission Park', 'Riverway', 'Back of the Hill',
                        'Heath Street']
                }
            },
            typical_frequency: '5-7 minutes peak, 10-15 minutes off-peak',
            avg_speed: '9 mph'
        },
        {
            id: 'blue',
            name: 'Blue Line',
            color: '#003DA5',
            stops: ['Bowdoin', 'Government Center', 'State', 'Aquarium', 'Maverick',
                'Airport', 'Wood Island', 'Orient Heights', 'Suffolk Downs',
                'Beachmont', 'Revere Beach', 'Wonderland'],
            typical_frequency: '4-8 minutes peak, 10-15 minutes off-peak',
            avg_speed: '22 mph',
            endpoints: ['Bowdoin to Wonderland']
        }
    ],

    transfers: [
        {
            station: 'Park Street',
            lines: ['Red', 'Green'],
            info: 'Major downtown transfer hub. Red Line platforms are one level below Green Line.',
            walk_time: '2-3 minutes',
            accessibility: 'Elevators available',
            tips: 'Follow overhead signs. Green Line has multiple branches - check destination.'
        },
        {
            station: 'Downtown Crossing',
            lines: ['Red', 'Orange'],
            info: 'Busiest station in the system. Major shopping district.',
            walk_time: '3-4 minutes',
            accessibility: 'Elevators available',
            tips: 'Platform can be crowded during rush hour. Multiple exits to street level.'
        },
        {
            station: 'Government Center',
            lines: ['Green', 'Blue'],
            info: 'Transfer point near City Hall and Faneuil Hall.',
            walk_time: '2-3 minutes',
            accessibility: 'Elevators available',
            tips: 'Blue Line is one level below Green Line.'
        },
        {
            station: 'State',
            lines: ['Orange', 'Blue'],
            info: 'Downtown transfer near Financial District.',
            walk_time: '2-3 minutes',
            accessibility: 'Elevators available',
            tips: 'Historic station with connections to multiple exits.'
        },
        {
            station: 'North Station',
            lines: ['Orange', 'Green'],
            info: 'Major hub with Commuter Rail and connections to TD Garden.',
            walk_time: '3-5 minutes',
            accessibility: 'Elevators available',
            tips: 'Very busy during Bruins/Celtics games. Commuter Rail for North Shore.'
        },
        {
            station: 'Haymarket',
            lines: ['Orange', 'Green'],
            info: 'Near historic market district.',
            walk_time: '2-3 minutes',
            accessibility: 'Limited - stairs only at some exits',
            tips: 'Weekend market creates heavy foot traffic.'
        }
    ],

    travelTimes: [
        { from: 'Harvard', to: 'Park Street', line: 'Red', minutes: 8 },
        { from: 'Harvard', to: 'South Station', line: 'Red', minutes: 15 },
        { from: 'Harvard', to: 'JFK/UMass', line: 'Red', minutes: 20 },
        { from: 'Alewife', to: 'Park Street', line: 'Red', minutes: 18 },
        { from: 'Alewife', to: 'South Station', line: 'Red', minutes: 25 },
        { from: 'Forest Hills', to: 'Downtown Crossing', line: 'Orange', minutes: 20 },
        { from: 'Oak Grove', to: 'Downtown Crossing', line: 'Orange', minutes: 22 },
        { from: 'Back Bay', to: 'Downtown Crossing', line: 'Orange', minutes: 5 },
        { from: 'Wonderland', to: 'Government Center', line: 'Blue', minutes: 18 },
        { from: 'Airport', to: 'Government Center', line: 'Blue', minutes: 10 }
    ],

    faqs: [
        {
            q: 'took wrong train',
            a: 'If you took the wrong train, exit at the very next station. Cross the platform to the opposite side and board a train going in the reverse direction. Check the digital signs or ask station staff for the correct direction. Most MBTA stations have trains running in both directions from the same platform area.'
        },
        {
            q: 'how to transfer',
            a: 'To transfer between lines, exit your train and follow the overhead signs pointing to your destination line. Transfer stations have clear signage. At Park Street (Red/Green), Downtown Crossing (Red/Orange), Government Center (Green/Blue), State (Orange/Blue), and North Station (Orange/Green). Transfers are free within 2 hours.'
        },
        {
            q: 'which direction',
            a: 'Check the front of the train or digital displays. Red Line: Inbound goes toward Park Street/South Station, Outbound goes toward Alewife or Braintree/Ashmont. Orange Line: Northbound to Oak Grove, Southbound to Forest Hills. Blue Line: Eastbound to Wonderland, Westbound to Bowdoin. Green Line: check branch letter (B/C/D/E) and final destination.'
        },
        {
            q: 'how long does it take',
            a: 'Average travel times: Across downtown (2-5 stops) is about 5-8 minutes. From end to end of a line: Red Line 35-40 minutes, Orange Line 30-35 minutes, Blue Line 20-25 minutes. Add 3-5 minutes for each transfer. During rush hour, add extra time for crowding.'
        },
        {
            q: 'missed my stop',
            a: 'If you missed your stop, stay on the train until the next station. Exit and take the train back in the opposite direction. Get off at your intended stop. This only adds about 5-10 minutes to your journey.'
        },
        {
            q: 'red line branches',
            a: 'The Red Line splits at JFK/UMass into two branches: Braintree and Ashmont. Check the front sign and announcements. If you need Ashmont branch stops (Savin Hill, Fields Corner, Shawmut, Ashmont), wait for "Ashmont" train. For Quincy stops (North Quincy, Wollaston, Quincy Center, Quincy Adams, Braintree), take "Braintree" train.'
        },
        {
            q: 'green line branches',
            a: 'The Green Line has 4 branches (B/C/D/E) that split at different points. All go through Park Street and Copley. Check the letter and destination on the front. B goes to Boston College, C to Cleveland Circle, D to Riverside, E to Heath Street. If wrong branch, get off at Kenmore or Copley and wait for correct branch.'
        }
    ],

    emergencyInfo: {
        'lost_underground': 'If you are lost underground, look for station maps posted on walls. They show your current location and all exits. Station staff are available at most major stations. You can also ask fellow passengers for help - Bostonians are generally helpful with directions.',
        'no_service': 'Without cell service underground, use this offline chatbot for basic transit help. Station maps are posted throughout. Listen for announcements and watch digital signs for service updates. If confused, exit at the next stop and check signage.',
        'safety': 'In an emergency, use the red emergency call boxes on platforms or in trains. Station staff monitor these 24/7. Police and transit authorities respond quickly to all emergency calls.'
    }
};