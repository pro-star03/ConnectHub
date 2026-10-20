require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');

const USERS_DATA = [
  {
    letter: 'A',
    name: 'Aarav Sharma',
    username: 'aarav_sharma',
    email: 'aarav_sharma@example.com',
    headline: 'Senior Full-Stack Engineer | Tech Writer 💻',
    bio: 'Building scalable distributed apps in Bangalore. Chai connoisseur ☕. Weekend hiker exploring Western Ghats trails 🏔️.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Refactored our core message broker from a monolith into lightweight event-driven microservices. Latency dropped by 42% and peak CPU dropped significantly. Sometimes simplicity in system design is the ultimate optimization. #systemdesign #devlife #backend',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80',
        tags: ['systemdesign', 'devlife', 'backend'],
        daysAgo: 1
      },
      {
        content: 'Sunrise above the mist in Kudremukh. Nothing recharges the mind after a week of intense debugging quite like the Western Ghats. 🍃 #hiking #nature #karnataka',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
        tags: ['hiking', 'nature', 'karnataka'],
        daysAgo: 4
      },
      {
        content: 'Chai break question for the engineering community: What is your primary tool for API documentation and testing in 2026? Drop your thoughts below! #developers #apis',
        tags: ['developers', 'apis'],
        poll: {
          question: 'What is your primary API testing tool?',
          options: [{ text: 'Postman' }, { text: 'Bruno' }, { text: 'Hoppscotch' }, { text: 'Custom CLI' }]
        },
        daysAgo: 8
      }
    ]
  },
  {
    letter: 'B',
    name: 'Bharat Deshmukh',
    username: 'bharat_d',
    email: 'bharat_d@example.com',
    headline: 'Product Designer & Design Systems Lead 🎨',
    bio: 'Designing intentional micro-interactions & accessible design systems. Believer in warm, human-centered UI. Mumbai 📍',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'A good interface doesn’t shout for attention—it quietly assists. We just rolled out the new warm Beige & Taupe aesthetic on ConnectHub. The softer contrast reduces eye strain during late night reading significantly. What do you think? #designsystems #uidesign #minimalism',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80',
        tags: ['designsystems', 'uidesign', 'minimalism'],
        daysAgo: 2
      },
      {
        content: 'Sunday morning sketches over filter coffee in Bandra. Always starting concepts on physical paper before touching Figma. #sketchbook #creative #mumbai',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80',
        tags: ['sketchbook', 'creative', 'mumbai'],
        daysAgo: 6
      },
      {
        content: 'Typography tip: Never underestimate the emotional weight of letter-spacing and line-height. Small adjustments turn an ordinary layout into pure elegance. #typography #craft',
        tags: ['typography', 'craft'],
        daysAgo: 10
      }
    ]
  },
  {
    letter: 'C',
    name: 'Chetan Joshi',
    username: 'chetan_joshi',
    email: 'chetan_joshi@example.com',
    headline: 'Cloud Infrastructure Architect & Tech Speaker ☁️',
    bio: 'Kubernetes, Go & distributed systems. Community mentor. Early morning cyclist across Pune hills 🚴‍♂️.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Automated our zero-downtime cluster upgrades today. When infrastructure is truly treated as code, rolling updates feel like clockwork rather than high-stress fire drills. #kubernetes #devops #cloud',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
        tags: ['kubernetes', 'devops', 'cloud'],
        daysAgo: 3
      },
      {
        content: '45km ride around Khadakwasla before the heat kicked in. Cycling gives you the best perspective on difficult architecture problems. #cycling #pune #fitness',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1000&auto=format&fit=crop&q=80',
        tags: ['cycling', 'pune', 'fitness'],
        daysAgo: 7
      },
      {
        content: 'Curious about everyone’s disaster recovery testing frequency. How often does your team simulate an AZ or region outage? #reliability #infra',
        poll: {
          question: 'How often do you run DR drills?',
          options: [{ text: 'Every Quarter' }, { text: 'Twice a Year' }, { text: 'Annually' }, { text: 'Never / Ad-hoc' }]
        },
        tags: ['reliability', 'infra'],
        daysAgo: 11
      }
    ]
  },
  {
    letter: 'D',
    name: 'Diya Verma',
    username: 'diya_verma',
    email: 'diya_verma@example.com',
    headline: 'Visual Storyteller & Travel Documentarian 📸',
    bio: 'Chasing golden hour across India 🌅. Documenting heritage crafts, architectural ruins, and local cultures. Delhi ✈️',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Morning light slicing through the jharokhas of Hawa Mahal, Jaipur. The geometric precision and sandstone hues never fail to inspire awe. #jaipur #architecture #rajasthan #travel',
        image: 'https://images.unsplash.com/photo-1609137144822-4a004eb759b4?w=1000&auto=format&fit=crop&q=80',
        tags: ['jaipur', 'architecture', 'rajasthan', 'travel'],
        daysAgo: 1
      },
      {
        content: 'Street portraits from Old Delhi during sunrise. The chai vendors, the fresh marigold garlands, and the quiet before the city roars to life. #delhi #streetphotography #india',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1000&auto=format&fit=crop&q=80',
        tags: ['delhi', 'streetphotography', 'india'],
        daysAgo: 5
      },
      {
        content: 'Remember that travel isn’t always about distant bucket list destinations. Sometimes the most captivating stories are hidden in forgotten alleyways right in your hometown. #storytelling #mindful',
        tags: ['storytelling', 'mindful'],
        daysAgo: 9
      }
    ]
  },
  {
    letter: 'E',
    name: 'Esha Gupta',
    username: 'esha_gupta',
    email: 'esha_gupta@example.com',
    headline: 'Climate Tech Founder 🌱 | Circular Economy Advocate',
    bio: 'Building sustainable supply chains with Indian farmers. Passionate about green tech, zero-waste living & vintage books 📚.',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Visited our pilot regenerative farming cluster in Madhya Pradesh today. Organic soil carbon levels are up 18% in just two seasons. Technology and ancient ecological wisdom can work hand in hand. #sustainability #climate #agriculture',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80',
        tags: ['sustainability', 'climate', 'agriculture'],
        daysAgo: 2
      },
      {
        content: 'Sunday reading corner with warm lemongrass tea. Highly recommend reading "Braiding Sweetgrass" if you haven’t yet. A masterclass in ecological humility. #books #reading #greenlife',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1000&auto=format&fit=crop&q=80',
        tags: ['books', 'reading', 'greenlife'],
        daysAgo: 6
      },
      {
        content: 'Every small conscious choice counts. What is one habit you changed this year to reduce single-use plastic? Would love to learn from your experiences! #zerowaste #mindfulliving',
        tags: ['zerowaste', 'mindfulliving'],
        daysAgo: 11
      }
    ]
  },
  {
    letter: 'F',
    name: 'Farhan Khan',
    username: 'farhan_k',
    email: 'farhan_k@example.com',
    headline: 'AI/ML Researcher & Neural Network Tinkerer 🤖',
    bio: 'Working on multimodal reasoning and small localized language models. Hyderabad Biryani connoisseur 🍲. Rapid chess player ♟️.',
    profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Benchmarking quantization on 7B parameter models for edge devices. Running inference smoothly at 35 tokens/sec locally on consumer hardware was science fiction just 3 years ago. #artificialintelligence #machinelearning #opensource',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
        tags: ['artificialintelligence', 'machinelearning', 'opensource'],
        daysAgo: 2
      },
      {
        content: 'Late night chess match over rooftop views in Banjara Hills. Tactics win games, but positional understanding builds foundations—true in software architecture as well. #chess #hyderabad #reflections',
        image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1000&auto=format&fit=crop&q=80',
        tags: ['chess', 'hyderabad', 'reflections'],
        daysAgo: 5
      },
      {
        content: 'The most underrated skill in the era of AI coding copilots is prompt clarity and code review discipline. What used to be writing code is now becoming system validation. #coding #futureofwork',
        tags: ['coding', 'futureofwork'],
        daysAgo: 12
      }
    ]
  },
  {
    letter: 'G',
    name: 'Gaurav Kulkarni',
    username: 'gaurav_k',
    email: 'gaurav_k@example.com',
    headline: 'Fintech Product Manager 📊',
    bio: 'Simplifying digital payments and credit delivery for Bharat. Marathon runner 🏃‍♂️. Pune | Coffee & numbers.',
    profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'India recorded over 16 billion UPI transactions last month. The sheer resilience of the NPCI infrastructure handling this scale with sub-second response times is unmatched worldwide. #fintech #upi #digitalindia',
        image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1000&auto=format&fit=crop&q=80',
        tags: ['fintech', 'upi', 'digitalindia'],
        daysAgo: 3
      },
      {
        content: 'Completed an early morning 21k half marathon training run. Discipline in endurance running translates directly into endurance in product building. #running #pune #marathon',
        image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1000&auto=format&fit=crop&q=80',
        tags: ['running', 'pune', 'marathon'],
        daysAgo: 7
      },
      {
        content: 'When designing onboarding flows: Every unnecessary input field decreases user conversion by at least 7%. Strip away the friction ruthlessly. #productmanagement #growth',
        tags: ['productmanagement', 'growth'],
        daysAgo: 11
      }
    ]
  },
  {
    letter: 'H',
    name: 'Harsh Verma',
    username: 'harsh_verma',
    email: 'harsh_verma@example.com',
    headline: 'Mobile Engineer (Swift & React Native) 📱',
    bio: 'Crafting 60fps mobile interfaces with pixel precision. Coffee lover ☕. Minimalist desktop setups enthusiast. Bengaluru.',
    profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Clean desk setup for a Saturday coding sprint. Natural wood tones, warm ambient light, mechanical keyboard with silent tactile switches. Minimal distractions = maximum flow state. #desksetup #workspace #minimalism',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
        tags: ['desksetup', 'workspace', 'minimalism'],
        daysAgo: 1
      },
      {
        content: 'Experimenting with fluid physics-based gestures on mobile. Static button taps feel so dated once you experience gesture-driven navigation with haptic micro-feedback. #mobiledev #uxdesign #ios',
        tags: ['mobiledev', 'uxdesign', 'ios'],
        daysAgo: 4
      },
      {
        content: 'Quick poll for mobile developers: What is your preferred mobile state management solution today?',
        poll: {
          question: 'Preferred Mobile State Management?',
          options: [{ text: 'Zustand / Redux' }, { text: 'Riverpod / Bloc' }, { text: 'SwiftUI State' }, { text: 'MobX' }]
        },
        tags: ['mobiledev', 'reactnative', 'flutter'],
        daysAgo: 8
      }
    ]
  },
  {
    letter: 'I',
    name: 'Isha Mehta',
    username: 'isha_mehta',
    email: 'isha_mehta@example.com',
    headline: 'Creative Director & Editorial Brand Strategist ✨',
    bio: 'Helping lifestyle & design brands cultivate distinct visual identities. Museum regular, vintage architecture fan. Mumbai 📍',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Editorial moodboard session for our upcoming autumn campaign. Warm beige, rich espresso taupe, tactile linens and unglazed ceramics. Earthy minimalism is timeless. #aesthetic #branding #design #creative',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
        tags: ['aesthetic', 'branding', 'design', 'creative'],
        daysAgo: 2
      },
      {
        content: 'The Art Deco heritage buildings of Marine Drive in Mumbai during sunset. A quiet reminder that great architecture outlasts all ephemeral trends. #mumbai #heritage #artdeco',
        image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1000&auto=format&fit=crop&q=80',
        tags: ['mumbai', 'heritage', 'artdeco'],
        daysAgo: 6
      },
      {
        content: 'The most enduring brands don’t sell utility alone—they curate an atmosphere of belonging. Treat your community like guests in your home. #brandstrategy #marketing',
        tags: ['brandstrategy', 'marketing'],
        daysAgo: 10
      }
    ]
  },
  {
    letter: 'J',
    name: 'Jay Desai',
    username: 'jay_desai',
    email: 'jay_desai@example.com',
    headline: 'Security Researcher & DevSecOps Specialist 🛡️',
    bio: 'Hardening cloud architectures and automating compliance pipelines. CTF enthusiast. Coffee & network packet analysis. Ahmedabad.',
    profilePicture: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Friendly reminder to all development teams: Rotate your staging API secrets regularly and enforce strict token scopes. 80% of preventable breaches originate from overprivileged test credentials. #infosec #cybersecurity #devsecops',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
        tags: ['infosec', 'cybersecurity', 'devsecops'],
        daysAgo: 3
      },
      {
        content: 'Weekend CTF competition solved! Reverse engineering obfuscated binaries reminds me why I fell in love with computer science in the first place. #ctf #hacking #infosec',
        tags: ['ctf', 'hacking', 'infosec'],
        daysAgo: 7
      },
      {
        content: 'Zero trust is not a single product you buy—it is a continuous security philosophy that assumes breach and validates every single request. #security #techinsights',
        tags: ['security', 'techinsights'],
        daysAgo: 13
      }
    ]
  },
  {
    letter: 'K',
    name: 'Kunal Shah',
    username: 'kunal_shah',
    email: 'kunal_shah@example.com',
    headline: 'Angel Investor & Venture Partner 🚀',
    bio: 'Backing ambitious founders building category-defining companies from India. Mumbai & Bangalore | Curiosity & mental models.',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'The most exceptional founders don’t seek external validation; they cultivate obsessive customer empathy. When you solve a real, acute problem, the market finds you. #startups #venture #founders',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
        tags: ['startups', 'venture', 'founders'],
        daysAgo: 1
      },
      {
        content: 'Deep conversation over coffee in Indiranagar about the next decade of Indian SaaS. The compounding effect of India’s engineering depth is just getting started. #bangalore #saas #india',
        tags: ['bangalore', 'saas', 'india'],
        daysAgo: 5
      },
      {
        content: 'Productivity observation: High performers don’t have more time. They have ruthless elimination filters for low-leverage obligations. Protect your calendar like your bank account. #mindset #leadership',
        tags: ['mindset', 'leadership'],
        daysAgo: 9
      }
    ]
  },
  {
    letter: 'L',
    name: 'Lakshya Nair',
    username: 'lakshya_nair',
    email: 'lakshya_nair@example.com',
    headline: 'Wildlife Naturalist & Ecology Educator 🌿',
    bio: 'Documenting the biodiversity of the Western Ghats. Birdwatcher, rainforest wanderer. Kerala 📍',
    profilePicture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Encountered a Malabar Gliding Frog in the rainforest canopy of Wayanad. The monsoon transforms these ancient hills into a living symphony of life. #wildlife #kerala #biodiversity #nature',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
        tags: ['wildlife', 'kerala', 'biodiversity', 'nature'],
        daysAgo: 2
      },
      {
        content: 'Dawn birdwatching walk rewarded us with sightings of the elusive Malabar Pied Hornbill. Patience is the greatest virtue in the forest. #birding #naturephotography #wildlife',
        image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1000&auto=format&fit=crop&q=80',
        tags: ['birding', 'naturephotography', 'wildlife'],
        daysAgo: 6
      },
      {
        content: 'True conservation starts with curiosity in your own neighborhood. You don’t need to enter a national park to appreciate urban ecology. #ecology #education',
        tags: ['ecology', 'education'],
        daysAgo: 10
      }
    ]
  },
  {
    letter: 'M',
    name: 'Mansi Kulkarni',
    username: 'mansi_kulkarni',
    email: 'mansi_kulkarni@example.com',
    headline: 'Frontend Architect & CSS Aficionado 💻',
    bio: 'Crafting performant web experiences, CSS animations, and modular component architectures. Amateur potter 🏺. Pune.',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Loving the CSS color-mix() and modern CSS subgrid features. We can now build sophisticated responsive grid layouts without nesting extra wrapper divs or relying on heavy runtime JavaScript. #css #frontend #webdev',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
        tags: ['css', 'frontend', 'webdev'],
        daysAgo: 1
      },
      {
        content: 'Spent my Sunday morning on the potter’s wheel shaping terracotta mugs. Clay reminds you of the tactile friction that digital software often abstracts away. #pottery #ceramics #craft',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=80',
        tags: ['pottery', 'ceramics', 'craft'],
        daysAgo: 4
      },
      {
        content: 'Never sacrifice keyboard accessibility for aesthetic flair. The best modern web designs are effortlessly accessible to everyone by default. #a11y #webstandards',
        tags: ['a11y', 'webstandards'],
        daysAgo: 9
      }
    ]
  },
  {
    letter: 'N',
    name: 'Neha Shah',
    username: 'neha_shah',
    email: 'neha_shah@example.com',
    headline: 'Lead Data Scientist & Analytics Strategist 📈',
    bio: 'Transforming complex data telemetry into actionable product clarity. Python, Bayesian models, and classical literature. Mumbai.',
    profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Data intuition without domain context is dangerous, but domain context without rigorous statistical hygiene is reckless. The magic happens right at the intersection. #datascience #analytics #metrics',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
        tags: ['datascience', 'analytics', 'metrics'],
        daysAgo: 3
      },
      {
        content: 'Evening walk along Marine Drive after finishing an intense sprint on churn prediction models. The sea breeze never fails to reset mental bandwidth. #mumbai #lifestyle #evening',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1000&auto=format&fit=crop&q=80',
        tags: ['mumbai', 'lifestyle', 'evening'],
        daysAgo: 7
      },
      {
        content: 'Which visualization library do you find yourself reaching for most often in Python?',
        poll: {
          question: 'Go-to Python viz tool?',
          options: [{ text: 'Plotly' }, { text: 'Seaborn' }, { text: 'Matplotlib' }, { text: 'Altair' }]
        },
        tags: ['python', 'datascience'],
        daysAgo: 12
      }
    ]
  },
  {
    letter: 'O',
    name: 'Omkar Jadhav',
    username: 'omkar_jadhav',
    email: 'omkar_jadhav@example.com',
    headline: 'Aerospace Systems Engineer & Astrophotographer 🌌',
    bio: 'Satellite telemetry, embedded avionics, and deep space imaging. Night sky wanderer. Pune | Dreaming among stars 🚀.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Captured the core of the Milky Way galaxy over the dark skies of Spiti Valley. When you gaze into the cosmos, all daily trivialities melt away into cosmic gratitude. #astrophotography #milkyway #spiti #space',
        image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80',
        tags: ['astrophotography', 'milkyway', 'spiti', 'space'],
        daysAgo: 2
      },
      {
        content: 'Simulating thermal dissipation models for satellite payloads in orbit. In the vacuum of space, radiation is your only heat transfer ally. Physics is humbling. #aerospace #engineering #space',
        tags: ['aerospace', 'engineering', 'space'],
        daysAgo: 6
      },
      {
        content: 'Looking forward to India’s upcoming deep space exploration missions. The next decade belongs to space exploration and global scientific collaboration. #isro #spacetech',
        tags: ['isro', 'spacetech'],
        daysAgo: 11
      }
    ]
  },
  {
    letter: 'P',
    name: 'Pooja Jadhav',
    username: 'pooja_jadhav',
    email: 'pooja_jadhav@example.com',
    headline: 'Chartered Wealth Consultant & Financial Literacy Mentor 💰',
    bio: 'Demystifying personal investing, index compounding, and financial independence for young Indians. Kolkata | Chai & spreadsheets.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'The most powerful financial habit isn’t chasing speculative crypto or hot stock tips—it is automating boring, consistent index fund contributions every single month. Time in the market always trumps timing the market. #finance #investing #wealth',
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
        tags: ['finance', 'investing', 'wealth'],
        daysAgo: 1
      },
      {
        content: 'Afternoon coffee overlooking the Victoria Memorial in Kolkata. Slow weekends are the best way to reflect on quarterly personal goals. #kolkata #weekend #mindfulness',
        image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1000&auto=format&fit=crop&q=80',
        tags: ['kolkata', 'weekend', 'mindfulness'],
        daysAgo: 5
      },
      {
        content: 'Quick question: At what age did you make your very first investment in mutual funds or stocks? #financialfreedom #habits',
        tags: ['financialfreedom', 'habits'],
        daysAgo: 10
      }
    ]
  },
  {
    letter: 'Q',
    name: 'Qasim Ali',
    username: 'qasim_ali',
    email: 'qasim_ali@example.com',
    headline: 'Heritage Architect & Urban Conservationist 🏛️',
    bio: 'Restoring historical monuments & vernacular stone architecture. Urdu calligraphy enthusiast ✍️. Lucknow 📍',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Documenting the lime-plaster intricate relief work at the Rumi Darwaza in Lucknow. The lime mortar breathes with the seasons, preserving the structural integrity for centuries without chemical sealants. #architecture #lucknow #heritage',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000&auto=format&fit=crop&q=80',
        tags: ['architecture', 'lucknow', 'heritage'],
        daysAgo: 2
      },
      {
        content: 'Late night calligraphy practice with traditional reed pens (Qalam) and handmade paper. The rhythm of ink on fibrous texture is pure meditation. #calligraphy #art #tradition',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80',
        tags: ['calligraphy', 'art', 'tradition'],
        daysAgo: 6
      },
      {
        content: 'Modern urban design must incorporate vernacular shading and airflow principles instead of relying on power-hungry HVAC systems. Ancient builders knew how to keep homes cool. #sustainablearchitecture #urbandesign',
        tags: ['sustainablearchitecture', 'urbandesign'],
        daysAgo: 12
      }
    ]
  },
  {
    letter: 'R',
    name: 'Rohan Deshmukh',
    username: 'rohan_desh',
    email: 'rohan_desh@example.com',
    headline: 'EV Powertrain Engineer & Automotive Techie ⚡',
    bio: 'Working on electric vehicle battery management systems and thermal cooling. Formula 1 fan. Nashik 🏎️.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Dyno testing our new 400V inverter prototype today. Instant torque curve delivered without thermal throttling even under sustained peak loads. The future of Indian mobility is undeniably electric. #ev #electricvehicles #engineering #automotive',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&auto=format&fit=crop&q=80',
        tags: ['ev', 'electricvehicles', 'engineering', 'automotive'],
        daysAgo: 1
      },
      {
        content: 'Weekend drive through the vineyard country of Nashik. Crisp autumn breeze and empty winding roads. Perfect recipe for mental clarity. #nashik #roadtrip #weekend',
        image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=1000&auto=format&fit=crop&q=80',
        tags: ['nashik', 'roadtrip', 'weekend'],
        daysAgo: 4
      },
      {
        content: 'Are you planning your next personal vehicle purchase to be fully electric or hybrid?',
        poll: {
          question: 'Your next vehicle choice?',
          options: [{ text: 'Pure Electric (EV)' }, { text: 'Hybrid (PHEV)' }, { text: 'Internal Combustion (Petrol/Diesel)' }]
        },
        tags: ['mobility', 'ev'],
        daysAgo: 8
      }
    ]
  },
  {
    letter: 'S',
    name: 'Sneha Kulkarni',
    username: 'sneha_kulkarni',
    email: 'sneha_kulkarni@example.com',
    headline: 'Culinary Artist & Regional Food Historian 🍜',
    bio: 'Reviving ancient Indian grains, heirloom millets, and slow fermentation techniques. Bangalore | Golden milk & sourdough 🍞.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Fresh batch of ragi sourdough loaves out of the oven. Blending finger millet with wild sourdough culture yields a nutty, caramelized crust that pairs heavenly with desi ghee. #sourdough #baking #indianfood #fermentation',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80',
        tags: ['sourdough', 'baking', 'indianfood', 'fermentation'],
        daysAgo: 2
      },
      {
        content: 'Exploring the heritage spice markets of Old Bangalore. Cardamom from Idukki, Tellicherry black peppercorns, and freshly ground turmeric. Scent is memory’s most faithful keeper. #spices #bangalore #foodheritage',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1000&auto=format&fit=crop&q=80',
        tags: ['spices', 'bangalore', 'foodheritage'],
        daysAgo: 5
      },
      {
        content: 'Cooking slowly with whole seasonal ingredients isn’t just culinary art—it is an act of mindfulness in a hyper-accelerated world. What is your comfort meal after a long week? #slowfood #mindfuleating',
        tags: ['slowfood', 'mindfuleating'],
        daysAgo: 9
      }
    ]
  },
  {
    letter: 'T',
    name: 'Tanvi Gupta',
    username: 'tanvi_gupta',
    email: 'tanvi_gupta@example.com',
    headline: 'People Culture & Executive Coach 🤝',
    bio: 'Fostering psychological safety, empathetic leadership, and sustainable team cultures in tech startups. Mental health advocate 🌸.',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Burnout rarely happens because people work too hard on things they believe in. It happens because people work on things with unclear expectations, absent psychological safety, and zero autonomy. Cultivate trust first. #leadership #culture #startups',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=80',
        tags: ['leadership', 'culture', 'startups'],
        daysAgo: 1
      },
      {
        content: 'Morning journaling routine with warm chamomile tea. Writing 3 things you are grateful for rewires neural pathways towards resilience over time. #wellness #journaling #mindfulness',
        image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1000&auto=format&fit=crop&q=80',
        tags: ['wellness', 'journaling', 'mindfulness'],
        daysAgo: 5
      },
      {
        content: 'How often does your organization conduct transparent retrospective check-ins on team wellbeing?',
        poll: {
          question: 'How often do you discuss team wellbeing?',
          options: [{ text: 'Weekly' }, { text: 'Monthly' }, { text: 'Quarterly' }, { text: 'Never / Rare' }]
        },
        tags: ['teamculture', 'workplacewellness'],
        daysAgo: 8
      }
    ]
  },
  {
    letter: 'U',
    name: 'Uday Sharma',
    username: 'uday_sharma',
    email: 'uday_sharma@example.com',
    headline: 'Robotics Engineer & IoT Maker 🛠️',
    bio: 'Designing agricultural automation drones and embedded sensor nodes. Hardware prototyping enthusiast. Jaipur 📍',
    profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Field testing our autonomous crop monitoring drone over mustard farms in Rajasthan. Multispectral camera payload mapping moisture stress in real-time. Hardware engineering when it meets real soil is pure joy. #robotics #drones #hardware #agritech',
        image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1000&auto=format&fit=crop&q=80',
        tags: ['robotics', 'drones', 'hardware', 'agritech'],
        daysAgo: 2
      },
      {
        content: 'Fresh custom PCBs arrived from fabrication today! That clean solder mask smell and crisp silk-screening never gets old for a hardware hacker. #pcb #maker #embedded',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
        tags: ['pcb', 'maker', 'embedded'],
        daysAgo: 6
      },
      {
        content: 'Soldering tip: Use quality flux and calibrate your iron temperature to the lead-free alloy spec. 90% of bridge issues disappear immediately. #maker #prototyping',
        tags: ['maker', 'prototyping'],
        daysAgo: 11
      }
    ]
  },
  {
    letter: 'V',
    name: 'Vivek Mishra',
    username: 'vivek_mishra',
    email: 'vivek_mishra@example.com',
    headline: 'Principal Backend Architect (Go / Rust / Kafka) ⚡',
    bio: 'Designing ultra high-throughput transactional engines. Varanasi roots, Bengaluru life 🏙️. Chess & classical sitar music.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Achieved 120,000 queries per second with sub-5ms p99 latency by replacing reflection-heavy serialization with zero-copy binary protocols in Go. Always measure before premature optimization, but optimize fearlessly when bottlenecks are clear. #golang #backend #performancetuning',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
        tags: ['golang', 'backend', 'performancetuning'],
        daysAgo: 1
      },
      {
        content: 'Evening boat ride along the Ghats of Varanasi. The bells of Ganga Aarti echoing across the ancient river bank. There is an eternal calm here that words cannot capture. #varanasi #heritage #peace',
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1000&auto=format&fit=crop&q=80',
        tags: ['varanasi', 'heritage', 'peace'],
        daysAgo: 5
      },
      {
        content: 'Code readability is the ultimate feature. The code you write today will be read dozens of times by teammates under stress at 2 AM. Be kind to future maintainers. #cleancode #engineering',
        tags: ['cleancode', 'engineering'],
        daysAgo: 9
      }
    ]
  },
  {
    letter: 'W',
    name: 'Wahid Shaikh',
    username: 'wahid_shaikh',
    email: 'wahid_shaikh@example.com',
    headline: 'Independent Documentary Filmmaker & Photojournalist 🎥',
    bio: 'Capturing stories of artisan communities and grassroots innovation across India. Leica shooter 📷. Film lover.',
    profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Filming a documentary on 5th generation copper utensil beaters in Kashmir. Every hammer stroke carries centuries of muscle memory and cultural continuity. #filmmaking #kashmir #crafts #documentary',
        image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1000&auto=format&fit=crop&q=80',
        tags: ['filmmaking', 'kashmir', 'crafts', 'documentary'],
        daysAgo: 2
      },
      {
        content: 'Editing timeline at 1 AM. Sound design is 70% of cinema. The subtle whisper of wind through chinar leaves conveys more emotion than dialogue ever could. #editing #sounddesign #cinema',
        tags: ['editing', 'sounddesign', 'cinema'],
        daysAgo: 6
      },
      {
        content: 'Great documentary photography isn’t about being an invisible observer—it’s about establishing genuine mutual respect with the people who invite you into their lives. #storytelling #journalism',
        tags: ['storytelling', 'journalism'],
        daysAgo: 10
      }
    ]
  },
  {
    letter: 'X',
    name: 'Xavier Dsouza',
    username: 'xavier_dsouza',
    email: 'xavier_dsouza@example.com',
    headline: 'Craft Mixologist & Sustainable Hospitality Director 🍸',
    bio: 'Infusing indigenous wild herbs & local botanicals into zero-waste culinary beverages. Vinyl collector. Goa 🏖️.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Created our signature coastal spritz using kokum fruit reduction, clarified coconut water, and wild rosemary forage from our backyard garden in Assagao. Fresh, tart, and deeply rooted in local terroir. #mixology #goa #cocktails #hospitality',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1000&auto=format&fit=crop&q=80',
        tags: ['mixology', 'goa', 'cocktails', 'hospitality'],
        daysAgo: 1
      },
      {
        content: 'Sunset over Anjuna beach with vintage bossa nova playing in the background. Goa in the golden hour reminds you why slowing down is a life skill. #goa #sunset #beachvibes',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&auto=format&fit=crop&q=80',
        tags: ['goa', 'sunset', 'beachvibes'],
        daysAgo: 4
      },
      {
        content: 'Zero waste in hospitality starts with prep mindfulness: Citrus peels become oleo saccharum, discarded fruit pulp becomes fruit leather garnishes. Nothing wasted. #sustainability #zerowaste',
        tags: ['sustainability', 'zerowaste'],
        daysAgo: 8
      }
    ]
  },
  {
    letter: 'Y',
    name: 'Yash Mehta',
    username: 'yash_mehta',
    email: 'yash_mehta@example.com',
    headline: 'D2C Brand Founder & Supply Chain Enthusiast 📦',
    bio: 'Scaling conscious lifestyle goods for the modern Indian consumer. Tech geek, data lover. Ahmedabad 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Milestone reached: We shipped our 50,000th parcel today with 100% plastic-free recycled paper packaging! Proof that consumer businesses can grow rapidly while staying true to environmental principles. #ecommerce #d2c #sustainability #growth',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
        tags: ['ecommerce', 'd2c', 'sustainability', 'growth'],
        daysAgo: 2
      },
      {
        content: 'Visited our textile weaving partners in Kutch today. Watching artisans spin natural organic cotton yarn on traditional looms is humbling. Authentic craftsmanship has a soul machine manufacturing cannot replicate. #kutch #craft #handmade',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
        tags: ['kutch', 'craft', 'handmade'],
        daysAgo: 5
      },
      {
        content: 'Customer retention > Customer acquisition. In 2026, the companies that prioritize post-purchase delight are the ones that survive changing ad algorithm economics. #d2c #business',
        tags: ['d2c', 'business'],
        daysAgo: 10
      }
    ]
  },
  {
    letter: 'Z',
    name: 'Zara Khan',
    username: 'zara_khan',
    email: 'zara_khan@example.com',
    headline: 'Interior Architect & Biophilic Design Consultant 🏡',
    bio: 'Crafting warm, wabi-sabi inspired living spaces infused with natural light and indoor greenery. Hyderabad | Plant parent to 40+ species 🌿.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Completed this quiet sunlit living room renovation in Jubilee Hills. We combined lime-washed warm beige plaster with dark teakwood accents, rattan weave, and potted Ficus lyrata. Spaces should feel like an exhale. #interiordesign #minimalism #biophilic #architecture',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=80',
        tags: ['interiordesign', 'minimalism', 'biophilic', 'architecture'],
        daysAgo: 1
      },
      {
        content: 'Repotting my Monstera Deliciosa and Fiddle Leaf Fig on the balcony. Connecting with soil and green foliage every weekend keeps the mind deeply grounded. #plants #plantparent #greenery',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1000&auto=format&fit=crop&q=80',
        tags: ['plants', 'plantparent', 'greenery'],
        daysAgo: 4
      },
      {
        content: 'Quick design tip: Lighting temperature dictates human circadian rhythms. Use 2700K warm lighting for living and bedroom areas after sunset to promote restorative sleep. #homedecor #wellness',
        tags: ['homedecor', 'wellness'],
        daysAgo: 8
      }
    ]
  }
];

