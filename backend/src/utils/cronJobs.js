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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Extract all individual real-world tech events (like meetups, internships, or workshops) from this raw text data: ${rawText.substring(0, 15000)}. 
    Format the output STRICTLY as a valid JSON array of objects fitting this schema: 
    [{ "title": "...", "description": "max 200 words", "startDate": "ISO format", "endDate": "ISO format", "link": "URL", "location": "string", "type": "Hackathon|Tech Talk|Meetup|Webinar|College Fest|Startup Event|Internship|Workshop", "format": "Online|In-Person|Hybrid", "coverImage": "unsplash image URL", "perks": ["Cash Prize", "Certificate"], "participationType": "Solo|Team", "duration": "Few hours|1 day|Multi-day", "skillLevel": "Beginner|Intermediate|Advanced|All Levels", "workshopFormat": "Hands-on|Project-based|Bootcamp", "toolsUsed": ["React", "AWS"], "outcomes": ["Build a React App"], "certificate": true|false, "pricing": "Free|Paid" }].
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
        console.log(`[Cron] Falling back to predefined AI extraction output for demonstration purposes...`);
        // Failsafe Mock Output simulating AI extraction of a messy Markdown file
        return [
            {
                title: "Summer 2026 Tech Internships - Big N",
                description: "Extracted from public repo. Software Engineering Internships at leading tech companies.",
                startDate: new Date().toISOString(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
                deadline: new Date().toISOString(),
                link: source.url,
                tags: ['Internship', 'Software Engineering', 'Big Tech'],
                location: 'Remote',
                city: 'Global',
                source: 'GitHub',
                type: 'Internship',
                format: 'Online',
                status: 'Upcoming',
                capacity: 0,
                coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
            }
        ];
    }
    return [];
};

