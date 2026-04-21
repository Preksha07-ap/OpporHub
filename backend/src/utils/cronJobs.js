const cron = require('node-cron');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Event = require('../models/Event');
const User = require('../models/User');

const SYSTEM_BOT_EMAIL = 'bot@opporhub.com';

const getSystemBot = async () => {
    let bot = await User.findOne({ email: SYSTEM_BOT_EMAIL });
    if (!bot) {
        bot = await User.create({
            name: 'OpporHub Bot',
            email: SYSTEM_BOT_EMAIL,
            password: 'SecureBotPassword123!',
            role: 'ORGANIZER',
            profileData: {
                organization: 'OpporHub Automated Systems'
            }
        });
        console.log('[Cron] Initialized System Bot Organizer.');
    }
    return bot;
};

// ----------------------------------------------------
// THE UNIVERSAL ADAPTERS
// ----------------------------------------------------

const ApiAdapter = async (source) => {
    const fetchOptions = { method: source.method || 'GET' };
    if (source.headers) fetchOptions.headers = source.headers;
    const response = await fetch(source.url, fetchOptions);
    const rawData = await response.json();
    return source.parser(rawData); // return array of mapped mapped events
};

const ScraperAdapter = async (source) => {
    // A hit to an Apify Webhook or Puppeteer endpoint
    console.log(`[Cron] Executing Apify Scraper trigger for ${source.name}...`);
    if (!source.url) return [];
    
    // In production, this would look like: 
    // const res = await fetch(source.url, { method: 'POST', body: JSON.stringify(source.payload) })
    // const dataset = await res.json()
    // return source.parser(dataset)
    return [];
};

const AiParserAdapter = async (source) => {
    console.log(`[Cron] Initializing AI Parser for unstructured ${source.name} data...`);
    if (!process.env.GEMINI_API_KEY) {
        console.warn('[Cron] Gemini API Key missing for AI Parser hook.');
        return [];
    }
    
    // Fetch unstructured data first
    const response = await fetch(source.url);
    const rawText = await response.text();
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Extract all individual real-world tech events (like meetups, internships, or workshops) from this raw text data: ${rawText.substring(0, 15000)}. 
    Format the output STRICTLY as a valid JSON array of objects fitting this schema: 
    [{ "title": "...", "description": "max 200 words", "startDate": "ISO format", "endDate": "ISO format", "link": "URL", "location": "string", "type": "Workshop|Internship|Hackathon|Open Source", "format": "Online|In-Person", "coverImage": "unsplash image URL" }].
    Return ONLY standard JSON without markdown blocks.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error(`[Cron] AI Parser failed to cleanly parse ${source.name}:`, e.message);
    }
    return [];
};


