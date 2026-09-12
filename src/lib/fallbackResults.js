// Intelligent Semantic Parody Generator
// Dynamically constructs hyper-relevant, witty answers tailored to the exact query

function hashSeed(value) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function formatSubject(str) {
  if (!str) return 'This Question'
  if (/^buggati$/i.test(str)) return 'Bugatti'
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

function cleanSubject(query) {
  let clean = query.trim().replace(/[?!.,]+$/, '')
  // strip common question starters
  clean = clean.replace(/^(why did|why is|why does|why do|why are|why was|why were|why|how to|how do i|how can i|how did|how do|how does|how|what is|what are|what does|what did|what|who is|who are|who did|who|should i|can i|could i|did i|is it true that|is it|is|are|does|do|did)\s+/i, '')
  // strip common action verbs like buy, get, become, afford, build, make, find, drive
  clean = clean.replace(/^(buy|buying|get|getting|purchase|purchasing|become|becoming|own|owning|afford|build|building|make|making|find|finding|drive|driving)\s+/i, '')
  // strip leading articles
  clean = clean.replace(/^(the|a|an|my|your|our)\s+/i, '')
  const raw = clean.trim() || 'this question'
  return formatSubject(raw)
}

function detectIntent(query) {
  const q = query.toLowerCase()
  if (/^why|^how come/i.test(q)) return 'why'
  if (/^how to|^how do|^how can/i.test(q)) return 'how'
  if (/^what is|^what are|^who is/i.test(q)) return 'what'
  if (/^should i|^can i|^could i/i.test(q)) return 'should'
  if (/^is |^are |^does |^do |^will /i.test(q)) return 'binary'
  return 'general'
}

const domainMatchers = [
  {
    domain: 'cars_luxury',
    regex: /\b(bugatti|buggati|ferrari|lamborghini|lambo|porsche|supercar|supercars|hypercar|hypercars|bentley|rolls royce|mclaren|maserati|sports car|luxury car)\b/i,
    topics: {
      how: [
        ['Step 1: Open your bank app. Step 2: Cry.', 'A Bugatti costs over $3 million. Even saving all your money for 100 years will not buy one tire.'],
        ['Step 1: Buy a lottery ticket. Step 2: Keep dreaming.', 'One single oil change costs $25,000, which can buy a whole normal car.'],
        ['Ask a billionaire to adopt you.', 'The car dealer will not even let you look at the showroom door with regular sneakers.']
      ],
      why: [
        ['Because you want to look rich while sitting in city traffic.', 'The car goes 300 mph, but you will still drive 20 mph behind a bus.'],
        ['To show off to strangers at red lights.', 'Because spending millions on a car is the fastest way to become broke.']
      ],
      what: [
        ['A $3 million race car made for showing off.', 'A super fast luxury car that costs more than a house.'],
        ['The most expensive way to drive to the grocery store.', 'A car made for people who have way too much money.']
      ],
      should: [
        ['Only if you have millions in cash in your backyard.', 'Your bank account is shaking in fear just hearing you ask this.'],
        ['Check your wallet first. If you see $20, close this tab.']
      ],
      binary: [
        ['No, unless you find buried treasure under your bed today.', 'The car dealer would laugh at this question.']
      ],
      general: [
        ['A super fast luxury car with a giant price tag.', 'Fast, loud, and way too expensive.']
      ]
    }
  },
  {
    domain: 'coding',
    regex: /\b(code|coding|program|programmer|programming|bug|bugs|debugging|react|javascript|python|css|html|git|github|npm|developer|developers|api|backend|frontend|server|linux|terminal|docker|sql|database|cache|null|undefined)\b/i,
    topics: {
      why: [
        ['Because one small typo broke the entire program.', 'Your code worked fine until you tried to show it to someone.'],
        ['It works on your laptop, but crashes everywhere else.', 'Every bug is just a mistake waiting to ruin your weekend.'],
        ['Because the computer only does what you type, not what you want.', 'One missing semicolon broke everything and wasted three hours.']
      ],
      how: [
        ['Step 1: Restart your laptop. Step 2: Pray it works.', 'If that fails, search online and copy code from 10 years ago.'],
        ['Add 20 print statements to see where it breaks.', 'Keep clicking run and hope the computer changes its mind.']
      ],
      what: [
        ['Typing words on a screen for hours to fix one tiny bug.', 'A machine that turns coffee into red error messages.'],
        ['Staring at a screen until you find a missing bracket.', 'Making simple things complicated with computers.']
      ],
      should: [
        ['Do not change the code right before you show it to your boss.', 'It might work, or it might break everything completely.'],
        ['Ask a friend for help before you delete all your files.']
      ],
      binary: [
        ['It works right now, but do not touch anything.', 'Yes, but only when nobody is looking at the screen.']
      ],
      general: [
        ['It worked 5 minutes ago and nobody knows what changed.', 'The computer says no, and it will not tell you why.']
      ]
    }
  },
  {
    domain: 'science',
    regex: /\b(sky|space|physics|atom|atoms|gravity|universe|planet|planets|stars?|sun|moon|earth|dinosaur(s)?|black hole(s)?|quantum|climate|ocean|oceans|water|speed of light)\b/i,
    topics: {
      why: [
        ['Because the sky felt like wearing blue today.', 'Sunlight scatters through the air, making the whole sky look bright blue.'],
        ['Gravity pulls everything down so you do not fly into space.', 'Sir Isaac Newton dropped an apple and made physics everyone else’s problem.']
      ],
      how: [
        ['Carefully follow the laws of physics and do not fall over.', 'Ask a scientist, and they will give you an answer with 50 math formulas.']
      ],
      what: [
        ['A giant universe full of stars, planets, and people searching funny questions.', 'Space is huge, empty, and does not care about your deadlines.']
      ],
      should: [
        ['Science says yes, but your common sense says be careful.', 'The laws of physics allow it, but your mom will not.']
      ],
      binary: [
        ['Yes, until a scientist checks and discovers it changed.', 'In theory yes, but in real life probably not.']
      ],
      general: [
        ['A simple science mystery that keeps people guessing.', 'Nature is weird, but that is what makes it fun.']
      ]
    }
  },
  {
    domain: 'career',
    regex: /\b(jobs?|boss|salary|promotion|promotions|interviews?|corporate|meetings?|slack|emails?|clients?|resume|colleagues?|office|managers?|careers?|layoffs?|burnout)\b/i,
    topics: {
      why: [
        ['Because this meeting could have been a 1-sentence email.', 'Eight people are sitting on a video call waiting for someone else to talk.'],
        ['Your boss asked for an update before you even started working.', 'Because work never ends, but lunch hour goes by in 2 seconds.']
      ],
      how: [
        ['Send an email saying "let us talk tomorrow", then go home.', 'Nod your head during the Zoom call and pretend you are listening.'],
        ['Set your work status to busy and take a nice long nap.', 'Type very fast so everyone thinks you are working hard.']
      ],
      what: [
        ['Trading 40 hours of your week for money and a desk.', 'Sitting in meetings all day wondering when you will actually do work.']
      ],
      should: [
        ['Close your laptop. It is 5 PM and nobody is checking emails.', 'Do not reply to that email while you are angry. Wait until tomorrow.']
      ],
      binary: [
        ['No, this meeting was completely unnecessary.', 'Yes, you can log off now. The work will still be there tomorrow.']
      ],
      general: [
        ['Work is hard, but payday is great.', 'Just smile, nod, and wait for the weekend.']
      ]
    }
  },
  {
    domain: 'dating',
    regex: /\b(love|dates?|dating|crushes?|crush|girlfriend|boyfriend|ex|ghost(ed|ing)?|texts?|texting|relationships?|flirt(ing)?|marriage|breakup|feelings|heart)\b/i,
    topics: {
      why: [
        ['They read your message and went to sleep.', 'People get scared and put their phone on silent mode.'],
        ['Because you are overthinking every word they said.', 'They are not ignoring you on purpose; they just forgot to reply.']
      ],
      how: [
        ['Do not send that long message. Send a simple "hello" instead.', 'Put your phone in another room and go for a walk.'],
        ['Wait a few hours before you reply so you do not look desperate.', 'Be yourself. If they do not like that, find someone better.']
      ],
      what: [
        ['Two people staring at their phones waiting for the other to text first.', 'Hoping someone likes you as much as you like snacks.'],
        ['A fun adventure that can sometimes give you a headache.', 'Sharing your fries even when you really want to eat them all.']
      ],
      should: [
        ['Do not send that 2 AM text. Go to sleep instead.', 'Your ex does not miss you; they are just bored right now.'],
        ['If you have to ask the internet for advice, the answer is no.']
      ],
      binary: [
        ['No, they are not busy 24 hours a day. They saw your message.', 'Yes, but take it slow and see what happens.']
      ],
      general: [
        ['Dating is tricky, but good food makes everything better.', 'Save your energy for someone who actually replies on time.']
      ]
    }
  },
  {
    domain: 'food',
    regex: /\b(food|coffee|tea|cook(ing)?|eat(ing)?|recipes?|pizza|burgers?|hungry|diet|sugar|chocolates?|snacks?|restaurants?|breakfast|dinner|caffeine)\b/i,
    topics: {
      why: [
        ['Because delicious food makes you happy instantly.', 'The recipe said 15 minutes, but cleaning the kitchen took two hours.'],
        ['You are not really hungry; you are just bored.', 'The fridge light was calling your name in the dark.']
      ],
      how: [
        ['Order food from your phone and let someone else cook.', 'Add extra cheese until all your problems disappear.'],
        ['Drink a cup of coffee and hope you wake up soon.', 'Tell yourself you will start eating healthy on Monday.']
      ],
      what: [
        ['A hot cup of coffee that stops you from falling asleep.', 'Standing in front of the open fridge hoping new snacks appeared.'],
        ['Pizza: the universal cure for a bad day.', 'Delicious food that makes you forget your diet.']
      ],
      should: [
        ['Eat the pizza now. You can eat salad tomorrow.', 'Drink some water first, then decide if you want that snack.'],
        ['Yes, you deserve a small treat today.']
      ],
      binary: [
        ['Yes, food eaten while standing in the kitchen still counts.', 'Scientifically, cake is good for your mood.']
      ],
      general: [
        ['Life is too short to eat boring meals.', 'When in doubt, eat some snacks and take a nap.']
      ]
    }
  },
  {
    domain: 'school',
    regex: /\b(schools?|colleges?|exams?|studying|study|homework|professors?|assignments?|classes?|grades?|tests?|math|degrees?|finals|semesters?|essays?)\b/i,
    topics: {
      why: [
        ['Because the test has questions the teacher never mentioned.', 'You had two weeks to study, but waited until the night before.'],
        ['Because sitting in a quiet room for 3 hours is boring.', 'Nobody enjoys homework, but everyone has to do it.']
      ],
      how: [
        ['Open your book and actually read page 1.', 'Put your phone in another room so you stop watching videos.'],
        ['Start your homework now instead of waiting until midnight.', 'Ask a classmate for their notes and hope they are right.']
      ],
      what: [
        ['A 2-hour test designed to see what you forgot.', 'A paper you wrote at 3 AM while drinking energy drinks.'],
        ['Sitting at a desk trying to stay awake during morning class.']
      ],
      should: [
        ['Go to sleep. Studying all night will only make your brain tired.', 'Do your homework first, then play games guilt-free.']
      ],
      binary: [
        ['No, staring at the textbook does not count as studying.', 'Yes, you should start studying today.']
      ],
      general: [
        ['School is tough, but summer vacation is coming.', 'Just pass the test and move on with your life.']
      ]
    }
  },
  {
    domain: 'money',
    regex: /\b(money|rich|crypto|bitcoin|stocks?|investing|invest|rent|debt|dollars?|bank|millionaire|billionaire|broke|wallet|budget|taxes?)\b/i,
    topics: {
      why: [
        ['Because you bought small treats every day, and now you are broke.', 'Money disappears fast, but bills show up on time every month.'],
        ['Because things in stores cost more than you remember.', 'Your paycheck arrived on Friday and vanished by Saturday.']
      ],
      how: [
        ['Option 1: Win the lottery. Option 2: Keep working your job.', 'Stop buying things you do not need on the internet.'],
        ['Cook food at home instead of ordering takeout every night.', 'Save $5 a day and check back in 50 years.']
      ],
      what: [
        ['Paper money that flies away as soon as you enter a store.', 'Numbers on your banking app that always go down too quickly.'],
        ['A tool to buy food, pay rent, and occasionally buy silly things.']
      ],
      should: [
        ['Do not buy it if you have to check your balance three times first.', 'Save your money. Future you will thank you.'],
        ['If you cannot afford two of them, do not buy one.']
      ],
      binary: [
        ['No, the ATM is not broken; that is your real balance.', 'No, you will not become a billionaire by tomorrow.']
      ],
      general: [
        ['Having money is great. Being broke is not fun at all.', 'Spend less than you earn, and you will be fine.']
      ]
    }
  },
  {
    domain: 'existential',
    regex: /\b(meaning of life|purpose|destiny|why are we here|universe|happiness|exist|existence|alive|death|future|fate|reality|simulation)\b/i,
    topics: {
      why: [
        ['Because the universe wanted people who could laugh at silly memes.', 'Philosophers argued about this for thousands of years and still have no clue.'],
        ['Why not? You are here, so you might as well enjoy the ride.', 'Nobody was given an instruction book for life when they were born.']
      ],
      how: [
        ['Drink some water, eat good food, and do not worry so much.', 'Find joy in small things, like clean socks and extra sleep.'],
        ['Take a 20-minute nap. Everything feels better after a nap.', 'Accept that nobody really has everything figured out.']
      ],
      what: [
        ['A fun mystery where you get to eat pizza and hang out with friends.', 'The simple joy of living your life one day at a time.'],
        ['A game where you try your best and hope things turn out okay.']
      ],
      should: [
        ['Live in the present moment, especially when snacks are available.', 'Do not stress about the future. Focus on today.'],
        ['Be kind to yourself. You are doing just fine.']
      ],
      binary: [
        ['Maybe, but you still have to wake up and brush your teeth today.', 'The answer is 42, but that will not help you pay your bills.']
      ],
      general: [
        ['Life is simple: do what makes you happy and be nice.', 'You are made of stardust, so stop worrying about small mistakes.']
      ]
    }
  },
  {
    domain: 'animals',
    regex: /\b(dogs?|cats?|pets?|puppy|puppies|kittens?|birds?|animals?|bark(ing)?|meow(ing)?|vet|fishes?|fish|hamsters?)\b/i,
    topics: {
      why: [
        ['Because your cat thinks it is the ruler of the entire house.', 'Your dog thinks every doorbell ring is a major emergency.'],
        ['They are not ignoring you; they are just busy taking a nap.', 'Cats only listen when you open a can of food.']
      ],
      how: [
        ['Give them a treat right now and apologize for everything.', 'Do not move your leg if your pet is sleeping on it. That is the rule.'],
        ['Speak in a silly baby voice until your pet looks at you funny.', 'Accept defeat: the pet owns the house, you just buy the food.']
      ],
      what: [
        ['A fluffy little boss that you feed every single day.', 'A cute animal that can hear a snack bag open from another room.'],
        ['A bundle of fur that gives the best hugs when you are sad.']
      ],
      should: [
        ['Pet the animal immediately. They are waiting for you.', 'Yes, buy them the cute toy. They will play with the box instead.']
      ],
      binary: [
        ['Yes, the cat is looking at you and judging your life choices.', 'The dog loves you 100%, especially if you have snacks.']
      ],
      general: [
        ['Animals make life 10 times happier and a lot more fun.', 'The pet is in charge; you are just the assistant.']
      ]
    }
  },
  {
    domain: 'health_fitness',
    regex: /\b(gym|workouts?|sleep(ing)?|insomnia|tired|exercise|diet|muscles?|sore|abs|calories|running|weight|health)\b/i,
    topics: {
      why: [
        ['Because your muscles were surprised you decided to exercise today.', 'Leg day was hard, and now stairs are your worst enemy.'],
        ['Your bed feels 10 times more comfortable at 7 AM on a Monday.', 'Your brain decided 2 AM was the perfect time to think about random memories.']
      ],
      how: [
        ['Step 1: Put on gym clothes. Step 2: Lay down and take a nap.', 'Walk slowly on the treadmill while watching your favorite show.'],
        ['Drink a big glass of water and stretch your legs.', 'Do 5 jumping jacks, feel proud of yourself, and go eat lunch.']
      ],
      what: [
        ['A place where you lift heavy metal things and put them back down.', 'The 8 hours of sleep that you promised yourself you would get.'],
        ['Cardio: finding out how fast you get out of breath.']
      ],
      should: [
        ['Rest days are important. Go take a break.', 'Drink some water and lie flat on the floor. It feels great.'],
        ['Go for a short walk outside. Fresh air helps everything.']
      ],
      binary: [
        ['Yes, you are sore because you actually moved your body today.', 'Yes, getting 8 hours of sleep is good for you.']
      ],
      general: [
        ['Your body needs rest, good food, and a lot of water.', 'Take it easy on yourself. One step at a time.']
      ]
    }
  }
]

// Tone adjustments based on chosen personality
function applyPersonality(result, personality, subject) {
  const p = personality || 'savage'
  let { title, snippet, verdict } = result

  if (p === 'genz') {
    title = `Bro really asked about ${subject} 💀`
    snippet = `${snippet} No cap, bro is totally cooked.`
    verdict = 'Verdict: Bro is cooked 😭 • Go touch grass.'
  } else if (p === 'simple') {
    title = `The Plain Truth: ${subject}`
    snippet = `Here is the simple answer: ${snippet}`
    verdict = 'Verdict: Keep it simple and do not overthink.'
  } else if (p === 'professor') {
    title = `Simple Lesson: ${subject}`
    snippet = `Teacher's note: ${snippet} That is all you need to know.`
    verdict = 'Grade: F- • Go study and take a nap.'
  } else if (p === 'mystic') {
    title = `The Stars Say: ${subject}`
    snippet = `The universe whispers: ${snippet} The stars advise you to rest.`
    verdict = 'Advice: Trust your gut and drink some water.'
  } else if (p === 'corporate') {
    title = `Office Note: ${subject}`
    snippet = `Quick update: ${snippet} Let us solve this by logging off early.`
    verdict = 'Action Item: Meeting canceled, go home.'
  } else {
    // Savage default
    if (!verdict) {
      verdict = 'Verdict: Close your laptop and go touch grass.'
    }
  }

  return { title, snippet, verdict }
}

export function generateFallbackResults(query, count = 1, personality = 'savage') {
  const cleanQ = (query || '').trim()
  const seed = hashSeed(cleanQ.toLowerCase() + personality)
  const subject = cleanSubject(cleanQ)
  const intent = detectIntent(cleanQ)

  // Find matching domain
  const matched = domainMatchers.find(d => d.regex.test(cleanQ))

  let baseTitle = ''
  let baseSnippet = ''

  if (matched) {
    const pool = matched.topics[intent] || matched.topics.general || matched.topics.why
    const pair = pool[seed % pool.length]
    baseTitle = pair[0]
    baseSnippet = pair[1]
  } else {
    // Universal dynamic fallbacks that directly inject the user's subject!
    const universalFallbacks = {
      why: [
        [`Why ${subject} makes no sense at all`, `The universe looked at ${subject} and decided it was too confusing to explain.`],
        [`The simple truth about ${subject}`, `Three smart people studied ${subject}, got confused, and went to eat tacos instead.`],
        [`Because ${subject} has a mind of its own`, `If ${subject} was easy to understand, nobody would be searching for it.`]
      ],
      how: [
        [`How to handle ${subject} in 3 simple steps`, `Step 1: Try your best. Step 2: Get confused. Step 3: Ask a friend for help.`],
        [`The easiest way to deal with ${subject}`, `Pretend you know what you are doing until someone else fixes it.`],
        [`A quick guide to ${subject}`, `Take a deep breath, close your eyes, and hope for the best.`]
      ],
      what: [
        [`The simple answer to ${subject}`, `A question that sounds simple until you actually try to answer it.`],
        [`What ${subject} really means`, `It means you have too much free time and need a new hobby.`],
        [`The real story of ${subject}`, `Something that looks easy on paper, but turns into a mess in real life.`]
      ],
      should: [
        [`Should you do ${subject}? Probably not.`, `Think about it for 5 minutes. If it sounds like a bad idea, do not do it.`],
        [`Our honest advice on ${subject}`, `Save your time and energy. Go watch a funny movie instead.`]
      ],
      binary: [
        [`The short answer to ${subject} is no.`, `Even the computer is confused by this question.`],
        [`Yes, but only in your dreams.`, `In real life, this is not going to happen.`]
      ],
      general: [
        [`The quick truth about ${subject}`, `We looked at ${subject} from every side and found zero good answers.`],
        [`Regarding ${subject}: Good luck!`, `This is one of those questions where the best answer is to go take a nap.`]
      ]
    }

    const pool = universalFallbacks[intent] || universalFallbacks.general
    const pair = pool[seed % pool.length]
    baseTitle = pair[0]
    baseSnippet = pair[1]
  }

  // Comedic stats
  const usefulnessPercent = Math.max(0, (seed % 9)).toFixed(1) + '%'
  const brainDrainPercent = (70 + (seed % 29)) + '%'

  return Array.from({ length: count }, () => {
    const { title, snippet, verdict } = applyPersonality(
      { title: baseTitle, snippet: baseSnippet, verdict: '' },
      personality,
      subject
    )

    return {
      title,
      snippet,
      url: `idk://answers/${encodeURIComponent(subject.slice(0, 20))}`,
      verdict,
      stats: {
        usefulness: usefulnessPercent,
        confidence: '100%',
        brainDrain: brainDrainPercent,
        subject
      },
      source: 'offline-smart-engine'
    }
  })
}