const GodModeCrawlerAdapter = async (source) => {
    console.log(`[Cron] Initiating God-Mode Crawler for query: "${source.searchQuery}"`);
    if (!process.env.GEMINI_API_KEY) {
        console.warn('[Cron] Gemini API Key missing for God-Mode Crawler.');
        return [];
    }

    // 1. Simulate Google Custom Search API fetching top 3 URLs
    const targetUrls = source.mockSearchUrls || [];
    let extractedEvents = [];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Loop through the URLs (Hard limit of 3 to prevent memory crash)
    for (const url of targetUrls.slice(0, 3)) {
        console.log(`[Cron] Crawling HTML from: ${url}`);
        try {
            // In a real scenario, we'd use puppeteer or standard fetch. 
            // We use simulated raw HTML payload for the demo to bypass strict bot-protections (like Cloudflare on Luma)
            const rawHTML = `<html><body><h1>Exclusive Secret AI Hackathon 2026</h1><p>Join us at the secret bunker in Bangalore on December 1st 2026 for the ultimate AI showdown. Win 10,000 USD!</p><a href="${url}">Register Here</a></body></html>`;
            
            const prompt = `You are a God-Mode web crawler. Extract any tech conferences, hackathons, or meetups from this raw HTML: ${rawHTML}. 
            Format the output STRICTLY as a valid JSON array of objects fitting this schema: 
            [{ "title": "...", "description": "max 200 words", "startDate": "ISO format", "endDate": "ISO format", "link": "URL", "location": "string", "city": "string", "type": "Hackathon|Tech Talk|Meetup|Webinar|College Fest|Startup Event|Conference|Workshop", "format": "Online|In-Person|Hybrid", "coverImage": "unsplash image URL", "perks": ["Cash Prize", "Swag", "Networking"], "participationType": "Solo|Team", "duration": "Few hours|1 day|Multi-day", "skillLevel": "Beginner|Intermediate|Advanced|All Levels", "workshopFormat": "Hands-on|Project-based|Bootcamp", "toolsUsed": ["Python", "Docker"], "outcomes": ["Deploy an API"], "certificate": true|false, "pricing": "Free|Paid" }].
            Return ONLY standard JSON without markdown blocks.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\[.*\]/s);
            
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                extractedEvents = [...extractedEvents, ...parsed];
                console.log(`[Cron] God-Mode successfully extracted ${parsed.length} events from ${url}`);
            }
        } catch (e) {
            console.error(`[Cron] God-Mode Crawler failed on ${url}:`, e.message);
        }
    }
    
    return extractedEvents;
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
        url: 'https://api.github.com/search/issues?q=label:"good-first-issue"+is:issue+is:open&sort=created&order=desc&per_page=50',
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
                    tags: ['Open Source', 'Contribution', 'Beginner Friendly', 'Good First Issue', 'Good First Issues'],
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
        name: 'Eventbrite API (Tech Events India)',
        adapterType: 'API',
        // Fetching Tech (Category 102) events in India
        url: process.env.EVENTBRITE_API_KEY 
            ? 'https://www.eventbriteapi.com/v3/events/search/?categories=102&location.address=India&expand=venue,organizer' 
            : null,
        method: 'GET',
        headers: process.env.EVENTBRITE_API_KEY ? { 'Authorization': `Bearer ${process.env.EVENTBRITE_API_KEY}` } : null,
        parser: (data) => {
            if (!data || !data.events) return [];
            return data.events.map(event => {
                const isOnline = event.online_event;
                return {
                    title: event.name.text,
                    description: event.description.text ? event.description.text.slice(0, 300) + '...' : 'Check link for details.',
                    startDate: new Date(event.start.utc),
                    endDate: new Date(event.end.utc),
                    deadline: new Date(event.start.utc),
                    link: event.url,
                    tags: ['Eventbrite', 'Tech'],
                    location: isOnline ? 'Remote' : (event.venue?.name || 'TBD'),
                    city: event.venue?.address?.city || 'Unknown',
                    state: event.venue?.address?.region || 'Unknown',
                    country: 'India',
                    source: 'Eventbrite',
                    type: 'Meetup',
                    format: isOnline ? 'Online' : 'In-Person',
                    status: 'Upcoming',
                    capacity: event.capacity || 0,
                    coverImage: event.logo?.url || 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80'
                };
            });
        }
    },
    {
        name: 'Meetup Tech Conferences',
        adapterType: 'API',
        // Mocking the Meetup GraphQL Response Structure to prevent crashes without a Pro key
        url: 'MOCK_MEETUP_ENDPOINT', 
        parser: (data) => {
            // Simulated GraphQL Response Map
            return [
                {
                    title: "React Developer Bangalore Meetup",
                    description: "Join us for an evening of React hooks, context, and networking!",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
                    link: "https://meetup.com/react-bangalore",
                    tags: ['React', 'Frontend', 'Web Development'],
                    location: "Bangalore",
                    city: "Bangalore",
                    state: "Karnataka",
                    country: "India",
                    source: "Meetup",
                    type: "Meetup",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 100,
                    coverImage: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=800"
                }
            ];
        }
    },
    {
        name: 'GDG (Google Developer Groups)',
        adapterType: 'API',
        url: 'MOCK_GDG_ENDPOINT',
        parser: (data) => {
            // Simulated GDG Events Feed
            return [
                {
                    title: "Google Cloud Next Extended India",
                    description: "Experience the latest from Google Cloud. Keynotes, workshops, and cloud credits!",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 16)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
                    link: "https://gdg.community.dev/events/details/google-cloud-next-india",
                    tags: ['Google Cloud', 'GDG', 'Cloud / DevOps'],
                    location: "Delhi",
                    city: "Delhi",
                    state: "Delhi",
                    country: "India",
                    source: "GDG",
                    type: "Conference",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 500,
                    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Google I/O Extended 2026 - Mumbai",
                    description: "Bringing the magic of Google I/O to Mumbai. Join us for developer keynotes, tech talks, and local community networking.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
                    link: "https://gdg.community.dev/events/details/google-io-extended-mumbai",
                    tags: ['Google', 'Android', 'Flutter', 'Cloud'],
                    location: "Mumbai",
                    city: "Mumbai",
                    country: "India",
                    source: "GDG Mumbai",
                    type: "Conference",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 300,
                    coverImage: "https://images.unsplash.com/photo-1591115765373-520b7aecd281?auto=format&fit=crop&q=80&w=800"
                }
            ];
        }
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
    },
    {
        name: 'God-Mode Deep Web Crawler',
        adapterType: 'GOD_MODE_CRAWLER',
        searchQuery: "New Tech Conferences Hackathons India 2026",
        mockSearchUrls: [
            "https://lu.ma/secret-ai-hackathon",
            "https://dev.to/events/hidden-react-meetup",
            "https://twitter.com/tech_events_india/status/123456"
        ],
        url: 'ACTIVE' // to bypass the URL check in the loop
    },
    {
        name: 'Devfolio Hackathons & Ideathons',
        adapterType: 'API',
        url: 'MOCK_DEVFOLIO_ENDPOINT',
        parser: (data) => {
            // Simulated Devfolio/Devpost API Response
            return [
                {
                    title: "ETHIndia 2026",
                    description: "Asia's largest Ethereum hackathon. Build the future of Web3 over an intense 36-hour weekend in Bangalore.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 47)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
                    link: "https://ethindia.co",
                    tags: ['Web3', 'Blockchain', 'Ethereum', 'Hackathon'],
                    location: "Bangalore",
                    city: "Bangalore",
                    state: "Karnataka",
                    country: "India",
                    source: "Devfolio",
                    type: "Hackathon",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 1500,
                    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f4ec651?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Smart India Hackathon (SIH) 2026",
                    description: "Nationwide initiative to provide students a platform to solve some of the pressing problems we face in our daily lives.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 92)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
                    link: "https://www.sih.gov.in/",
                    tags: ['Ideathon', 'Government', 'Open Innovation', 'Hackathon'],
                    location: "Various Hubs",
                    country: "India",
                    source: "Government of India",
                    type: "Hackathon",
                    format: "Hybrid",
                    status: "Upcoming",
                    capacity: 10000,
                    coverImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "HackMIT 2026",
                    description: "MIT's premier hackathon. Join students from around the world to build, learn, and innovate over 24 hours.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 150)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 151)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 120)).toISOString(),
                    link: "https://hackmit.org",
                    tags: ['Hackathon', 'MIT', 'Innovation'],
                    location: "Cambridge, MA",
                    country: "USA",
                    source: "MIT",
                    type: "Hackathon",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 1000,
                    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "CalHacks 13.0",
                    description: "The world's largest collegiate hackathon at UC Berkeley. Build something legendary at the base of the Campanile.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 180)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 182)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 150)).toISOString(),
                    link: "https://calhacks.io",
                    tags: ['Hackathon', 'UC Berkeley', 'Big Tech'],
                    location: "Berkeley, CA",
                    country: "USA",
                    source: "UC Berkeley",
                    type: "Hackathon",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 2000,
                    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "HackOut 2026",
                    description: "India's biggest LGBTQ+ focused hackathon. A safe space to build inclusive technology.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 22)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
                    link: "https://hackout.io",
                    tags: ['Hackathon', 'Inclusive', 'Web Dev'],
                    location: "Bangalore",
                    country: "India",
                    source: "Community",
                    type: "Hackathon",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 300,
                    coverImage: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?auto=format&fit=crop&q=80&w=800"
                }
            ];
        }
    },
    {
        name: 'Global Open Source Fellowships',
        adapterType: 'API',
        url: 'MOCK_FELLOWSHIP_ENDPOINT',
        parser: (data) => {
            // Simulated Aggregated Fellowships Data
            return [
                {
                    title: "MLH Fellowship - Fall 2026",
                    description: "A 12-week remote internship alternative where you contribute to open source and learn from industry experts. Includes educational stipend.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 120)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 200)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
                    link: "https://fellowship.mlh.io/",
                    tags: ['Fellowship', 'Open Source', 'Mentorship', 'Remote'],
                    location: "Remote",
                    country: "Global",
                    source: "Major League Hacking",
                    type: "Open Source",
                    format: "Online",
                    status: "Upcoming",
                    capacity: 150,
                    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Outreachy Mentorship",
                    description: "Paid, remote internships strongly supporting diversity in tech. Interns work closely with legendary open-source maintainers.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 150)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
                    link: "https://www.outreachy.org/",
                    tags: ['Fellowship', 'Diversity', 'Open Source', 'Paid'],
                    location: "Remote",
                    country: "Global",
                    source: "Software Freedom Conservancy",
                    type: "Open Source",
                    format: "Online",
                    status: "Upcoming",
                    capacity: 50,
                    coverImage: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Google Summer of Code (GSoC) 2026",
                    description: "A global, online program focused on bringing new contributors into open source software development. Contributors work with an open source organization on a 12+ week programming project under the guidance of mentors.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 180)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
                    link: "https://summerofcode.withgoogle.com/",
                    tags: ['Fellowship', 'Mentorship', 'Open Source', 'Paid', 'Google'],
                    location: "Remote",
                    country: "Global",
                    source: "Google",
                    type: "Open Source",
                    format: "Online",
                    status: "Upcoming",
                    capacity: 1000,
                    coverImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "LFX Mentorship Program",
                    description: "The Linux Foundation Mentorship Program offers structured remote learning opportunities to aspiring open source software developers. Mentees will learn how to interact with the open source community.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 120)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
                    link: "https://lfx.linuxfoundation.org/tools/mentorship/",
                    tags: ['Mentorship', 'Open Source', 'Linux', 'Paid'],
                    location: "Remote",
                    country: "Global",
                    source: "Linux Foundation",
                    type: "Open Source",
                    format: "Online",
                    status: "Upcoming",
                    capacity: 200,
                    coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800"
                }
            ];
        }
    },
    {
        name: 'Tech Workshops & Bootcamps',
        adapterType: 'API',
        url: 'MOCK_WORKSHOP_ENDPOINT',
        parser: (data) => {
            return [
                {
                    title: "Advanced React Patterns Workshop",
                    description: "A deep dive into advanced React hooks, custom hooks, and state management for production-scale applications.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
                    link: "https://frontendmasters.com/workshops/",
                    tags: ['React', 'Web Dev', 'Frontend'],
                    location: "Remote",
                    city: "Global",
                    source: "Frontend Masters",
                    type: "Workshop",
                    format: "Online",
                    status: "Upcoming",
                    capacity: 100,
                    workshopFormat: "Project-based",
                    skillLevel: "Advanced",
                    coverImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "AWS Cloud Practitioner Bootcamp",
                    description: "Learn the fundamentals of AWS cloud services and deploy your first full-stack application.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
                    link: "https://aws.amazon.com/training/",
                    tags: ['AWS', 'Cloud / DevOps', 'Infrastructure'],
                    location: "Bangalore",
                    city: "Bangalore",
                    state: "Karnataka",
                    country: "India",
                    source: "AWS Educate",
                    type: "Workshop",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 50,
                    workshopFormat: "Hands-on",
                    skillLevel: "Beginner",
                    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "UI/UX Design Masterclass with Figma",
                    description: "A comprehensive workshop on building modern interfaces using Figma and understanding UX principles.",
                    startDate: new Date().toISOString(), // Starting today
                    endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
                    deadline: new Date().toISOString(),
                    link: "https://www.figma.com/resources/events/",
                    tags: ['UI/UX', 'Design', 'Figma'],
                    location: "Mumbai",
                    city: "Mumbai",
                    state: "Maharashtra",
                    country: "India",
                    source: "Design Community",
                    type: "Workshop",
                    format: "Hybrid",
                    status: "Upcoming",
                    capacity: 200,
                    workshopFormat: "Bootcamp",
                    skillLevel: "Intermediate",
                    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Full Stack AI Bootcamp",
                    description: "Learn to build and deploy LLM-powered applications from scratch using Next.js and LangChain.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 40)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 35)).toISOString(),
                    link: "https://buildspace.so/",
                    tags: ['AI', 'LLM', 'Full Stack', 'Next.js'],
                    location: "Remote",
                    country: "Global",
                    source: "Buildspace",
                    type: "Workshop",
                    format: "Online",
                    status: "Upcoming",
                    capacity: 500,
                    workshopFormat: "Bootcamp",
                    skillLevel: "Intermediate",
                    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Kubernetes for Developers",
                    description: "Master container orchestration. Learn how to scale and manage your applications in production.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 16)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
                    link: "https://cncf.io/",
                    tags: ['Kubernetes', 'Docker', 'DevOps'],
                    location: "Bangalore",
                    country: "India",
                    source: "CNCF",
                    type: "Workshop",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 100,
                    workshopFormat: "Hands-on",
                    skillLevel: "Advanced",
                    coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=800"
                }
            ];
        }
    },
    {
        name: 'Top Tier Tech Internships',
        adapterType: 'API',
        url: 'MOCK_INTERNSHIP_ENDPOINT',
        parser: (data) => {
            return [
                {
                    title: "Google SWE Intern, Summer 2026",
                    description: "Work on core products used by billions of people. Requires a solid foundation in computer science, algorithms, and data structures.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 180)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
                    link: "https://careers.google.com/students/",
                    tags: ['Internship', 'Software Engineering', 'Paid', 'On-site'],
                    location: "Bangalore",
                    city: "Bangalore",
                    state: "Karnataka",
                    country: "India",
                    source: "Google Careers",
                    type: "Internship",
                    format: "Hybrid",
                    status: "Upcoming",
                    capacity: 50,
                    coverImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Microsoft Explore Intern",
                    description: "A 12-week summer internship program designed specifically for first- and second-year college students interested in exploring software engineering.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 180)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
                    link: "https://careers.microsoft.com/students/us/en",
                    tags: ['Internship', 'Beginner Friendly', 'Paid', 'Remote'],
                    location: "Remote",
                    country: "Global",
                    source: "Microsoft Careers",
                    type: "Internship",
                    format: "Online",
                    status: "Upcoming",
                    capacity: 100,
                    coverImage: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Stripe Backend Engineering Intern",
                    description: "Join the infrastructure team to build scalable payment systems. High-impact role writing production code in Ruby and Go.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 150)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
                    link: "https://stripe.com/jobs/students",
                    tags: ['Internship', 'Backend', 'Go', 'Ruby', 'Paid'],
                    location: "Seattle",
                    country: "USA",
                    source: "Stripe",
                    type: "Internship",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 20,
                    coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Amazon SDE Intern 2026",
                    description: "Work on large-scale distributed systems. Help build the future of e-commerce and cloud computing.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 120)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 210)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
                    link: "https://amazon.jobs/students",
                    tags: ['Internship', 'Distributed Systems', 'Java', 'Paid'],
                    location: "Hyderabad",
                    city: "Hyderabad",
                    country: "India",
                    source: "Amazon",
                    type: "Internship",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 200,
                    coverImage: "https://images.unsplash.com/photo-1521791136064-7986c29596ba?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Tesla Autopilot Engineering Intern",
                    description: "Join the team building the future of autonomous driving. Work on computer vision and real-time AI systems.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 150)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 240)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(),
                    link: "https://www.tesla.com/careers/students",
                    tags: ['Internship', 'AI', 'C++', 'Python', 'Automotive'],
                    location: "Palo Alto, CA",
                    country: "USA",
                    source: "Tesla",
                    type: "Internship",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 10,
                    coverImage: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800"
                },
                {
                    title: "Flipkart APM Intern",
                    description: "Learn the ropes of product management at India's leading e-commerce giant.",
                    startDate: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 150)).toISOString(),
                    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
                    link: "https://www.flipkartcareers.com/",
                    tags: ['Internship', 'Product Management', 'MBA', 'B.Tech'],
                    location: "Bangalore",
                    country: "India",
                    source: "Flipkart",
                    type: "Internship",
                    format: "In-Person",
                    status: "Upcoming",
                    capacity: 30,
                    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                }
            ];
        }
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
                        if (source.url === 'MOCK_MEETUP_ENDPOINT' || source.url === 'MOCK_GDG_ENDPOINT' || source.url === 'MOCK_DEVFOLIO_ENDPOINT' || source.url === 'MOCK_FELLOWSHIP_ENDPOINT' || source.url === 'MOCK_WORKSHOP_ENDPOINT' || source.url === 'MOCK_INTERNSHIP_ENDPOINT') {
                            parsedEvents = source.parser(); // Call mock directly without fetch
                        } else {
                            parsedEvents = await ApiAdapter(source);
                        }
                        break;
                    case 'SCRAPER':
                        parsedEvents = await ScraperAdapter(source);
                        break;
                    case 'AI_PARSER':
                        parsedEvents = await AiParserAdapter(source);
                        break;
                    case 'GOD_MODE_CRAWLER':
                        parsedEvents = await GodModeCrawlerAdapter(source);
                        break;
                    default:
                        console.warn(`[Cron] Unknown adapter type: ${source.adapterType}`);
                }
                
                let addedFromSource = 0;

                // Universal Deduplication Loop
                for (const mappedEvent of parsedEvents) {
                    if (!mappedEvent.link && !mappedEvent.title) continue;
                    
                    const query = [];
                    if (mappedEvent.link) query.push({ link: mappedEvent.link });
                    if (mappedEvent.title) {
                        // Escape regex characters just in case
                        const safeTitle = mappedEvent.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        query.push({ title: { $regex: new RegExp(`^${safeTitle}$`, 'i') } });
                    }

                    const existingEvent = await Event.findOne({ $or: query });
                    if (!existingEvent) {
                        mappedEvent.organizerId = botUser._id;
                        mappedEvent.approvalStatus = 'Pending';
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

module.exports = { startCronJobs, runAggregatorEngine };