// ----------------------------------------------------
// SOURCES CONFIGURATION ARRAY
// ----------------------------------------------------
const sources = [
    {
        name: 'Codeforces',
        adapterType: 'API',
        url: 'https://codeforces.com/api/contest.list?gym=false',
        method: 'GET',
        parser: (data) => {
            if (data.status !== 'OK') return [];
            const contests = data.result.filter(c => c.phase === 'BEFORE').slice(0, 10);
            return contests.map(contest => {
                const startDate = new Date(contest.startTimeSeconds * 1000);
                const endDate = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);
                return {
                    title: contest.name,
                    description: `Join the upcoming ${contest.name} competitive programming contest!`,
                    startDate: startDate,
                    endDate: endDate,
                    deadline: startDate,
                    link: `https://codeforces.com/contests/${contest.id}`,
                    tags: ['Competitive Programming', 'Algorithm', 'Coding'],
                    location: 'Online',
                    type: 'Hackathon',
                    format: 'Online',
                    status: 'Upcoming',
                    capacity: 0,
                    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800'
                };
            });
        }
    },
    {
        name: 'GitHub Open Source "Good First Issues"',
        adapterType: 'API',
        url: 'https://api.github.com/search/issues?q=label:"good-first-issue"+is:issue+is:open&sort=created&order=desc&per_page=10',
        method: 'GET',
        headers: { 'User-Agent': 'OpporHub-Platform-Aggregator' },
        parser: (data) => {
            if (!data.items) return [];
            return data.items.map(issue => {
                const startDate = new Date(issue.created_at);
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + 30);
                return {
                    title: issue.title,
                    description: `Contribute to Open Source! Repository: ${issue.repository_url.split('/').slice(-2).join('/')}. \nPreview: ${issue.body ? issue.body.slice(0, 200) + '...' : 'Check the link for details.'}`,
                    startDate: startDate,
                    endDate: endDate,
                    deadline: endDate,
                    link: issue.html_url,
                    tags: ['Open Source', 'Contribution', 'Beginner Friendly'],
                    location: 'Remote',
                    type: 'Open Source',
                    format: 'Online',
                    status: 'Upcoming',
                    capacity: 0,
                    coverImage: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=800'
                };
            });
        }
    },
    {
        name: 'TheMuse Software Engineering Internships',
        adapterType: 'API',
        url: null, // Endpoint: https://www.themuse.com/api/public/jobs?category=Software%20Engineering&level=Internship
        parser: (data) => [] // Add logic when key is available
    },
    {
        name: 'Eventbrite API (Workshops)',
        adapterType: 'API',
        url: null, // Requires Eventbrite Private API Key
        parser: (data) => []
    },
    {
        name: 'Meetup Tech Conferences',
        adapterType: 'API',
        url: null, // Requires Meetup Pro GraphQL Key
        parser: (data) => []
    },
    {
        name: 'Unstop Hackathons',
        adapterType: 'SCRAPER',
        url: null, // Apify Actor Webhook
        payload: { keyword: "Hackathon", location: "India" },
        parser: (data) => []
    },
    {
        name: 'Messy Tech Board',
        adapterType: 'AI_PARSER',
        url: 'https://raw.githubusercontent.com/pittcsc/Summer2025-Internships/dev/README.md', // Using the famous Pitt CSC Internships Repo
        parser: null // Handled natively by AI
    }
];

// ----------------------------------------------------
// CORE AGGREGATOR ENGINE
// ----------------------------------------------------
const runAggregatorEngine = async () => {
    try {
        console.log('[Cron] Initiating Adapter-Driven Aggregator Engine...');
        const botUser = await getSystemBot();
        let totalAdded = 0;

        for (const source of sources) {
            if (!source.url) continue;

            console.log(`[Cron] Executing ${source.adapterType} Adapter for: ${source.name}...`);
            try {
                let parsedEvents = [];

                switch (source.adapterType) {
                    case 'API':
                        parsedEvents = await ApiAdapter(source);
                        break;
                    case 'SCRAPER':
                        parsedEvents = await ScraperAdapter(source);
                        break;
                    case 'AI_PARSER':
                        parsedEvents = await AiParserAdapter(source);
                        break;
                    default:
                        console.warn(`[Cron] Unknown adapter type: ${source.adapterType}`);
                }
                
                let addedFromSource = 0;

                // Universal Deduplication Loop
                for (const mappedEvent of parsedEvents) {
                    if (!mappedEvent.link) continue;
                    
                    const existingEvent = await Event.findOne({ link: mappedEvent.link });
                    if (!existingEvent) {
                        mappedEvent.organizerId = botUser._id;
                        await Event.create(mappedEvent);
                        addedFromSource++;
                        totalAdded++;
                    }
                }
                
                if (addedFromSource > 0) {
                    console.log(`[Cron] Inserted ${addedFromSource} new events from ${source.name}.`);
                } else {
                    console.log(`[Cron] No new distinct events found for ${source.name}.`);
                }

            } catch (sourceError) {
                console.error(`[Cron] Error processing source ${source.name}:`, sourceError.message);
            }
        }

        console.log(`[Cron] Aggregator Engine cycle complete. Total new events: ${totalAdded}`);
    } catch (err) {
        console.error('[Cron] Aggregator Engine completely failed:', err);
    }
};

const startCronJobs = () => {
    console.log('[Cron] Universal Aggregator Engine scheduled.');
    cron.schedule('0 0 * * *', () => {
        console.log('[Cron] Triggering daily aggregation cycle...');
        runAggregatorEngine();
    });
    
    // Run once immediately on startup logic
    runAggregatorEngine();
};

module.exports = { startCronJobs };
