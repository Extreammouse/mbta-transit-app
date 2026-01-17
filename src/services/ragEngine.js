import { mbtaKnowledgeBase } from './mbtaKnowledgeBase';

// Enhanced search with fuzzy matching
export const findRelevantInfo = (query) => {
    const lowerQuery = query.toLowerCase();
    const results = [];

    // Check for emergency/help keywords
    if (lowerQuery.includes('lost') || lowerQuery.includes('help') || lowerQuery.includes('confused')) {
        results.push({
            type: 'emergency',
            data: mbtaKnowledgeBase.emergencyInfo.lost_underground,
            relevance: 1.0
        });
    }

    if (lowerQuery.includes('no service') || lowerQuery.includes('no signal') || lowerQuery.includes('underground')) {
        results.push({
            type: 'emergency',
            data: mbtaKnowledgeBase.emergencyInfo.no_service,
            relevance: 1.0
        });
    }

    // Check FAQs with keyword matching
    mbtaKnowledgeBase.faqs.forEach(faq => {
        const keywords = faq.q.split(' ');
        const matchCount = keywords.filter(kw => lowerQuery.includes(kw)).length;
        if (matchCount > 0) {
            results.push({
                type: 'faq',
                data: faq,
                relevance: 0.9 + (matchCount * 0.1)
            });
        }
    });

    // Extract station names from query
    const allStops = new Set();
    mbtaKnowledgeBase.routes.forEach(route => {
        route.stops?.forEach(stop => allStops.add(stop.toLowerCase()));
        if (route.ashmont_branch) {
            route.ashmont_branch.forEach(stop => allStops.add(stop.toLowerCase()));
        }
        route.core_stops?.forEach(stop => allStops.add(stop.toLowerCase()));
    });

    const mentionedStops = [];
    allStops.forEach(stop => {
        if (lowerQuery.includes(stop)) {
            mentionedStops.push(stop);
        }
    });

    // Check for route-to-route queries
    if (mentionedStops.length >= 2) {
        const from = mentionedStops[0];
        const to = mentionedStops[1];

        // Check travel times
        const travelTime = mbtaKnowledgeBase.travelTimes.find(t =>
            t.from.toLowerCase().includes(from) && t.to.toLowerCase().includes(to)
        );

        if (travelTime) {
            results.push({
                type: 'travel_time',
                data: travelTime,
                relevance: 1.0
            });
        }

        // Find routes containing both stations
        mbtaKnowledgeBase.routes.forEach(route => {
            const allRouteStops = [
                ...(route.stops || []),
                ...(route.core_stops || []),
                ...(route.ashmont_branch || [])
            ].map(s => s.toLowerCase());

            if (allRouteStops.includes(from) && allRouteStops.includes(to)) {
                results.push({
                    type: 'direct_route',
                    data: { route, from, to },
                    relevance: 0.95
                });
            }
        });
    }

    // Check routes by name or color
    mbtaKnowledgeBase.routes.forEach(route => {
        if (lowerQuery.includes(route.name.toLowerCase()) ||
            lowerQuery.includes(route.id) ||
            mentionedStops.length > 0) {
            results.push({
                type: 'route',
                data: route,
                relevance: 0.85
            });
        }
    });

    // Check transfers
    mbtaKnowledgeBase.transfers.forEach(transfer => {
        if (lowerQuery.includes(transfer.station.toLowerCase()) ||
            transfer.lines.some(line => lowerQuery.includes(line.toLowerCase())) ||
            lowerQuery.includes('transfer')) {
            results.push({
                type: 'transfer',
                data: transfer,
                relevance: 0.8
            });
        }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
};

// Generate comprehensive response
export const generateResponse = (query, context) => {
    if (context.length === 0) {
        return "I don't have specific information about that in my offline database. Try asking about: MBTA routes (Red, Orange, Green, Blue lines), station transfers, what to do if you took the wrong train, or travel times between stations. I work completely offline, even deep underground!";
    }

    let response = '';
    const uniqueTypes = new Set();

    context.slice(0, 4).forEach(ctx => {
        if (uniqueTypes.has(ctx.type) && ctx.type !== 'faq') return;
        uniqueTypes.add(ctx.type);

        if (ctx.type === 'faq') {
            response += ctx.data.a + '\n\n';
        } else if (ctx.type === 'emergency') {
            response += ctx.data + '\n\n';
        } else if (ctx.type === 'travel_time') {
            response += `Travel time from ${ctx.data.from} to ${ctx.data.to} on the ${ctx.data.line} Line is approximately ${ctx.data.minutes} minutes. `;
        } else if (ctx.type === 'direct_route') {
            const { route, from, to } = ctx.data;
            response += `You can take the ${route.name} directly from ${from} to ${to}. `;
            const allStops = [...(route.stops || []), ...(route.core_stops || []), ...(route.ashmont_branch || [])];
            const fromIdx = allStops.findIndex(s => s.toLowerCase().includes(from));
            const toIdx = allStops.findIndex(s => s.toLowerCase().includes(to));
            if (fromIdx >= 0 && toIdx >= 0) {
                const stopCount = Math.abs(toIdx - fromIdx);
                response += `This is ${stopCount} stop${stopCount !== 1 ? 's' : ''} away. `;
            }
        } else if (ctx.type === 'route') {
            response += `The ${ctx.data.name} runs `;
            if (ctx.data.endpoints) {
                response += `from ${ctx.data.endpoints[0]}. `;
            }
            response += `Typical frequency: ${ctx.data.typical_frequency}. `;
            if (ctx.data.branches) {
                response += `This line has multiple branches: `;
                Object.entries(ctx.data.branches).forEach(([letter, branch]) => {
                    response += `${letter}-${branch.name}, `;
                });
                response += 'so make sure to check the train destination. ';
            }
        } else if (ctx.type === 'transfer') {
            response += `${ctx.data.station} is a transfer station between the ${ctx.data.lines.join(' and ')} lines. ${ctx.data.info} Transfer walking time: ${ctx.data.walk_time}. Tip: ${ctx.data.tips}\n\n`;
        }
    });

    return response.trim() || "I found some information but couldn't generate a clear answer. Try rephrasing your question.";
};