const COMMENT_TEMPLATES = [
  "This is so insightful! Completely agree with your perspective here.",
  "Stunning visual! Where was this taken?",
  "Love the warm aesthetic and thoughtful execution. Great work!",
  "Such an important point that often gets overlooked in our industry.",
  "Brilliant write-up! Thanks for sharing your experience with the community.",
  "Incredible depth and clarity. Bookmarking this to re-read later.",
  "Couldn't agree more with this approach. Simplicity always wins.",
  "This looks absolutely gorgeous! Keep inspiring us.",
  "Spot on! Really appreciate how honest and grounded this reflection is.",
  "Phenomenal work! Proud to be connected and following your journey.",
  "Such an inspiring thought! Adding this to my weekend notes.",
  "Always look forward to your posts on ConnectHub. Great stuff!"
];

const run = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully.');

    const defaultHashedPassword = await bcrypt.hash('password123', 10);

    // 1. Upsert or update all 26 A-Z users
    console.log('Upserting 26 Indian A-Z users with rich profiles...');
    const userMap = new Map();

    for (const userData of USERS_DATA) {
      let user = await User.findOne({ username: userData.username });
      if (!user) {
        user = await User.create({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: defaultHashedPassword,
          headline: userData.headline,
          bio: userData.bio,
          profilePicture: userData.profilePicture,
          coverPhoto: userData.coverPhoto,
          isVerified: userData.isVerified,
          isActive: true,
          themePreference: 'system'
        });
        console.log(`Created new user: ${user.name} (@${user.username})`);
      } else {
        user.name = userData.name;
        user.headline = userData.headline;
        user.bio = userData.bio;
        user.profilePicture = userData.profilePicture;
        user.coverPhoto = userData.coverPhoto;
        user.isVerified = userData.isVerified;
        user.isActive = true;
        await user.save();
        console.log(`Updated user profile: ${user.name} (@${user.username})`);
      }
      userMap.set(userData.username, user);
    }

    const allAZUsers = Array.from(userMap.values());
    console.log(`Loaded ${allAZUsers.length} users into memory.`);

    // 2. Also find other existing accounts (admin/demo) so we can interconnect them
    const otherUsers = await User.find({ username: { $in: ['demo', 'alok_admin', 'professor'] } });

    // 3. Establish mutual follow graph
    console.log('Establishing mutual follow relationships among all 26 users...');
    for (const user of allAZUsers) {
      const otherAZ = allAZUsers.filter(u => u._id.toString() !== user._id.toString());
      // Follow almost all other users (at least 20-25 of the 25 others)
      const usersToFollow = otherAZ.slice(0, 22 + Math.floor(Math.random() * 4));
      
      const followingSet = new Set((user.following || []).map(id => id.toString()));
      for (const target of usersToFollow) {
        followingSet.add(target._id.toString());
      }
      // Also follow admin/demo users
      for (const other of otherUsers) {
        followingSet.add(other._id.toString());
      }
      user.following = Array.from(followingSet);
      await user.save();
    }

    // Now update followers back-references
    for (const user of allAZUsers) {
      const followersSet = new Set((user.followers || []).map(id => id.toString()));
      for (const other of allAZUsers) {
        if (other._id.toString() !== user._id.toString()) {
          if (other.following.some(id => id.toString() === user._id.toString())) {
            followersSet.add(other._id.toString());
          }
        }
      }
      // Add admin/demo as followers too
      for (const other of otherUsers) {
        followersSet.add(other._id.toString());
      }
      user.followers = Array.from(followersSet);
      await user.save();
    }

    // Also update other users (demo, alok_admin) to follow all A-Z users and have them as followers
    for (const other of otherUsers) {
      const fSet = new Set((other.following || []).map(id => id.toString()));
      const folSet = new Set((other.followers || []).map(id => id.toString()));
      for (const u of allAZUsers) {
        fSet.add(u._id.toString());
        folSet.add(u._id.toString());
      }
      other.following = Array.from(fSet);
      other.followers = Array.from(folSet);
      await other.save();
      console.log(`Connected ${other.username} to all 26 Indian users.`);
    }

    // 4. Clean up old generic posts from these 26 users to avoid duplicates
    console.log('Refreshing posts for the 26 Indian users...');
    const userIds = allAZUsers.map(u => u._id);
    const existingPosts = await Post.find({ user: { $in: userIds } });
    if (existingPosts.length > 0) {
      const existingPostIds = existingPosts.map(p => p._id);
      await Comment.deleteMany({ post: { $in: existingPostIds } });
      await Post.deleteMany({ _id: { $in: existingPostIds } });
      console.log(`Cleaned up ${existingPosts.length} older posts.`);
    }

    // 5. Create new rich posts with likes and comments
    let totalPostsCreated = 0;
    let totalCommentsCreated = 0;

    for (const userData of USERS_DATA) {
      const author = userMap.get(userData.username);
      if (!author) continue;

      for (const postItem of userData.posts) {
        const postDate = new Date(Date.now() - (postItem.daysAgo || 1) * 24 * 60 * 60 * 1000 - Math.floor(Math.random() * 3600000));
        
        // Random 8 to 20 likes from other users
        const potentialLikers = allAZUsers.filter(u => u._id.toString() !== author._id.toString());
        const shuffledLikers = [...potentialLikers].sort(() => 0.5 - Math.random());
        const likersCount = 8 + Math.floor(Math.random() * 12);
        const likers = shuffledLikers.slice(0, likersCount);
        const likeIds = likers.map(u => u._id);
        const reactions = likers.map(u => ({ user: u._id, type: 'like' }));

        const newPost = new Post({
          user: author._id,
          content: postItem.content,
          image: postItem.image || '',
          tags: postItem.tags || [],
          likes: likeIds,
          reactions,
          poll: postItem.poll ? {
            question: postItem.poll.question,
            options: postItem.poll.options.map(opt => ({
              text: opt.text,
              votes: likers.slice(0, Math.floor(Math.random() * likers.length)).map(l => l._id)
            }))
          } : undefined,
          comments: [],
          createdAt: postDate,
          updatedAt: postDate
        });

        await newPost.save();
        totalPostsCreated++;

        // Add 2 to 5 comments from other users
        const commenters = shuffledLikers.slice(0, 2 + Math.floor(Math.random() * 4));
        const commentIds = [];

        for (const commenter of commenters) {
          const commentText = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];
          const commentDate = new Date(postDate.getTime() + (10 + Math.floor(Math.random() * 300)) * 60 * 1000);

          const comment = await Comment.create({
            post: newPost._id,
            user: commenter._id,
            text: commentText,
            createdAt: commentDate,
            updatedAt: commentDate
          });
          commentIds.push(comment._id);
          totalCommentsCreated++;
        }

        newPost.comments = commentIds;
        await newPost.save();
      }
    }

    console.log(`\n========================================`);
    console.log(`SUCCESS!`);
    console.log(`- 26 Users from A to Z created/updated.`);
    console.log(`- Connected all 26 users with mutual follows & followers.`);
    console.log(`- Created ${totalPostsCreated} rich, authentic posts (2-3 per user).`);
    console.log(`- Added ${totalCommentsCreated} active comments across posts.`);
    console.log(`- Populated likes and reactions on all posts.`);
    console.log(`========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

run();
