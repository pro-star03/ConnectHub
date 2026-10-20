require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');

// 55 Diverse Indian Users with varied professions, cities, and passions
const NEW_USERS_DATA = [
  {
    name: 'Aryan Kapoor',
    username: 'aryan_kapoor',
    email: 'aryan_kapoor@example.com',
    headline: 'Founding Engineer @ NextGen AI | Open Source Contributor ⚡',
    bio: 'Distributed consensus, GPU kernel optimization, and Rust. Coffee aficionado ☕. Running half marathons across Bangalore.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Migrated our core real-time telemetry processing from Python to Rust. Memory footprint shrank from 14GB to under 900MB. Zero garbage collection pauses in production is pure bliss. #rustlang #performance #engineering',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
        tags: ['rustlang', 'performance', 'engineering'],
        daysAgo: 1
      },
      {
        content: 'Early 10k run around Cubbon Park before the city woke up. Crisp morning air, eucalyptus scent, and empty pathways. The best mental reset. #bangalore #running #fitness',
        image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1000&auto=format&fit=crop&q=80',
        tags: ['bangalore', 'running', 'fitness'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Ananya Sen',
    username: 'ananya_sen',
    email: 'ananya_sen@example.com',
    headline: 'Ceramic Sculptor & Studio Potter 🏺',
    bio: 'Handcrafting slow, unglazed stoneware and functional ceramics. Kolkata roots, Bangalore studio | Clay & jazz 🎶.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Opening the kiln after an 18-hour wood firing is always magical. The natural wood ash deposited this stunning amber-olive glaze across the terracotta rims. #pottery #ceramics #craft #slowliving',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=80',
        tags: ['pottery', 'ceramics', 'craft', 'slowliving'],
        daysAgo: 2
      },
      {
        content: 'There is something deeply grounding about working with raw earth. In a digital world where everything is undoable with Cmd+Z, clay demands patience and total presence. #mindfulness #handmade',
        tags: ['mindfulness', 'handmade'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Kabir Nair',
    username: 'kabir_nair',
    email: 'kabir_nair@example.com',
    headline: 'Marine Biologist & Scuba Instructor 🌊',
    bio: 'Documenting coral reef restoration in the Andaman & Lakshadweep islands. Underwater filmmaker & ocean advocate. Kochi 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Witnessed coral spawning at night in Havelock Island. Millions of glowing gametes released into the dark sea under the full moon. Nature’s most breathtaking underwater phenomenon. #marinebiology #andaman #oceanconservation',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&auto=format&fit=crop&q=80',
        tags: ['marinebiology', 'andaman', 'oceanconservation'],
        daysAgo: 3
      },
      {
        content: 'Friendly ocean reminder: Choose reef-safe sunscreen free of oxybenzone whenever you step into the sea. Small conscious acts protect ancient marine ecosystems. #oceanlove #sustainability',
        tags: ['oceanlove', 'sustainability'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Meenakshi Sundaram',
    username: 'meenakshi_s',
    email: 'meenakshi_s@example.com',
    headline: 'Bharatanatyam Dancer & Cultural Choreographer 🌸',
    bio: 'Exploring traditional temple aesthetics through contemporary movement. Sanskrit literature lover. Chennai 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Rehearsal studio at dawn. The resonant chime of the salangai (ghungroo) against polished rosewood floors. Dance is prayer made physical. #bharatanatyam #classicaldance #chennai #art',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
        tags: ['bharatanatyam', 'classicaldance', 'chennai', 'art'],
        daysAgo: 1
      },
      {
        content: 'Fascinating how ancient Natya Shastra treatises detailed micro-facial expressions (Navarasas) thousands of years ago. The depth of Indian aesthetic theory continues to astonish me. #artandculture #history',
        tags: ['artandculture', 'history'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Devansh Singhal',
    username: 'devansh_singhal',
    email: 'devansh_singhal@example.com',
    headline: 'Fintech Backend Engineer & High-Frequency Trader 📈',
    bio: 'Building low-latency order matching engines in C++ & Go. Passionate about market microstructure and quantitative finance. Gurgaon.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Shaved 14 microseconds off our network packet parsing loop by switching to CPU cache-line aligned data structures. In electronic trading, every nanosecond counts. #quant #cpp #fintech #lowlatency',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80',
        tags: ['quant', 'cpp', 'fintech', 'lowlatency'],
        daysAgo: 2
      },
      {
        content: 'Reading "A Man for All Markets" by Ed Thorp again. A timeless reminder that mathematical discipline and risk management will always outperform reckless bravado. #books #investing',
        tags: ['books', 'investing'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Priya Ranganathan',
    username: 'priya_ranga',
    email: 'priya_ranga@example.com',
    headline: 'Pediatric Neurologist & Health Tech Researcher 🩺',
    bio: 'Advocating for early childhood developmental interventions. Carnatic violin student 🎻. Chennai & Oxford.',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Simple developmental tip for young parents: 15 minutes of uninterrupted, eye-to-eye storytelling every evening builds more neural connections than any high-tech sensory toy. Connection is medicine. #parenting #neuroscience #childhealth',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1000&auto=format&fit=crop&q=80',
        tags: ['parenting', 'neuroscience', 'childhealth'],
        daysAgo: 3
      },
      {
        content: 'Evening violin practice with Raga Kalyani. Music and neuroscience are intimately linked—practicing an acoustic instrument engages the entire brain simultaneously. #music #violin #wellness',
        tags: ['music', 'violin', 'wellness'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Tushar Banik',
    username: 'tushar_banik',
    email: 'tushar_banik@example.com',
    headline: 'Specialty Coffee Roaster & Bean Sourcing Specialist ☕',
    bio: 'Working directly with shade-grown estate farmers in Chikmagalur & Coorg. AeroPress champion. Bangalore 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Cupping freshly harvested anaerobic washed Arabica from a 1200m estate in Baba Budangiri today. Prominent notes of dried fig, bergamot, and sweet jaggery finish. Indian specialty coffee is on the global map! #specialtycoffee #chikmagalur #coffee',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1000&auto=format&fit=crop&q=80',
        tags: ['specialtycoffee', 'chikmagalur', 'coffee'],
        daysAgo: 1
      },
      {
        content: 'What is your everyday go-to coffee brewing method?',
        poll: {
          question: 'Favorite everyday brew method?',
          options: [{ text: 'Traditional South Indian Filter' }, { text: 'AeroPress' }, { text: 'V60 Pour Over' }, { text: 'French Press / Cold Brew' }]
        },
        tags: ['coffee', 'poll'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Riddhi Bhattacharya',
    username: 'riddhi_bhatt',
    email: 'riddhi_bhatt@example.com',
    headline: 'Senior UI/UX Researcher & Accessibility Advocate 🎨',
    bio: 'Conducting participatory design research across rural and semi-urban India. Sketcher, chai lover. Kolkata 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Field study insights: When designing apps for first-time internet users in tier-3 towns, voice input and localized iconography outperformed translated text buttons by 300%. Design with empathy, not assumptions. #uxresearch #design #india',
        image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1000&auto=format&fit=crop&q=80',
        tags: ['uxresearch', 'design', 'india'],
        daysAgo: 2
      },
      {
        content: 'Sketching tram routes in North Kolkata over steamed momos. Urban transit systems tell the truest stories of a city’s soul. #kolkata #travel #sketching',
        tags: ['kolkata', 'travel', 'sketching'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Siddharth Rao',
    username: 'siddharth_rao',
    email: 'siddharth_rao@example.com',
    headline: 'Aerospace Propulsion Engineer 🚀',
    bio: 'Solid rocket motor modeling and thermal insulation for small satellite launch vehicles. Hyderabad 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1517976487502-570a2d59ddc6?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Hot fire static test of our composite nozzle thruster went flawless today! 45 seconds of sustained 12kN thrust with zero structural erosion. Kudos to the propulsion team! #aerospace #engineering #spacetech #hyderabad',
        image: 'https://images.unsplash.com/photo-1517976487502-570a2d59ddc6?w=1000&auto=format&fit=crop&q=80',
        tags: ['aerospace', 'engineering', 'spacetech', 'hyderabad'],
        daysAgo: 3
      },
      {
        content: 'The engineering challenges of spaceflight teach you profound humility. When thousands of variables must align with zero margin for error, teamwork and rigorous checklists are everything. #stem #engineering',
        tags: ['stem', 'engineering'],
        daysAgo: 10
      }
    ]
  },
  {
    name: 'Shruti Kadam',
    username: 'shruti_kadam',
    email: 'shruti_kadam@example.com',
    headline: 'Bespoke Textile Designer & Handloom Revivalist 🧵',
    bio: 'Preserving Paithani and Chanderi weaving clusters. Natural plant dyes and ethical luxury. Pune & Mumbai.',
    profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Examining pure mulberry silk dyed with wild madder root and pomegranate rinds. Plant-based natural dyes produce a warm, living tone that synthetic pigments simply cannot match. #handloom #textiles #craft #sustainability',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
        tags: ['handloom', 'textiles', 'craft', 'sustainability'],
        daysAgo: 1
      },
      {
        content: 'A single handwoven saree can take over 600 hours of synchronized pedal work by master weavers. Support Indian artisans who keep our living heritage alive. #makeinindia #artisans',
        tags: ['makeinindia', 'artisans'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Arjun Nambiar',
    username: 'arjun_nambiar',
    email: 'arjun_nambiar@example.com',
    headline: 'Kalaripayattu Practitioner & Sports Physiotherapist 🥋',
    bio: 'Bridging ancient martial movement disciplines with modern kinetic rehabilitation. Kerala & Bangalore.',
    profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Morning training in the traditional mud kalari pit. The animal postures (Vadivu)—lion, elephant, wild boar—develop phenomenal joint stability and rotational power without heavy gym weights. #kalaripayattu #martialarts #fitness #kerala',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000&auto=format&fit=crop&q=80',
        tags: ['kalaripayattu', 'martialarts', 'fitness', 'kerala'],
        daysAgo: 2
      },
      {
        content: 'Desk workers: Spine mobility is longevity. Spend 5 minutes every day doing deep thoracic rotations and hip flexor stretches to combat chronic sitting posture. #mobility #health #physio',
        tags: ['mobility', 'health', 'physio'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Niharika Roy',
    username: 'niharika_roy',
    email: 'niharika_roy@example.com',
    headline: 'Senior Cloud Architect & AWS Community Hero ☁️',
    bio: 'Serverless event streaming, multi-region failover & FinOps optimization. Speaker. Delhi NCR 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Saved $42,000/month on AWS cloud spend for our fintech client simply by eliminating unused NAT Gateways, right-sizing idle RDS read replicas, and adopting Graviton ARM processors. Cloud hygiene pays dividends. #cloud #aws #finops #architecture',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
        tags: ['cloud', 'aws', 'finops', 'architecture'],
        daysAgo: 1
      },
      {
        content: 'Keynote prep done for the upcoming Cloud Expo in Hyderabad! Excited to speak about event-driven architectures with Kafka and Lambda. Who else is attending? #cloudexpo #techspeaker',
        tags: ['cloudexpo', 'techspeaker'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Manish Chawla',
    username: 'manish_chawla',
    email: 'manish_chawla@example.com',
    headline: 'D2C Supply Chain Director & Logistics Strategist 🚚',
    bio: 'Optimizing same-day last-mile fulfillment across 18,000 Indian pin codes. Passionate about warehouse automation. Mumbai.',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Touring our automated micro-fulfillment hub in Bhiwandi. Automated conveyor sorting reduced order dispatch times from 4 hours to just 22 minutes. Precision logistics is fascinating. #logistics #supplychain #ecommerce',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
        tags: ['logistics', 'supplychain', 'ecommerce'],
        daysAgo: 3
      },
      {
        content: 'Managing a supply chain in India teaches you resilience like nothing else. From monsoon road diversions to festive volume spikes, adaptability is your most valuable asset. #operations #leadership',
        tags: ['operations', 'leadership'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Shalini Dixit',
    username: 'shalini_dixit',
    email: 'shalini_dixit@example.com',
    headline: 'Clinical Psychologist & Corporate Wellness Advisor 🧠',
    bio: 'Helping high-growth founders and executives navigate chronic burnout, impostor anxiety, and emotional agility. Mumbai 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Rest is not a reward you earn only after exhaustion—it is a biological prerequisite for cognitive excellence. Normalize shutting your laptop at 7 PM without guilt. #mentalhealth #mindset #burnoutprevention',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
        tags: ['mentalhealth', 'mindset', 'burnoutprevention'],
        daysAgo: 2
      },
      {
        content: 'Next time you experience intense work stress: Take five long physiological sighs (double inhale through nose, long slow exhale through mouth). It rapidly slows your heart rate. #mindfulness #wellness',
        tags: ['mindfulness', 'wellness'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Rahul Pillai',
    username: 'rahul_pillai',
    email: 'rahul_pillai@example.com',
    headline: 'Heritage Architect & Urban Landscape Planner 🌿',
    bio: 'Designing climate-resilient residential campuses that integrate water harvesting ponds and native tree corridors. Kochi & Goa.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Completed this courtyard villa in Alibaug utilizing red laterite stone and reclaimed teak rafters. Natural cross-ventilation keeps indoor temperatures 5°C cooler than the coastal heat outside. #architecture #sustainability #tropicalmodernism',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
        tags: ['architecture', 'sustainability', 'tropicalmodernism'],
        daysAgo: 1
      },
      {
        content: 'Monsoon skies over the backwaters of Kumarakom. Kerala architecture evolved around the rain—deep overhangs, porous verandas, and inner courtyards that celebrate the storm. #kerala #rain #design',
        tags: ['kerala', 'rain', 'design'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Alisha Fernandes',
    username: 'alisha_f',
    email: 'alisha_f@example.com',
    headline: 'Creative Copywriter & Brand Narrative Strategist ✍️',
    bio: 'Crafting thoughtful copy that respects consumer intelligence. Vintage typography, sea swimming, vinyl records. Goa 🏖️.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Good copywriting isn’t about clever puns or flashy adjectives. It’s about stating a profound truth in the simplest, most human words possible. Clarity is the ultimate charisma. #copywriting #branding #writingtips',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80',
        tags: ['copywriting', 'branding', 'writingtips'],
        daysAgo: 2
      },
      {
        content: 'Morning swim at Mandrem beach followed by poi bread and spiced chai. Coastal living permanently rewires your creative clock. #goa #coastalliving #creativity',
        tags: ['goa', 'coastalliving', 'creativity'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Vikramaditya Rathore',
    username: 'vikram_rathore',
    email: 'vikram_rathore@example.com',
    headline: 'Solar Energy Microgrid Developer & Agritech Entrepreneur ☀️',
    bio: 'Deploying decentralized solar irrigation microgrids for remote villages in Rajasthan & Gujarat. Jodhpur 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Commissioned our 50th solar-powered agricultural microgrid near Barmer today! 140 farming families now have reliable irrigation power without relying on erratic diesel generator costs. #cleanenergy #solar #rajasthan #impact',
        image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80',
        tags: ['cleanenergy', 'solar', 'rajasthan', 'impact'],
        daysAgo: 3
      },
      {
        content: 'Sunset over the Thar Desert dunes. The golden hour in Rajasthan makes all the challenges of building field infrastructure worthwhile. #jodhpur #travel #desert',
        tags: ['jodhpur', 'travel', 'desert'],
        daysAgo: 10
      }
    ]
  },
  {
    name: 'Swati Mukherjee',
    username: 'swati_m',
    email: 'swati_m@example.com',
    headline: 'Botanical Illustrator & Flora Researcher 🌿',
    bio: 'Painting endangered medicinal herbs and endemic Himalayan flora. Watercolor & gouache. Shimla & Kolkata.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Finished this botanical watercolor study of the Blue Poppy (Meconopsis) found in the Valley of Flowers at 4,000m altitude. Botanical illustration requires hours of microscopic anatomical observation. #botany #watercolor #himalayas #art',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80',
        tags: ['botany', 'watercolor', 'himalayas', 'art'],
        daysAgo: 1
      },
      {
        content: 'There is something healing about painting with handmade mineral pigments ground from lapis lazuli and ochre earth. Art connects us to geology. #painting #natureart',
        tags: ['painting', 'natureart'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Karthik Subramanian',
    username: 'karthik_subra',
    email: 'karthik_subra@example.com',
    headline: 'Machine Learning Infrastructure & Distributed GPU Systems 💻',
    bio: 'Scaling model training pipelines across hundreds of H100 clusters. Coffee addict, mechanical keyboard enthusiast. Bengaluru.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Debugging InfiniBand interconnect latency across distributed training nodes. 95% of deep learning performance bottlenecks at scale are network I/O, not raw GPU FLOPs. #machinelearning #gpu #infra #engineering',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
        tags: ['machinelearning', 'gpu', 'infra', 'engineering'],
        daysAgo: 2
      },
      {
        content: 'Built a custom 65% mechanical keyboard with lubricated tactile switches and brass plate. Typing feel is pure tactile joy during long terminal sessions. #keyboards #workspacedesign',
        tags: ['keyboards', 'workspacedesign'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Divya Hegde',
    username: 'divya_hegde',
    email: 'divya_hegde@example.com',
    headline: 'Eco-Tourism Founder & Rainforest Conservationist 🌳',
    bio: 'Promoting low-impact sustainable homestays in Agumbe and Coorg. Birding enthusiast & amateur herpetologist. Karnataka.',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Morning mist rolling through the rainforest canopy in Agumbe. This ancient ecosystem receives over 7,000mm of annual rainfall and nurtures hundreds of species found nowhere else on earth. #agumbe #rainforest #ecotourism #nature',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80',
        tags: ['agumbe', 'rainforest', 'ecotourism', 'nature'],
        daysAgo: 1
      },
      {
        content: 'True eco-tourism means leaving a destination better than you found it—employing local community guides, supporting zero plastic, and honoring indigenous knowledge. #sustainabletravel #karnataka',
        tags: ['sustainabletravel', 'karnataka'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Pranav Iyer',
    username: 'pranav_iyer',
    email: 'pranav_iyer@example.com',
    headline: 'Robotics Software Lead & Autonomous Navigation Engineer 🤖',
    bio: 'SLAM algorithms, LiDAR sensor fusion, and ROS2. Building warehouse mobile robots in Pune. Coffee & chess.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Successfully validated dynamic obstacle avoidance with our AMR fleet running 3D LiDAR SLAM. Robots seamlessly navigated crowded aisles with dynamic forklifts and walking personnel without pausing. #robotics #ros #slam #autonomous',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&auto=format&fit=crop&q=80',
        tags: ['robotics', 'ros', 'slam', 'autonomous'],
        daysAgo: 3
      },
      {
        content: 'Robotics is the ultimate multidisciplinary engineering test: mechanical mechanics, electrical power, embedded firmware, algorithms, and real-time safety all intersecting in physical hardware. #stem #engineering',
        tags: ['stem', 'engineering'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Smriti Das',
    username: 'smriti_das',
    email: 'smriti_das@example.com',
    headline: 'Artisan Chocolatier & Single-Origin Cacao Advocate 🍫',
    bio: 'Crafting bean-to-bar dark chocolate from single-estate Indian cacao beans in Idukki. Bangalore | Flavour & sourdough.',
    profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Tempering a fresh micro-batch of 72% Malabar forest dark chocolate. Rich tasting notes of dark cherry, toasted hazelnut, and warm spices with zero artificial emulsifiers. Real chocolate is pure craft. #beantobar #chocolate #artisanal #foodie',
        image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=1000&auto=format&fit=crop&q=80',
        tags: ['beantobar', 'chocolate', 'artisanal', 'foodie'],
        daysAgo: 2
      },
      {
        content: 'Did you know Indian cacao grown under coconut and betel nut canopies in South India has some of the most complex fruity acidity in the global chocolate world? Proud of Indian cacao farmers! #indianfood #agriculture',
        tags: ['indianfood', 'agriculture'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Sameer Kulkarni',
    username: 'sameer_kulkarni',
    email: 'sameer_kulkarni@example.com',
    headline: 'Head of Developer Experience & DevRel Leader 🥑',
    bio: 'Passionate about CLI design, documentation clarity, and developer happiness. Pune & Bangalore | Indie music.',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'The hallmark of world-class Developer Experience (DX) is that developers can go from reading the docs to their first successful API call in under 3 minutes. Reduce time-to-hello-world ruthlessly. #devexperience #devrel #apis #developer',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80',
        tags: ['devexperience', 'devrel', 'apis', 'developer'],
        daysAgo: 1
      },
      {
        content: 'If your CLI error message just says "Error code 1", a developer somewhere just lost 20 minutes of focus. Print the exact cause, line number, and a suggested fix flag. Helpful error messages are pure love. #codingtips #dx',
        tags: ['codingtips', 'dx'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Radhika Menon',
    username: 'radhika_menon',
    email: 'radhika_menon@example.com',
    headline: 'Architectural Photographer & Visual Archivist 🏛️',
    bio: 'Documenting brutalist, modern, and traditional Indian architectural heritage across cities. Hasselblad & Leica. Mumbai & Kochi.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Geometric shadows across the exposed concrete cantilevers of Charles Correa’s Kala Academy in Goa. Brutalism softened by coastal light and palm reflections. #architecturephotography #design #goa #charlescorrea',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
        tags: ['architecturephotography', 'design', 'goa', 'charlescorrea'],
        daysAgo: 2
      },
      {
        content: 'Black and white architectural photography strips away distraction and forces the eye to comprehend volume, rhythm, and structural honesty. #blackandwhite #photography #architecture',
        tags: ['blackandwhite', 'photography', 'architecture'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Aditya Sengupta',
    username: 'aditya_sengupta',
    email: 'aditya_sengupta@example.com',
    headline: 'Full-Stack Web3 & Cryptography Engineer 🔐',
    bio: 'Zero-knowledge proofs, decentralized identity protocols, and verifiable credentials. Kolkata | Film enthusiast & guitarist.',
    profilePicture: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Zero Knowledge proofs are the most transformative privacy breakthrough in computer science. Proving a statement is 100% true without revealing any underlying sensitive data will revolutionize digital identity and medical records. #cryptography #privacy #web3',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80',
        tags: ['cryptography', 'privacy', 'web3'],
        daysAgo: 3
      },
      {
        content: 'Late night acoustic guitar sessions with classic Satyajit Ray film scores. Melodies written half a century ago that still feel deeply contemporary. #kolkata #music #cinema',
        tags: ['kolkata', 'music', 'cinema'],
        daysAgo: 10
      }
    ]
  },
  {
    name: 'Tanya Mittal',
    username: 'tanya_mittal',
    email: 'tanya_mittal@example.com',
    headline: 'D2C Skincare Founder & Formulation Scientist 🌿',
    bio: 'Formulating clean botanical skincare backed by peer-reviewed dermatology. Delhi NCR | Plants, science & clean living.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Lab testing our cold-pressed rosehip and bakuchiol facial serum batch. Testing pH balance and lipid barrier protection stability. Clean beauty should never mean sacrificing rigorous clinical efficacy. #skincare #cleanbeauty #science #d2c',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&auto=format&fit=crop&q=80',
        tags: ['skincare', 'cleanbeauty', 'science', 'd2c'],
        daysAgo: 1
      },
      {
        content: 'Sunscreen reminder: UVA rays penetrate glass and cloud cover all year round. The most effective anti-aging product ever invented is broad-spectrum SPF 50 daily. #skincaretips #wellness',
        tags: ['skincaretips', 'wellness'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Harshad Parikh',
    username: 'harshad_parikh',
    email: 'harshad_parikh@example.com',
    headline: 'Industrial Designer & Consumer Hardware Lead 📐',
    bio: 'Crafting minimalist ergonomic tech peripherals. Aluminum, matte polymers, tactile dials. Ahmedabad 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: '3D printed CNC prototypes of our new wireless mechanical desk dial. The subtle resistance of the damped magnetic rotary encoder feels like adjusting an old Braun Hi-Fi amplifier. Physical feedback matters. #industrialdesign #hardware #minimalism',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80',
        tags: ['industrialdesign', 'hardware', 'minimalism'],
        daysAgo: 2
      },
      {
        content: 'Dieter Rams’ ten principles of good design remain the gold standard: Good design is innovative, useful, aesthetic, understandable, and as little design as possible. #designprinciples #craft',
        tags: ['designprinciples', 'craft'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Payal Goswami',
    username: 'payal_goswami',
    email: 'payal_goswami@example.com',
    headline: 'Wildlife Conservation Geneticist 🐯',
    bio: 'Tracking wild tiger populations through non-invasive DNA scat analysis across Ranthambore & Corbett. Dehradun 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Early morning field tracking in Ranthambore. Fresh pugmarks near the waterhole led our forest team to a majestic 6-year-old tigress resting in the dhok forest shade. India’s Project Tiger is one of conservation’s greatest global triumphs. #wildlife #tigers #india #conservation',
        image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1000&auto=format&fit=crop&q=80',
        tags: ['wildlife', 'tigers', 'india', 'conservation'],
        daysAgo: 1
      },
      {
        content: 'Field genomics allows us to understand wildlife corridor connectivity without capturing or tranquilizing animals. Science in service of wild habitats. #genetics #science',
        tags: ['genetics', 'science'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Varun Chadha',
    username: 'varun_chadha',
    email: 'varun_chadha@example.com',
    headline: 'Fintech Growth Executive & Angel Syndicate Lead 🚀',
    bio: 'Scaling growth engines from $1M to $30M ARR. Marathon runner, podcaster. Gurgaon | Strategy & execution.',
    profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Paid ads acquire customers, but exceptional onboarding builds compounding enterprise value. If your month-3 net dollar retention is under 100%, fixing leaks is 10x more valuable than pumping ad spend. #growth #saas #startups #metrics',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
        tags: ['growth', 'saas', 'startups', 'metrics'],
        daysAgo: 2
      },
      {
        content: 'Weekend cycling loop around Aravali Biodiversity Park. High-intensity cardio clears mental clutter better than any brainstorming meeting. #cycling #gurgaon #fitness',
        tags: ['cycling', 'gurgaon', 'fitness'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Simran Bhatia',
    username: 'simran_bhatia',
    email: 'simran_bhatia@example.com',
    headline: 'Sourdough Baker & Fermentation Enthusiast 🥖',
    bio: 'Artisanal hearth breads, heirloom wheat varieties, and long cold fermentations. Chandigarh & Delhi.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Scored and baked these sesame sourdough batards with 36-hour wild yeast fermentation. That deep blistered crust and open custard-like crumb only happens with patience and proper dough tension. #sourdough #baking #bread #foodie',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80',
        tags: ['sourdough', 'baking', 'bread', 'foodie'],
        daysAgo: 1
      },
      {
        content: 'Flour, water, wild yeasts, and salt. Four humble ingredients that have nourished civilizations for millennia. Baking is equal parts biochemistry and soul. #bakingtips #slowfood',
        tags: ['bakingtips', 'slowfood'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Deepankar Bose',
    username: 'deepankar_bose',
    email: 'deepankar_bose@example.com',
    headline: 'Sound Engineer & Acoustic Consultant 🎧',
    bio: 'Designing recording studios and listening rooms. Vinyl collector, jazz pianist. Kolkata & Mumbai.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Calibrating frequency response in our new mastering suite using tuned bass traps and quadratic residue diffusers. Achieving flat bass decay under 200ms transforms audio clarity completely. #acoustics #soundengineering #musicproduction',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
        tags: ['acoustics', 'soundengineering', 'musicproduction'],
        daysAgo: 3
      },
      {
        content: 'Spinning Miles Davis’ "Kind of Blue" on vinyl on an analog turntable. That analog warmth and tactile needle drop cannot be replicated by compressed streaming algorithms. #vinyl #jazz #audiophile',
        tags: ['vinyl', 'jazz', 'audiophile'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Anwesha Chakraborty',
    username: 'anwesha_c',
    email: 'anwesha_c@example.com',
    headline: 'Senior Brand Identity Designer & Letterer ✍️',
    bio: 'Crafting expressive brand systems and multilingual typography for modern Indian creators. Kolkata | Chai & ink.',
    profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Exploring bilingual Bengali-English logo marks for an independent publishing press. Harmonizing Indic scripts with Latin letterforms requires deep sensitivity to stroke weight and terminal curvature. #typography #branding #graphicdesign',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
        tags: ['typography', 'branding', 'graphicdesign'],
        daysAgo: 1
      },
      {
        content: 'Your portfolio should tell a cohesive story of your thinking process, not just present polished final renders. Clients hire your reasoning, not just your software skills. #designadvice #freelance',
        tags: ['designadvice', 'freelance'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Gaurav Sethi',
    username: 'gaurav_sethi',
    email: 'gaurav_sethi@example.com',
    headline: 'Product Growth & Monetization Lead 📊',
    bio: 'Designing pricing experiments and retention loops. Angel investor. Delhi NCR | Coffee, books & cycling.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Pricing is the most under-leveraged growth lever in software startups. A simple shift from seat-based pricing to value-metric usage pricing unlocked 35% higher average revenue per account for our SaaS client. #pricing #monetization #startuptips',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
        tags: ['pricing', 'monetization', 'startuptips'],
        daysAgo: 2
      },
      {
        content: 'Early morning 50km road ride along the Yamuna Expressway. Nothing sharpens strategic clarity quite like high cadence cycling. #cycling #fitness #morningroutine',
        tags: ['cycling', 'fitness', 'morningroutine'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Nikita Aggarwal',
    username: 'nikita_aggarwal',
    email: 'nikita_aggarwal@example.com',
    headline: 'Specialty Tea Sommelier & Ethical Sourcing Advocate 🍵',
    bio: 'Curating single-origin whole-leaf Darjeeling, Assam, and Nilgiri flushes. Tea travels across the Himalayas. Delhi.',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Tasting the first spring flush from a biodynamic estate in Mirik, Darjeeling. Delicate muscatel aroma, pale amber liquor, notes of white peach and alpine wildflowers. Tea is the poetry of weather captured in leaf. #tea #darjeeling #sommelier #chai',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1000&auto=format&fit=crop&q=80',
        tags: ['tea', 'darjeeling', 'sommelier', 'chai'],
        daysAgo: 1
      },
      {
        content: 'Water temperature matters: Never pour boiling 100°C water directly onto tender green or white tea leaves. 80°C preserves subtle amino acids without scorch or bitterness. #teatips #mindfulliving',
        tags: ['teatips', 'mindfulliving'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Rohan Varma',
    username: 'rohan_varma',
    email: 'rohan_varma@example.com',
    headline: 'Game Developer & Unreal Engine 5 Specialist 🎮',
    bio: 'Building indie action RPGs rooted in Indian mythology and folklore. 3D environment artist. Bengaluru 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Lumen real-time global illumination in Unreal Engine 5 is extraordinary. Sculpting stone temple carvings illuminated by flickering torchlight without any pre-baked lightmaps feels like pure magic. #gamedev #unrealengine #indiedev #3dart',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80',
        tags: ['gamedev', 'unrealengine', 'indiedev', '3dart'],
        daysAgo: 2
      },
      {
        content: 'Indian history and regional folklore hold a treasure trove of untold stories that the global gaming community is eager to explore. Excited for the future of Indian indie game studios. #indiangamedev #gaming',
        tags: ['indiangamedev', 'gaming'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Kritika Chopra',
    username: 'kritika_chopra',
    email: 'kritika_chopra@example.com',
    headline: 'Fashion Stylist & Circular Wardrobe Consultant 👗',
    bio: 'Curating timeless, capsule wardrobes with sustainable Indian independent labels. Mumbai & Delhi.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Editorial fitting for an autumn capsule collection: Handspun khadi trench coats paired with raw linen trousers and brass jewelry. Sustainable fashion should feel effortless, elevated, and deeply wearable. #sustainablefashion #capsulewardrobe #styling',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
        tags: ['sustainablefashion', 'capsulewardrobe', 'styling'],
        daysAgo: 1
      },
      {
        content: 'Before buying any new clothing item, ask yourself: Can I style this in at least 5 different outfits with pieces I already own? If yes, invest. If no, step back. #slowfashion #mindfulliving',
        tags: ['slowfashion', 'mindfulliving'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Akshay Kothari',
    username: 'akshay_kothari',
    email: 'akshay_kothari@example.com',
    headline: 'Deep Learning Engineer & Computer Vision Researcher 👁️',
    bio: 'Real-time object detection and semantic segmentation for autonomous driving. Bengaluru 📍 | Coffee & bouldering.',
    profilePicture: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Trained a real-time vision transformer that runs at 70fps on mobile edge NPUs with less than 2% mAP accuracy trade-off. Bringing high-grade computer vision to affordable devices is how technology creates true impact. #computervision #ai #deeplearning',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
        tags: ['computervision', 'ai', 'deeplearning'],
        daysAgo: 3
      },
      {
        content: 'Weekend bouldering session at the gym. Climbing forces your brain into complete tunnel-vision focus—every muscle engaged, no room for wandering thoughts. #climbing #fitness #bouldering',
        tags: ['climbing', 'fitness', 'bouldering'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Sonali Mahajan',
    username: 'sonali_mahajan',
    email: 'sonali_mahajan@example.com',
    headline: 'Ayurvedic Wellness Researcher & Formulation Chemist 🌿',
    bio: 'Bridging evidence-based pharmacognosy with ancient adaptogenic herbs like Ashwagandha and Brahmi. Pune | Yoga & herbal tea.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Analyzing standardized withanolide concentrations across wild-harvested Ashwagandha root samples. When traditional herbs are standardized using rigorous HPLC testing, they become powerful tools for modern stress adaptation. #ayurveda #wellness #herbalmedicine',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
        tags: ['ayurveda', 'wellness', 'herbalmedicine'],
        daysAgo: 2
      },
      {
        content: 'Golden milk (Haldi Doodh) tip: Always add a pinch of freshly cracked black pepper. Piperine increases the bioavailability of curcumin by up to 2000%! Ancient cooks intuitively knew this. #nutrition #wellnesswisdom',
        tags: ['nutrition', 'wellnesswisdom'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Bhavesh Trivedi',
    username: 'bhavesh_trivedi',
    email: 'bhavesh_trivedi@example.com',
    headline: 'Architectural Woodworker & Furniture Maker 🪑',
    bio: 'Handcrafted solid wood dining tables and mid-century modern credenzas using Indian rosewood and teak. Ahmedabad 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Hand-cutting traditional Japanese mortise-and-tenon joinery into this reclaimed teakwood bench. No nails, no screws—just timber interlocking under geometric tension to last a hundred years. #woodworking #carpentry #handmade #furniture',
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&auto=format&fit=crop&q=80',
        tags: ['woodworking', 'carpentry', 'handmade', 'furniture'],
        daysAgo: 1
      },
      {
        content: 'Wood grain is nature’s fingerprint. Every knot, ring, and grain shift tells the story of drought, sunlight, and wind that tree survived. Respect the raw material. #craftsmanship #naturalwood',
        tags: ['craftsmanship', 'naturalwood'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Pallavi Joshi',
    username: 'pallavi_joshi',
    email: 'pallavi_joshi@example.com',
    headline: 'Landscape Urbanist & Public Park Planner 🌳',
    bio: 'Designing sponge cities, native micro-forests (Miyawaki), and walkable urban greenways across Pune & Mumbai.',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Inspecting our 2-year-old native Miyawaki micro-forest in central Pune. Over 40 native tree species planted densely: Jamun, Peepal, Karanj, and Neem. Local bird sightings have quadrupled and neighborhood ambient temperature dropped 2.5°C. #urbanforestry #spongecity #climateaction',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80',
        tags: ['urbanforestry', 'spongecity', 'climateaction'],
        daysAgo: 2
      },
      {
        content: 'Cities need more bench seating, more shade trees, and less concrete paving. The greatness of a public space is measured by how welcoming it is to elderly citizens and children. #urbandesign #publicspaces',
        tags: ['urbandesign', 'publicspaces'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Chiranjeevi Reddy',
    username: 'chiranjeevi_r',
    email: 'chiranjeevi_r@example.com',
    headline: 'High-Performance Computing & Parallel Algorithms Engineer 💻',
    bio: 'CUDA kernels, MPI distributed clusters, and genomic sequencing pipelines. Hyderabad | Cycling & chess.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Optimized our genomic sequence alignment pipeline using custom CUDA warp-shuffle primitives. Whole genome variant calling runtime dropped from 18 hours to 43 minutes. Parallel hardware is an incredible force multiplier. #hpc #cuda #genomics #biotech',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
        tags: ['hpc', 'cuda', 'genomics', 'biotech'],
        daysAgo: 3
      },
      {
        content: 'Weekend chess matches in Hyderabad. Playing classical time control games trains the patience required to step back from code and evaluate macro system tradeoffs. #chess #strategy',
        tags: ['chess', 'strategy'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Aishwarya Rao',
    username: 'aishwarya_rao',
    email: 'aishwarya_rao@example.com',
    headline: 'Specialty Coffee Brand Director & Sensory Judge ☕',
    bio: 'Judging barista competitions across South Asia. Passionate about single-origin Indian coffees and sustainable farmer pricing. Bengaluru.',
    profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Evaluating carbonic maceration experimental lots from a biodynamic estate in Biligirirangana Hills. Vibrant notes of guava, elderflower, and dark honey. Indian specialty roasters are producing world-beating profiles. #specialtycoffee #sensory #bangalore',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1000&auto=format&fit=crop&q=80',
        tags: ['specialtycoffee', 'sensory', 'bangalore'],
        daysAgo: 1
      },
      {
        content: 'Support your local roasters and ask where your coffee beans were grown. Direct trade transparency empowers the agricultural families who do the hardest work. #coffeeculture #directtrade',
        tags: ['coffeeculture', 'directtrade'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Tarun Nanda',
    username: 'tarun_nanda',
    email: 'tarun_nanda@example.com',
    headline: 'Ecological Restoration Engineer & Wetlands Specialist 💧',
    bio: 'Reviving dying urban lakes using floating bio-remediation wetlands and zero-chemical microbial filters. Delhi NCR.',
    profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Deployed our floating treatment wetland islands across Hauz Khas lake in Delhi. Vetiver and Canna indica roots absorb excess nitrogen and phosphorus while providing nesting shelters for migratory ducks. Living biology cleans water best. #waterrestoration #ecology #delhi',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
        tags: ['waterrestoration', 'ecology', 'delhi'],
        daysAgo: 2
      },
      {
        content: 'Every city in India was once an interconnected network of rainwater lakes and catchment channels. Reviving our urban water bodies is our best insurance against climate droughts. #waterconservation #sustainability',
        tags: ['waterconservation', 'sustainability'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Mallika Sarabhai',
    username: 'mallika_s',
    email: 'mallika_s@example.com',
    headline: 'Independent Book Publisher & Literary Festival Director 📚',
    bio: 'Championing regional language literature translations into English. Ahmedabad & Mumbai | Chai and vintage paperbacks.',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Holding the first bound proofs of our translation of Gujarati short stories from the 1940s. Beautiful, raw, and deeply human portraits of rural resilience. Translation is the bridge that connects hearts across linguistic boundaries. #books #literature #translation #reading',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1000&auto=format&fit=crop&q=80',
        tags: ['books', 'literature', 'translation', 'reading'],
        daysAgo: 1
      },
      {
        content: 'What book fundamentally shifted how you perceive the world this past year? Drop your recommendations below—building my winter reading list! #bookrecommendations #readers',
        tags: ['bookrecommendations', 'readers'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Jatin Bhatnagar',
    username: 'jatin_bhatnagar',
    email: 'jatin_bhatnagar@example.com',
    headline: 'Senior Cloud Security Architect & Zero-Trust Specialist 🛡️',
    bio: 'Automating security telemetry, identity federation, and threat hunting. Jaipur & Gurgaon | Long distance running.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Rolled out hardware security key (FIDO2 / WebAuthn) enforcement for all developer infrastructure access today. Phishing-resistant MFA is the single highest-ROI security enhancement any technology organization can adopt. #infosec #cybersecurity #cloudsecurity',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
        tags: ['infosec', 'cybersecurity', 'cloudsecurity'],
        daysAgo: 3
      },
      {
        content: 'Weekend 25k run along the Nahargarh hills in Jaipur. Sunrise over the pink city from the fortress ridge is magical. #jaipur #running #morningroutine',
        tags: ['jaipur', 'running', 'morningroutine'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Aniket Kulkarni',
    username: 'aniket_kulkarni',
    email: 'aniket_kulkarni@example.com',
    headline: 'Acoustic Guitarist & Independent Composer 🎸',
    bio: 'Fingerstyle acoustic instrumentals blending Indian ragas with contemporary folk. Pune | Coffee and vinyl records.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Tracking acoustic guitars in DADGAD tuning for my upcoming EP. The open harmonic overtones of cedar top timber resonate right in your chest. Music is the universal language of emotion. #fingerstyle #acousticguitar #indieartist #music',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
        tags: ['fingerstyle', 'acousticguitar', 'indieartist', 'music'],
        daysAgo: 2
      },
      {
        content: 'Dedicate at least an hour every week to playing your musical instrument without recording, analyzing, or goal-setting. Pure joyful play restores creative vitality. #creativity #musictips',
        tags: ['creativity', 'musictips'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Ritu Saxena',
    username: 'ritu_saxena',
    email: 'ritu_saxena@example.com',
    headline: 'Wildlife Photojournalist & Bird Conservationist 🦜',
    bio: 'Documenting high-altitude migratory birds in Ladakh and wetlands in Bharatpur. Delhi NCR | Nikon & long telephotos.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Witnessed thousands of Bar-headed Geese landing at Keoladeo National Park in Bharatpur. These remarkable birds fly over the summits of the Himalayas at 8,000 meters during migration! Nature’s endurance is awe-inspiring. #wildlifephotography #birds #nature #bharatpur',
        image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1000&auto=format&fit=crop&q=80',
        tags: ['wildlifephotography', 'birds', 'nature', 'bharatpur'],
        daysAgo: 1
      },
      {
        content: 'Birdwatching teaches stillness. In a culture driven by hyper-stimulation, standing motionless by a wetland reed bed for three hours is radical self-care. #mindfulness #naturetherapy',
        tags: ['mindfulness', 'naturetherapy'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Devendra Chauhan',
    username: 'devendra_c',
    email: 'devendra_c@example.com',
    headline: 'Organic Orchardist & Permaculture Designer 🍎',
    bio: 'Cultivating heritage heirloom apple varieties and natural walnut groves without chemical sprays. Kotgarh, Himachal Pradesh 🏔️.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Autumn apple harvest in Kotgarh. Golden Delicious and Royal Gala apples picked under crystal clear Himalayan blue skies. Living in rhythm with mountain seasons is a blessing. #himachal #apples #orchard #mountainlife',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
        tags: ['himachal', 'apples', 'orchard', 'mountainlife'],
        daysAgo: 3
      },
      {
        content: 'Permaculture wisdom: A healthy orchard has weeds, wildflowers, honeybees, and birds. Monoculture sterility is fragile; biodiversity is resilient. #permaculture #organicfarming',
        tags: ['permaculture', 'organicfarming'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Snehal More',
    username: 'snehal_more',
    email: 'snehal_more@example.com',
    headline: 'Senior Rust & Go Infrastructure Engineer ⚡',
    bio: 'Distributed key-value stores, raft consensus algorithms, and Linux kernel eBPF tracing. Pune | Filter coffee lover.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Wrote an eBPF observability probe to trace socket write latency on production Kubernetes nodes without touching application code. Linux kernel tracing superpowers in 2026 are unbelievable. #ebpf #linux #devops #backend',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
        tags: ['ebpf', 'linux', 'devops', 'backend'],
        daysAgo: 2
      },
      {
        content: 'Mastering distributed systems requires understanding failure modes deeply: Network partitions will happen, disks will corrupt, and clocks will drift. Design for resilience, not perfection. #systemdesign #techwisdom',
        tags: ['systemdesign', 'techwisdom'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Abhinav Kashyap',
    username: 'abhinav_kashyap',
    email: 'abhinav_kashyap@example.com',
    headline: 'Experimental Film Director & Screenwriter 🎬',
    bio: 'Independent cinema exploring human longing, memory, and migration. Varanasi & Mumbai | 35mm film collector.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Shooting night scenes along the ancient stone steps of Manikarnika Ghat in Varanasi on Kodak Vision3 500T 35mm film stock. The chemical grain of celluloid catches candlelight with a soul digital sensors cannot duplicate. #filmmaking #cinema #varanasi #35mm',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80',
        tags: ['filmmaking', 'cinema', 'varanasi', '35mm'],
        daysAgo: 1
      },
      {
        content: 'The most powerful cinema scenes are often completely wordless. Silence creates space for the audience’s own heart to enter the story. #screenwriting #cinematips',
        tags: ['screenwriting', 'cinematips'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Nandini Bhatt',
    username: 'nandini_bhatt',
    email: 'nandini_bhatt@example.com',
    headline: 'Architectural Conservator & Heritage Chemist 🏛️',
    bio: 'Preserving ancient fresco murals in Shekhawati havelis and medieval stone monuments. Jaipur & Delhi.',
    profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Conserving 150-year-old fresco murals in Mandawa, Shekhawati. Using specialized agar-agar poultices and deionized water to gently lift decades of grime without disturbing natural indigo and cinnabar pigments. Heritage chemistry is delicate magic. #conservation #heritage #rajasthan #art',
        image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1000&auto=format&fit=crop&q=80',
        tags: ['conservation', 'heritage', 'rajasthan', 'art'],
        daysAgo: 2
      },
      {
        content: 'When you stand before centuries-old murals, you feel the direct gaze of the artist across time. Our duty is simply to preserve their voice for future generations. #heritageconservation #history',
        tags: ['heritageconservation', 'history'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Mayank Pandey',
    username: 'mayank_pandey',
    email: 'mayank_pandey@example.com',
    headline: 'Fintech Mobile Engineer (Flutter & Kotlin) 📱',
    bio: 'Designing responsive financial dashboards and smooth payment animations. Lucknow & Bangalore | Chess player.',
    profilePicture: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Architecting an offline-first transaction synchronization protocol for micro-merchants in tier-4 towns. When network connectivity drops, local SQLite queues transactions and reconciles idempotently once online. #flutter #mobiledev #fintech #architecture',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
        tags: ['flutter', 'mobiledev', 'fintech', 'architecture'],
        daysAgo: 3
      },
      {
        content: 'Hot reload in Flutter is still the fastest feedback loop for UI experimentation. Being able to iterate on micro-interactions in milliseconds makes all the difference. #flutterdev #coding',
        tags: ['flutterdev', 'coding'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Trisha Mukherjee',
    username: 'trisha_m',
    email: 'trisha_m@example.com',
    headline: 'Creative Writing Mentor & Short Fiction Author ✍️',
    bio: 'Published author exploring family genealogies and urban transitions in contemporary India. Kolkata | Darjeeling tea & books.',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Early morning writing session at College Street Coffee House in Kolkata. The clatter of porcelain cups, the scent of fresh book print from neighboring stalls, and a fresh fountain pen nib on creamy paper. Heaven on earth. #writing #kolkata #authorslife #books',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1000&auto=format&fit=crop&q=80',
        tags: ['writing', 'kolkata', 'authorslife', 'books'],
        daysAgo: 1
      },
      {
        content: 'Writing advice for aspiring authors: Don’t wait for inspiration to strike before sitting down. Write three bad sentences if you must; the fourth one will surprise you. #writingtips #amwriting',
        tags: ['writingtips', 'amwriting'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Hemant Rawat',
    username: 'hemant_rawat',
    email: 'hemant_rawat@example.com',
    headline: 'High-Altitude Trek Leader & Wilderness Guide 🏔️',
    bio: 'Leading alpine expeditions across Garhwal & Kumaon Himalayas. Wilderness first responder. Rishikesh & Uttarkashi.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Summit morning at Kedarkantha at 3,800m altitude. Watching the golden sunrise illuminate the majestic peaks of Swargarohini, Bandarpoonch, and Black Peak. The mountains demand surrender and reward you with peace. #himalayas #trekking #uttarakhand #outdoors',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80',
        tags: ['himalayas', 'trekking', 'uttarakhand', 'outdoors'],
        daysAgo: 2
      },
      {
        content: 'Leave No Trace principle: Pack out every single wrapper, peel, and piece of litter you bring into alpine valleys. Protect our sacred glaciers. #leavenotrace #himalayas',
        tags: ['leavenotrace', 'himalayas'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Gayatri Deshmukh',
    username: 'gayatri_d',
    email: 'gayatri_d@example.com',
    headline: 'Clinical Dietitian & Gut Microbiome Specialist 🥗',
    bio: 'Evidence-based functional nutrition integrating fermented Indian staples like kanji, buttermilk, and fermented ragi. Mumbai & Pune.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Fermenting black carrot Kanji with crushed mustard seeds and Himalayan pink salt. Traditional winter probiotics have been proven by modern microbiome studies to enrich beneficial Bifidobacterium strains. Ancestral culinary wisdom is brilliant. #guthealth #microbiome #nutrition #fermentation',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80',
        tags: ['guthealth', 'microbiome', 'nutrition', 'fermentation'],
        daysAgo: 1
      },
      {
        content: 'Simple daily habit for gut health: Aim for 30 different plant foods (vegetables, grains, nuts, seeds, herbs) every week. Diversity on your plate breeds diversity in your microbiome. #healthyliving #nutritiontips',
        tags: ['healthyliving', 'nutritiontips'],
        daysAgo: 5
      }
    ]
  },
  {
    name: 'Suresh Namboodiri',
    username: 'suresh_namboodiri',
    email: 'suresh_namboodiri@example.com',
    headline: 'Sanskrit Linguist & Epigraphist 📜',
    bio: 'Deciphering copper plate grants and stone inscriptions from South Indian dynasties. Thrissur & Trivandrum.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Translating an 8th-century Grantha script inscription recording an agricultural irrigation endowment by a village assembly in Tamil Nadu. The precision of medieval democratic governance records in India is astounding. #history #epigraphy #archaeology #india',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000&auto=format&fit=crop&q=80',
        tags: ['history', 'epigraphy', 'archaeology', 'india'],
        daysAgo: 3
      },
      {
        content: 'Sanskrit’s mathematical grammatical structure formulated by Panini in the Ashtadhyayi over 2,500 years ago anticipated formal language grammar used in modern compiler design. #linguistics #ancientwisdom',
        tags: ['linguistics', 'ancientwisdom'],
        daysAgo: 10
      }
    ]
  },
  {
    name: 'Deepika Sen',
    username: 'deepika_sen',
    email: 'deepika_sen@example.com',
    headline: 'Independent Documentary Producer & Festival Programmer 🎥',
    bio: 'Championing regional storytelling across South Asia. Mumbai & Kolkata | Film lover, coffee regular.',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Premiering our collaborative documentary on Bengal patachitra scroll painters at the Mumbai International Film Festival today. Seeing traditional village storytellers receive a standing ovation from global film critics made my heart full. #documentary #filmfestival #indiancinema #art',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80',
        tags: ['documentary', 'filmfestival', 'indiancinema', 'art'],
        daysAgo: 2
      },
      {
        content: 'Independent cinema survives because passionate audiences show up and support raw, uncompromised storytelling. Thank you to everyone who bought a ticket. #cinema #supportindie',
        tags: ['cinema', 'supportindie'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Aniruddh Vashisht',
    username: 'aniruddh_v',
    email: 'aniruddh_v@example.com',
    headline: 'Venture Architect & Deep Tech Startup Mentor 🚀',
    bio: 'Building commercialization bridges between university research labs and venture capital. Bangalore & Hyderabad.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'India has world-class scientific minds in IITs and IISc doing pioneering work in quantum computing, advanced materials, and synthetic biology. The next 10 years will see Indian deep-tech startups solving humanity’s hardest problems. #deeptech #innovation #startups #india',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
        tags: ['deeptech', 'innovation', 'startups', 'india'],
        daysAgo: 1
      },
      {
        content: 'Great founders have an uncanny ability to simplify complex technical jargon into clear, compelling customer value. If your grandma can’t understand what you do, refine your pitch. #startupadvice #communication',
        tags: ['startupadvice', 'communication'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Pooja Bhattacharya',
    username: 'pooja_bhatt',
    email: 'pooja_bhatt@example.com',
    headline: 'Classical Sitarist & Ambient Sound Explorer 🎵',
    bio: 'Maihar gharana sitarist blending ragas with modular synth soundscapes. Kolkata & Berlin.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Evening sitar riyaaz in Raga Puriya Dhanashree. The microtonal meend (glide) across the frets mirrors the bittersweet colors of twilight. Classical music teaches that perfection is an endless, joyful journey. #sitar #classicalmusic #indianclassical #riyaz',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
        tags: ['sitar', 'classicalmusic', 'indianclassical', 'riyaz'],
        daysAgo: 2
      },
      {
        content: 'Rhythm (Taal) is the heartbeat of existence. When you internalize rhythm, your entire nervous system learns to operate with poise and grace. #musicmeditation #sound',
        tags: ['musicmeditation', 'sound'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Sameer Sheikh',
    username: 'sameer_sheikh',
    email: 'sameer_sheikh@example.com',
    headline: 'Autonomous Vehicle Sensor Fusion Engineer 🚗',
    bio: 'Camera-LiDAR calibration, Kalman filtering, and real-time obstacle tracking. Pune | Formula 1 fan.',
    profilePicture: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Calibrating multi-camera temporal sync on our Level 3 test vehicle. Achieving sub-millisecond hardware trigger synchronization eliminates motion blur and spatial disparity errors completely. #autonomousvehicles #selfdriving #sensors #engineering',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&auto=format&fit=crop&q=80',
        tags: ['autonomousvehicles', 'selfdriving', 'sensors', 'engineering'],
        daysAgo: 3
      },
      {
        content: 'Excited for the upcoming Formula 1 race weekend! The aerodynamic innovation and telemetry telemetry processing in motorsports always trickles down to consumer mobility. #f1 #motorsports',
        tags: ['f1', 'motorsports'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Kavita Menon',
    username: 'kavita_menon',
    email: 'kavita_menon@example.com',
    headline: 'Ayurvedic Botanist & Herbal Apothecary Founder 🌿',
    bio: 'Cultivating native Kerala medicinal shrubs like Brahmi, Tulsi, and Shatavari in organic forest nurseries. Kochi 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Harvesting wild Krishna Tulsi leaves at sunrise when essential oil concentrations in the leaf glands are at their daily zenith. The spicy, clove-like aroma fills the entire nursery. Nature provides the ultimate medicine. #herbalism #tulsi #ayurveda #kerala',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
        tags: ['herbalism', 'tulsi', 'ayurveda', 'kerala'],
        daysAgo: 1
      },
      {
        content: 'A daily cup of freshly brewed holy basil and ginger tea with raw wild honey does wonders for immune equilibrium during seasonal shifts. Simple ancient rituals heal. #wellness #herbaltea',
        tags: ['wellness', 'herbaltea'],
        daysAgo: 7
      }
    ]
  },
  {
    name: 'Manoj Joshi',
    username: 'manoj_joshi',
    email: 'manoj_joshi@example.com',
    headline: 'High-Altitude Solar Inverter Lead ☀️',
    bio: 'Designing cold-tolerant photovoltaic power plants for Ladakh and Himachal border areas. Dehradun & Leh.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Commissioned a 500kW bifacial solar array at 3,500m in Leh, Ladakh. Snow reflection from surrounding alpine passes increases bifacial energy generation by over 28%! Cold temperatures actually make solar panels more efficient. #solar #ladakh #cleanenergy #engineering',
        image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80',
        tags: ['solar', 'ladakh', 'cleanenergy', 'engineering'],
        daysAgo: 2
      },
      {
        content: 'The stark, silent beauty of the Changthang plateau in Ladakh is humbling. Clean renewable power is protecting these fragile Himalayan ecosystems from diesel smog. #cleanair #himalayas',
        tags: ['cleanair', 'himalayas'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Harini Sundar',
    username: 'harini_sundar',
    email: 'harini_sundar@example.com',
    headline: 'Classical Carnatic Flautist & Music Educator 🎶',
    bio: 'Bamboo flute (Venu) performer preserving ancient ragas and training young musicians. Chennai & Coimbatore.',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Crafting new natural bamboo flutes with master artisan Sri Kannan in Thanjavur. Tuning each finger hole by ear to pure natural acoustic intervals (Shrutis). The bamboo hollow breath becomes pure song. #flute #carnatic #music #thanjavur',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
        tags: ['flute', 'carnatic', 'music', 'thanjavur'],
        daysAgo: 1
      },
      {
        content: 'Playing the flute is breath control made conscious (Pranayama). When your exhale is smooth, measured, and calm, the mind mirrors that serenity instantly. #breathwork #flutemeditation',
        tags: ['breathwork', 'flutemeditation'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Kishore Deshmukh',
    username: 'kishore_desh',
    email: 'kishore_desh@example.com',
    headline: 'Robotics Embedded Firmware Architect 🛠️',
    bio: 'Micro-ROS, RTOS real-time scheduling, and CAN-bus industrial automation. Pune | Motorhead & coffee brewer.',
    profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Deterministic interrupt handling on ARM Cortex-M7 achieved zero jitter under 50kHz motor commutation loops. Real-time embedded programming is where software meets physical reality without any safety net. #embedded #firmware #robotics #cprogramming',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
        tags: ['embedded', 'firmware', 'robotics', 'cprogramming'],
        daysAgo: 2
      },
      {
        content: 'Scope probes and logic analyzers: A hardware engineer’s truest friends. When signals look messy, look at grounding first. 90% of mysteries live in ground bounce. #electronics #maker',
        tags: ['electronics', 'maker'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Ananya Nambiar',
    username: 'ananya_nambiar',
    email: 'ananya_nambiar@example.com',
    headline: 'Biodynamic Farmer & Heirloom Seed Guardian 🌱',
    bio: 'Curating a seed bank of over 120 indigenous drought-resistant rice and millet varieties. Wayanad, Kerala 📍.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Harvesting traditional Gandhakasala aromatic scented rice in Wayanad. The fragrance of this heirloom paddy fills the entire valley during harvesting. Protecting indigenous seeds is the ultimate food sovereignty. #heirloomseeds #farming #kerala #biodiversity',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80',
        tags: ['heirloomseeds', 'farming', 'kerala', 'biodiversity'],
        daysAgo: 1
      },
      {
        content: 'Seeds are not commodities—they are living history passed down through generations of mindful farming hands. Save seeds, share seeds, sustain life. #seedfreedom #agroecology',
        tags: ['seedfreedom', 'agroecology'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Siddharth Chopra',
    username: 'siddharth_chopra',
    email: 'siddharth_chopra@example.com',
    headline: 'Lead Game Audio Director & Foley Artist 🎧',
    bio: 'Recording spatial audio in Indian jungles and ancient forts for AAA video game environments. Mumbai & Bangalore.',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Field recording ambisonic 3D audio inside the whispering gallery of Gol Gumbaz in Bijapur. The 11-fold acoustic echo decay is mind-bending. Spatial audio brings interactive game worlds alive with realism. #gameaudio #sounddesign #foley #spatialaudio',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
        tags: ['gameaudio', 'sounddesign', 'foley', 'spatialaudio'],
        daysAgo: 3
      },
      {
        content: 'Close your eyes and listen to your surroundings for 60 seconds right now. How many distinct audio layers can you separate? Developing active listening changes how you experience reality. #soundawareness #mindfulness',
        tags: ['soundawareness', 'mindfulness'],
        daysAgo: 9
      }
    ]
  },
  {
    name: 'Deepak Singhal',
    username: 'deepak_singhal',
    email: 'deepak_singhal@example.com',
    headline: 'Senior Database Architect & Distributed SQL Specialist 💾',
    bio: 'PostgreSQL performance tuning, Raft distributed consensus, and zero-loss disaster recovery. Gurgaon & Bangalore.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Never use SELECT * in production endpoints that scale! Specifying exact column projections saved 60% network serialization overhead and allowed PostgreSQL to execute index-only scans without hitting heap tables. Small habits, massive throughput. #postgresql #database #performance #backend',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
        tags: ['postgresql', 'database', 'performance', 'backend'],
        daysAgo: 2
      },
      {
        content: 'Connection pooling (PgBouncer) is not optional once your microservices scale past a few dozen pods. Postgres fork-per-connection architecture will exhaust memory without a disciplined pooler. #devops #databaseengineering',
        tags: ['devops', 'databaseengineering'],
        daysAgo: 8
      }
    ]
  },
  {
    name: 'Priyanka Kulkarni',
    username: 'priyanka_k',
    email: 'priyanka_k@example.com',
    headline: 'Ethical D2C Apparel Founder & Handloom Advocate 👗',
    bio: 'Crafting unbleached organic cotton workwear dyed with natural indigo and marigold. Pune & Mumbai.',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    posts: [
      {
        content: 'Quality garment manufacturing takes time. Our seamstresses use single-needle tailoring with bound seams so clothes can be repaired and loved for decades. Fast fashion is disposable; true style is heirloom. #slowfashion #ethicalbrand #sustainableclothing',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
        tags: ['slowfashion', 'ethicalbrand', 'sustainableclothing'],
        daysAgo: 1
      },
      {
        content: 'Natural indigo gets richer with every wash. Synthetic dyes fade dull; natural indigo develops an exquisite patina that tells the story of the wearer. #indigodye #artisanal',
        tags: ['indigodye', 'artisanal'],
        daysAgo: 6
      }
    ]
  },
  {
    name: 'Raghavan Iyer',
    username: 'raghavan_iyer',
    email: 'raghavan_iyer@example.com',
    headline: 'High-Altitude Alpine Botanist & Himalayan Conservationist 🌸',
    bio: 'Cataloging endangered medicinal sub-alpine shrubs in Himachal Pradesh & Uttarakhand. Shimla | Tea & books.',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    isVerified: false,
    posts: [
      {
        content: 'Discovered a flourishing population of Himalayan Rhododendron campanulatum near the Jalori pass ridge at 3,200m. The delicate lavender-pink bell flowers provide vital nectar for mountain honeybees after harsh winter thaws. #botany #himalayas #nature #conservation',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80',
        tags: ['botany', 'himalayas', 'nature', 'conservation'],
        daysAgo: 2
      },
      {
        content: 'In alpine tundra environments, plant cushions take decades to grow just a few centimeters. Please tread mindfully along designated stone trails when visiting high-altitude meadows. #treadlightly #ecotourism',
        tags: ['treadlightly', 'ecotourism'],
        daysAgo: 7
      }
    ]
  }
];

const COMMUNITY_COMMENTS = [
  "Incredible depth and clarity. Really appreciate this insight!",
  "Stunning composition! Where was this photographed?",
  "Completely agree with this perspective. Simplicity always outperforms complexity.",
  "Such an inspiring thought! Adding this to my personal weekend notes.",
  "Spot on! Appreciate how grounded and honest this breakdown is.",
  "Brilliant write-up! Thanks for sharing this with the ConnectHub community.",
  "Phenomenal work! Proud to be connected and following your journey.",
  "Couldn't agree more with your approach here. Beautifully articulated.",
  "Always look forward to your updates on ConnectHub. Keep inspiring us!",
  "Such an important conversation that often gets overlooked.",
  "This looks absolutely gorgeous! Bookmarking to re-read.",
  "Love the warm aesthetic and thoughtful execution!"
];

const run = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully.');

    const defaultHashedPassword = await bcrypt.hash('password123', 10);

    // 1. Fetch existing users so we can interconnect everyone
    const existingUsers = await User.find({});
    console.log(`Existing users in database: ${existingUsers.length}`);

    const createdUsers = [];

    // 2. Create or update each of the 55 users
    console.log(`\nCreating/updating ${NEW_USERS_DATA.length} diverse Indian users...`);
    for (const userData of NEW_USERS_DATA) {
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
        console.log(`Created user: ${user.name} (@${user.username})`);
      } else {
        user.name = userData.name;
        user.headline = userData.headline;
        user.bio = userData.bio;
        user.profilePicture = userData.profilePicture;
        user.coverPhoto = userData.coverPhoto;
        user.isVerified = userData.isVerified;
        user.isActive = true;
        await user.save();
        console.log(`Updated user: ${user.name} (@${user.username})`);
      }
      createdUsers.push(user);
    }

    // 3. Connect all users in follow graph
    console.log('\nEstablishing rich mutual follow network...');
    const allUsers = await User.find({});
    console.log(`Total community members now: ${allUsers.length}`);

    for (const user of allUsers) {
      const otherUsers = allUsers.filter(u => u._id.toString() !== user._id.toString());
      // Follow 20 to 45 random other members
      const followCount = Math.min(otherUsers.length, 20 + Math.floor(Math.random() * 25));
      const shuffledOthers = [...otherUsers].sort(() => 0.5 - Math.random());
      const selectedToFollow = shuffledOthers.slice(0, followCount);

      const fSet = new Set((user.following || []).map(id => id.toString()));
      for (const target of selectedToFollow) {
        fSet.add(target._id.toString());
      }
      user.following = Array.from(fSet);
      await user.save();
    }

    // Update followers references
    for (const user of allUsers) {
      const followersSet = new Set((user.followers || []).map(id => id.toString()));
      for (const other of allUsers) {
        if (other._id.toString() !== user._id.toString()) {
          if (other.following.some(id => id.toString() === user._id.toString())) {
            followersSet.add(other._id.toString());
          }
        }
      }
      user.followers = Array.from(followersSet);
      await user.save();
    }
    console.log('Follow network synchronized.');

    // 4. Create authentic posts, likes, and comments for new users
    console.log('\nPublishing posts, likes, and comments for new users...');
    let postsCount = 0;
    let commentsCount = 0;

    for (const userData of NEW_USERS_DATA) {
      const author = createdUsers.find(u => u.username === userData.username);
      if (!author) continue;

      // Clean existing posts for this user to avoid duplicates if re-running
      const existingUserPosts = await Post.find({ user: author._id });
      if (existingUserPosts.length > 0) {
        const pIds = existingUserPosts.map(p => p._id);
        await Comment.deleteMany({ post: { $in: pIds } });
        await Post.deleteMany({ _id: { $in: pIds } });
      }

      for (const postItem of userData.posts) {
        const postDate = new Date(Date.now() - (postItem.daysAgo || 1) * 24 * 60 * 60 * 1000 - Math.floor(Math.random() * 3600000));

        // Random 8 to 22 likes from community members
        const potentialLikers = allUsers.filter(u => u._id.toString() !== author._id.toString());
        const shuffledLikers = [...potentialLikers].sort(() => 0.5 - Math.random());
        const likers = shuffledLikers.slice(0, 8 + Math.floor(Math.random() * 15));
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
        postsCount++;

        // Add 1 to 4 active comments
        const commenters = shuffledLikers.slice(0, 1 + Math.floor(Math.random() * 4));
        const commentIds = [];

        for (const commenter of commenters) {
          const commentText = COMMUNITY_COMMENTS[Math.floor(Math.random() * COMMUNITY_COMMENTS.length)];
          const commentDate = new Date(postDate.getTime() + (10 + Math.floor(Math.random() * 300)) * 60 * 1000);

          const comment = await Comment.create({
            post: newPost._id,
            user: commenter._id,
            text: commentText,
            createdAt: commentDate,
            updatedAt: commentDate
          });
          commentIds.push(comment._id);
          commentsCount++;
        }

        newPost.comments = commentIds;
        await newPost.save();
      }
    }

    const totalUsersInDB = await User.countDocuments();
    const totalPostsInDB = await Post.countDocuments();
    const totalCommentsInDB = await Comment.countDocuments();

    console.log(`\n========================================`);
    console.log(`SUCCESSFULLY ADDED ${createdUsers.length} NEW USERS!`);
    console.log(`- Total users in DB: ${totalUsersInDB}`);
    console.log(`- Total posts in DB: ${totalPostsInDB} (+${postsCount} newly published)`);
    console.log(`- Total comments in DB: ${totalCommentsInDB} (+${commentsCount} newly published)`);
    console.log(`- Interconnected all profiles with mutual followers & following`);
    console.log(`========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

run();
