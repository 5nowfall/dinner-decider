'use strict';
/*
 * Dish database. Base quantities are for 2 servings.
 * ing: [name, qty, unit, isStaple?]  — "singular|plural" names are pluralised automatically.
 * steps: [text, timerSeconds?, timerLabel?]
 * m: animal-derived ingredients the dish contains (drives the diet filters).
 */
const RICE_ING = ['jasmine rice (uncooked)', 1, 'cup'];
const RICE_STEP = [
  'Start the rice first: rinse it until the water runs mostly clear, add 1½ cups of water for every cup of rice, bring to a boil, cover and cook on the lowest heat for 15 minutes, then switch off and leave it covered. Keep prepping while it cooks.',
  1200, 'Rice ready'
];

const DISHES = [
  {
    id: 'nasi-goreng', n: 'Nasi Goreng Kampung', e: '🍳', c: 'Malaysian', t: 25, m: ['egg', 'seafood'],
    ing: [['day-old cooked rice', 3, 'cup'], ['egg|eggs', 2, ''], ['ikan bilis (dried anchovies)', 3, 'tbsp'],
      ['shallot|shallots', 3, ''], ['garlic clove|garlic cloves', 3, ''], ['red chilli|red chillies', 2, ''],
      ['sweet soy sauce (kecap manis)', 1.5, 'tbsp'], ['light soy sauce', 1, 'tbsp'],
      ['kangkung or spinach, chopped', 1, 'cup'], ['cooking oil', 2, 'tbsp', 1], ['salt', 0, '', 1]],
    steps: [
      ['Finely chop the shallots, garlic and chillies (or blitz into a rough paste). Rinse the ikan bilis and pat it dry.'],
      ['Heat the oil in a wok over medium-high heat and fry the ikan bilis for about 2 minutes until crisp. Scoop out and set aside.', 120, 'Ikan bilis crisp'],
      ['In the same oil, fry the shallot, garlic and chilli paste for 3 minutes until fragrant.', 180, 'Paste fragrant'],
      ['Push the paste to one side, crack in the eggs and scramble until just set, about 1 minute.', 60, 'Eggs scrambled'],
      ['Add the rice, breaking up any clumps. Pour in both soy sauces and stir-fry on high heat for 4 minutes.', 240, 'Rice fried'],
      ['Toss in the greens for 1 minute until just wilted. Taste, add salt if needed, and top with the crispy ikan bilis.', 60, 'Greens wilted']
    ]
  },
  {
    id: 'egg-fried-rice', n: 'Egg Fried Rice', e: '🍚', c: 'Chinese', t: 15, m: ['egg'],
    ing: [['day-old cooked rice', 3, 'cup'], ['egg|eggs', 3, ''], ['spring onion|spring onions', 2, ''],
      ['garlic clove|garlic cloves', 2, ''], ['frozen peas and carrots', 0.5, 'cup'], ['soy sauce', 1.5, 'tbsp'],
      ['sesame oil', 1, 'tsp'], ['cooking oil', 2, 'tbsp', 1], ['white pepper', 0.25, 'tsp', 1], ['salt', 0, '', 1]],
    steps: [
      ['Beat the eggs with a pinch of salt. Slice the spring onions, keeping the whites and greens separate. Mince the garlic.'],
      ['Heat the oil in a wok on high. Pour in the eggs, scramble for about 45 seconds until just set, then tip onto a plate.', 45, 'Eggs scrambled'],
      ['Add the garlic and spring onion whites for 30 seconds, then the peas and carrots for 2 minutes.', 150, 'Veg cooked'],
      ['Add the rice and press and stir for 3 minutes until hot and some grains turn golden.', 180, 'Rice hot'],
      ['Add the soy sauce, sesame oil, pepper and the eggs. Toss for 1 minute, then finish with the spring onion greens.', 60, 'Finish']
    ]
  },
  {
    id: 'chicken-curry', n: 'Malaysian-Style Chicken & Potato Curry', e: '🍛', c: 'Malaysian', t: 50, m: ['chicken'],
    ing: [['boneless chicken thighs', 400, 'g'], ['potato|potatoes', 2, ''], ['onion|onions', 1, ''],
      ['garlic clove|garlic cloves', 3, ''], ['fresh ginger, grated', 1, 'tbsp'], ['meat curry powder', 2, 'tbsp'],
      ['coconut milk', 200, 'ml'], ['tomato|tomatoes', 1, ''], ['water', 200, 'ml', 1], ['cooking oil', 2, 'tbsp', 1],
      ['salt', 0, '', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Cut the chicken into bite-size pieces and the potatoes into chunks. Dice the onion, mince the garlic, and wedge the tomato.'],
      ['Heat the oil in a pot and cook the onion for 5 minutes until soft and golden.', 300, 'Onion soft'],
      ['Mix the curry powder with 3 tablespoons of water to a paste. Add it with the garlic and ginger and fry for 2 minutes.', 120, 'Paste fried'],
      ['Add the chicken and stir to coat. Cook for 3 minutes.', 180, 'Chicken coated'],
      ['Add the potatoes, tomato and the water. Bring to a boil, cover and simmer for 20 minutes.', 1200, 'Curry simmering'],
      ['Stir in the coconut milk and simmer uncovered for 5 minutes until thick. Check the chicken is cooked through (no pink), season with salt, and serve over rice.', 300, 'Curry thickened']
    ]
  },
  {
    id: 'mee-goreng', n: 'Mee Goreng', e: '🍜', c: 'Malaysian', t: 25, m: ['egg'],
    ing: [['yellow noodles', 250, 'g'], ['egg|eggs', 2, ''], ['firm tofu', 100, 'g'], ['onion|onions', 1, ''],
      ['garlic clove|garlic cloves', 2, ''], ['tomato|tomatoes', 1, ''], ['leafy greens (choy sum, spinach)', 1, 'cup'],
      ['chilli paste', 1, 'tbsp'], ['tomato ketchup', 2, 'tbsp'], ['soy sauce', 1, 'tbsp'], ['sweet soy sauce', 1, 'tbsp'],
      ['lime|limes', 0.5, ''], ['cooking oil', 2, 'tbsp', 1]],
    steps: [
      ['Soak or blanch the noodles in boiling water for about 1 minute, then drain well. Cube the tofu, slice the onion and garlic, and cut the tomato into wedges.', 60, 'Noodles blanched'],
      ['Fry the tofu in oil for 4 minutes until golden. Remove and set aside.', 240, 'Tofu golden'],
      ['Fry the onion and garlic for 2 minutes.', 120, 'Onion fried'],
      ['Stir in the chilli paste, ketchup, both soy sauces and the tomato for 1 minute.', 60, 'Sauce cooked'],
      ['Push everything aside, add the eggs and scramble for 1 minute.', 60, 'Eggs scrambled'],
      ['Add the noodles, tofu and greens. Toss on high heat for 3 minutes. Squeeze over the lime and serve.', 180, 'Noodles tossed']
    ]
  },
  {
    id: 'garlic-greens', n: 'Garlic Stir-Fried Greens & Rice', e: '🥬', c: 'Chinese', t: 25, m: [],
    ing: [['leafy greens (kangkung, bok choy, choy sum)', 300, 'g'], ['garlic clove|garlic cloves', 4, ''],
      ['red chilli|red chillies', 1, ''], ['soy sauce', 1, 'tbsp'], ['sugar', 0.5, 'tsp', 1], ['cooking oil', 1.5, 'tbsp', 1],
      ['salt', 0, '', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Wash the greens well and cut into 5 cm lengths, separating thick stems from leaves. Slice the garlic and chilli.'],
      ['Heat the oil in a wok on high. Fry the garlic and chilli for 30 seconds until fragrant but not browned.', 30, 'Garlic fragrant'],
      ['Add the stems and stir-fry for 1 minute, then the leaves for 1 more minute.', 120, 'Greens cooking'],
      ['Add the soy sauce and sugar, toss for 30 seconds, taste and add salt if needed. Serve over the rice.', 30, 'Finish']
    ]
  },
  {
    id: 'tomato-egg', n: 'Tomato & Egg Stir-Fry', e: '🍅', c: 'Chinese', t: 25, m: ['egg'],
    ing: [['egg|eggs', 4, ''], ['tomato|tomatoes', 3, ''], ['spring onion|spring onions', 2, ''], ['sugar', 1, 'tsp', 1],
      ['cooking oil', 2, 'tbsp', 1], ['salt', 0, '', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Beat the eggs with a pinch of salt. Cut the tomatoes into wedges and slice the spring onions.'],
      ['Heat 1 tablespoon of oil in a wok on high. Pour in the eggs and let them puff for 20 seconds, then break into large curds. Remove while still slightly wet.', 40, 'Eggs set'],
      ['Add the remaining oil and the tomatoes. Cook for 3 minutes, pressing to release the juice.', 180, 'Tomatoes softened'],
      ['Stir in the sugar and a pinch of salt, return the eggs and fold for 1 minute. Top with spring onion and serve over rice.', 60, 'Combine']
    ]
  },
  {
    id: 'mapo-tofu', n: 'Mapo Tofu (Meat-Free)', e: '🌶️', c: 'Chinese', t: 30, m: [],
    ing: [['soft tofu', 400, 'g'], ['doubanjiang (chilli bean paste)', 1.5, 'tbsp'], ['garlic clove|garlic cloves', 3, ''],
      ['fresh ginger, minced', 1, 'tbsp'], ['spring onion|spring onions', 2, ''], ['soy sauce', 1, 'tbsp'],
      ['cornstarch', 1, 'tbsp'], ['vegetable stock or water', 150, 'ml'], ['ground Sichuan pepper', 0.5, 'tsp'],
      ['cooking oil', 1.5, 'tbsp', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Cut the tofu into 2 cm cubes and slide into hot (not boiling) salted water for 3 minutes to firm it up, then drain gently. Mix the cornstarch with 3 tablespoons of cold water.', 180, 'Tofu blanched'],
      ['Heat the oil in a wok on medium. Fry the doubanjiang for 1 minute until the oil turns red, then add the garlic and ginger for 30 seconds.', 90, 'Paste fried'],
      ['Pour in the stock and soy sauce and bring to a simmer. Add the tofu and simmer gently for 5 minutes, pushing rather than stirring so it keeps its shape.', 300, 'Tofu simmering'],
      ['Stir the cornstarch mix again, pour in and cook for 1 minute until glossy. Finish with the Sichuan pepper and spring onion. Serve over rice.', 60, 'Sauce thickened']
    ]
  },
  {
    id: 'teriyaki-chicken', n: 'Teriyaki Chicken Rice Bowl', e: '🍱', c: 'Japanese', t: 30, m: ['chicken'],
    ing: [['boneless skinless chicken thighs', 350, 'g'], ['soy sauce', 3, 'tbsp'], ['mirin', 2, 'tbsp'], ['honey', 1, 'tbsp'],
      ['garlic clove|garlic cloves', 2, ''], ['fresh ginger, grated', 1, 'tsp'], ['broccoli florets', 200, 'g'],
      ['sesame seeds', 1, 'tsp'], ['cooking oil', 1, 'tbsp', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Mix the soy sauce, mirin, honey, garlic and ginger to make the sauce. Cut the chicken into bite-size pieces.'],
      ['Steam or microwave the broccoli with a splash of water for 3 minutes until bright green and just tender.', 180, 'Broccoli steamed'],
      ['Heat the oil in a large pan over medium-high heat. Sear the chicken for 4 minutes without moving it, then turn and cook 3 more minutes.', 420, 'Chicken seared'],
      ['Pour in the sauce and simmer for 2 to 3 minutes until glossy and the chicken is cooked through (no pink).', 150, 'Glaze thickened'],
      ['Serve the chicken and broccoli over rice, spooning over the sauce and sprinkling with sesame seeds.']
    ]
  },
  {
    id: 'oyakodon', n: 'Oyakodon (Chicken & Egg Rice Bowl)', e: '🥚', c: 'Japanese', t: 30, m: ['chicken', 'egg'],
    ing: [['boneless chicken thighs', 250, 'g'], ['onion|onions', 1, ''], ['egg|eggs', 3, ''], ['soy sauce', 2, 'tbsp'],
      ['mirin', 2, 'tbsp'], ['sugar', 1, 'tsp', 1], ['water or dashi', 150, 'ml', 1], ['spring onion|spring onions', 1, ''], RICE_ING],
    steps: [
      RICE_STEP,
      ['Thinly slice the onion and cut the chicken into small bite-size pieces. Lightly beat the eggs (do not over-mix).'],
      ['In a wide pan, simmer the water or dashi, soy sauce, mirin, sugar and onion for 3 minutes.', 180, 'Onion softened'],
      ['Add the chicken and simmer for 6 minutes, until cooked through with no pink inside.', 360, 'Chicken cooked'],
      ['Pour half the egg over the chicken, cover and cook for 1 minute. Pour in the rest, cover and cook 30 seconds more, until just softly set.', 90, 'Eggs set'],
      ['Slide everything over a bowl of rice and top with sliced spring onion.']
    ]
  },
  {
    id: 'salmon-rice', n: 'Pan-Seared Salmon, Rice & Greens', e: '🐟', c: 'Western', t: 25, m: ['seafood'],
    ing: [['salmon fillet|salmon fillets', 2, ''], ['soy sauce', 1, 'tbsp'], ['lemon|lemons', 0.5, ''],
      ['garlic clove|garlic cloves', 1, ''], ['broccoli or green beans', 200, 'g'], ['cooking oil', 1, 'tbsp', 1],
      ['salt', 0, '', 1], ['black pepper', 0, '', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Pat the salmon very dry and season with salt and pepper. Mince the garlic and cut the greens into pieces.'],
      ['Steam or microwave the greens for 3 minutes until just tender.', 180, 'Greens steamed'],
      ['Heat the oil in a non-stick pan over medium-high. Place the salmon skin-side down and cook for 4 minutes without moving it.', 240, 'Skin side done'],
      ['Flip and cook for 3 more minutes, until the flesh is opaque and flakes easily (about 63 °C / 145 °F inside).', 180, 'Salmon flipped'],
      ['Add the garlic, soy sauce and a squeeze of lemon to the pan for the last 30 seconds. Serve with rice and greens.', 30, 'Finish']
    ]
  },
  {
    id: 'kimchi-fried-rice', n: 'Kimchi Fried Rice', e: '🥘', c: 'Korean', t: 15, m: ['egg', 'seafood'],
    ing: [['day-old cooked rice', 3, 'cup'], ['kimchi, chopped', 1, 'cup'], ['kimchi juice', 2, 'tbsp'], ['egg|eggs', 2, ''],
      ['spring onion|spring onions', 2, ''], ['gochujang', 1, 'tbsp'], ['sesame oil', 1, 'tsp'], ['cooking oil', 1, 'tbsp', 1]],
    steps: [
      ['Chop the kimchi and slice the spring onions.'],
      ['Heat the oil in a large pan on medium-high and fry the kimchi for 3 minutes until it softens and the edges caramelise.', 180, 'Kimchi fried'],
      ['Add the gochujang, kimchi juice and rice. Stir-fry for 3 minutes until hot and lightly crisp in places.', 180, 'Rice fried'],
      ['In another pan, fry the eggs sunny-side up for 2 to 3 minutes.', 150, 'Eggs fried'],
      ['Plate the rice, drizzle with sesame oil, and top with the eggs and spring onion.']
    ]
  },
  {
    id: 'basil-chicken', n: 'Thai Basil Chicken (Pad Kra Pao)', e: '🌿', c: 'Thai', t: 25, m: ['chicken', 'egg', 'seafood'],
    ing: [['minced chicken', 300, 'g'], ['garlic clove|garlic cloves', 5, ''], ['bird\'s eye chilli|bird\'s eye chillies', 3, ''],
      ['Thai or holy basil leaves', 1, 'cup'], ['oyster sauce', 1, 'tbsp'], ['soy sauce', 1, 'tbsp'], ['fish sauce', 1, 'tbsp'],
      ['sugar', 1, 'tsp', 1], ['egg|eggs', 2, ''], ['cooking oil', 3, 'tbsp', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Roughly pound or finely chop the garlic and chillies together. Mix the oyster, soy and fish sauces with the sugar.'],
      ['Heat 1 tablespoon of oil in a wok on high. Fry the garlic and chilli for 30 seconds.', 30, 'Garlic fragrant'],
      ['Add the chicken and stir-fry for 4 minutes, breaking it up, until cooked through with no pink.', 240, 'Chicken cooked'],
      ['Pour in the sauce mix and cook 1 minute. Turn off the heat and fold in the basil until just wilted.', 60, 'Sauce cooked'],
      ['In a separate pan, fry the eggs in the remaining hot oil for 2 minutes until the edges are crispy. Serve everything over rice.', 120, 'Eggs fried']
    ]
  },
  {
    id: 'green-curry', n: 'Thai Green Chicken Curry', e: '🥥', c: 'Thai', t: 40, m: ['chicken', 'seafood'],
    ing: [['chicken breast or thigh', 300, 'g'], ['Thai green curry paste', 2, 'tbsp'], ['coconut milk', 400, 'ml'],
      ['water', 100, 'ml', 1], ['mixed vegetables (zucchini, green beans, bell pepper)', 2, 'cup'], ['fish sauce', 1, 'tbsp'],
      ['sugar', 1, 'tsp', 1], ['basil leaves', 0.5, 'cup'], RICE_ING],
    steps: [
      RICE_STEP,
      ['Slice the chicken thinly and chop the vegetables into bite-size pieces.'],
      ['Spoon about a third of the coconut milk into a pot over medium heat, add the curry paste and fry for 2 minutes until fragrant.', 120, 'Paste fried'],
      ['Add the chicken and stir for 3 minutes until the outside turns white.', 180, 'Chicken sealed'],
      ['Pour in the remaining coconut milk and the water. Simmer gently for 8 minutes.', 480, 'Curry simmering'],
      ['Add the vegetables and simmer 5 more minutes until tender and the chicken is cooked through (no pink).', 300, 'Veg tender'],
      ['Season with fish sauce and sugar, stir in the basil and serve over rice.']
    ]
  },
  {
    id: 'dal-tadka', n: 'Dal Tadka', e: '🍲', c: 'Indian', t: 40, m: [],
    ing: [['red lentils (masoor dal)', 1, 'cup'], ['water', 3, 'cup', 1], ['turmeric', 0.5, 'tsp'], ['onion|onions', 1, ''],
      ['tomato|tomatoes', 1, ''], ['garlic clove|garlic cloves', 4, ''], ['fresh ginger, grated', 1, 'tbsp'],
      ['cumin seeds', 1, 'tsp'], ['chilli powder', 0.5, 'tsp'], ['garam masala', 0.5, 'tsp'], ['lemon|lemons', 0.5, ''],
      ['cooking oil', 2, 'tbsp', 1], ['salt', 0, '', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Rinse the lentils until the water runs clear. Boil them with the water and turmeric, then simmer partly covered for 20 minutes, skimming any foam, until soft and creamy.', 1200, 'Lentils soft'],
      ['Meanwhile, dice the onion and tomato and mince the garlic. Heat the oil in a pan and fry the cumin seeds for 30 seconds until they sizzle.', 30, 'Cumin sizzling'],
      ['Add the onion and cook 5 minutes until golden, then the garlic and ginger for 1 minute.', 360, 'Onion golden'],
      ['Add the tomato, chilli powder and garam masala and cook 4 minutes until it breaks down into a paste.', 240, 'Masala cooked'],
      ['Stir the masala into the lentils, simmer 3 minutes, season with salt and a squeeze of lemon, and serve with rice.', 180, 'Dal simmered']
    ]
  },
  {
    id: 'chana-masala', n: 'Chana Masala', e: '🫘', c: 'Indian', t: 35, m: [],
    ing: [['canned chickpeas, drained', 400, 'g'], ['onion|onions', 1, ''], ['garlic clove|garlic cloves', 3, ''],
      ['fresh ginger, grated', 1, 'tbsp'], ['canned chopped tomatoes', 200, 'g'], ['cumin powder', 1, 'tsp'],
      ['coriander powder', 1, 'tsp'], ['garam masala', 1, 'tsp'], ['turmeric', 0.5, 'tsp'], ['chilli powder', 0.5, 'tsp'],
      ['water', 100, 'ml', 1], ['lemon|lemons', 0.5, ''], ['cooking oil', 2, 'tbsp', 1], ['salt', 0, '', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Finely chop the onion and mince the garlic. Drain and rinse the chickpeas.'],
      ['Heat the oil and cook the onion for 6 minutes until deep golden.', 360, 'Onion golden'],
      ['Add the garlic and ginger for 1 minute, then all the spices for 30 seconds.', 90, 'Spices toasted'],
      ['Add the tomatoes and cook for 5 minutes until the oil separates from the sauce.', 300, 'Sauce reduced'],
      ['Add the chickpeas and water. Simmer 10 minutes, lightly mashing a few chickpeas to thicken. Season with salt and lemon.', 600, 'Chickpeas simmered']
    ]
  },
  {
    id: 'butter-chicken', n: 'Easy Butter Chicken', e: '🧈', c: 'Indian', t: 55, m: ['chicken', 'dairy'],
    ing: [['boneless chicken thighs', 400, 'g'], ['plain yogurt', 3, 'tbsp'], ['garam masala', 2, 'tsp'], ['chilli powder', 1, 'tsp'],
      ['garlic clove|garlic cloves', 4, ''], ['fresh ginger, grated', 1, 'tbsp'], ['onion|onions', 1, ''],
      ['tomato passata', 200, 'ml'], ['butter', 2, 'tbsp'], ['cream', 100, 'ml'], ['sugar', 1, 'tsp', 1], ['salt', 0, '', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Cut the chicken into chunks and mix with the yogurt, 1 teaspoon garam masala, the chilli powder, half the garlic and a pinch of salt. Leave to marinate.', 600, 'Marinating'],
      ['Melt the butter in a pan and cook the finely diced onion for 5 minutes until soft.', 300, 'Onion soft'],
      ['Add the remaining garlic, the ginger and remaining garam masala for 1 minute, then the passata. Simmer for 10 minutes.', 660, 'Sauce simmering'],
      ['In another pan, cook the marinated chicken over medium-high heat for 6 minutes, turning, until browned.', 360, 'Chicken browned'],
      ['Add the chicken to the sauce with the sugar and simmer 10 minutes. Make sure the chicken is cooked through (no pink).', 600, 'Chicken simmered'],
      ['Stir in the cream, warm through for 1 minute, taste for salt and serve over rice.', 60, 'Finish']
    ]
  },
  {
    id: 'aglio-olio', n: 'Spaghetti Aglio e Olio', e: '🍝', c: 'Italian', t: 20, m: [],
    ing: [['spaghetti', 200, 'g'], ['garlic clove|garlic cloves', 5, ''], ['chilli flakes', 0.5, 'tsp'], ['olive oil', 4, 'tbsp'],
      ['fresh parsley, chopped', 2, 'tbsp'], ['salt', 0, '', 1]],
    steps: [
      ['Bring a large pot of well-salted water to a boil. Cook the spaghetti for 1 minute less than the pack says (about 9 minutes). Reserve a cup of pasta water before draining.', 540, 'Pasta nearly done'],
      ['While it cooks, slice the garlic thinly. Warm the oil in a large pan over low heat and cook the garlic for about 2 minutes until pale gold. Do not let it brown.', 120, 'Garlic golden'],
      ['Add the chilli flakes for 15 seconds, then add the drained pasta and a splash of pasta water.'],
      ['Toss vigorously for 1 minute until the sauce coats the pasta. Add parsley and serve right away.', 60, 'Toss']
    ]
  },
  {
    id: 'bolognese', n: 'Spaghetti Bolognese', e: '🍝', c: 'Italian', t: 50, m: ['beef', 'dairy'],
    ing: [['spaghetti', 200, 'g'], ['minced beef', 250, 'g'], ['onion|onions', 1, ''], ['carrot|carrots', 1, ''],
      ['garlic clove|garlic cloves', 3, ''], ['canned chopped tomatoes', 400, 'g'], ['tomato paste', 1, 'tbsp'],
      ['dried oregano', 1, 'tsp'], ['grated parmesan (optional)', 2, 'tbsp'], ['olive oil', 1, 'tbsp', 1], ['salt', 0, '', 1], ['black pepper', 0, '', 1]],
    steps: [
      ['Finely dice the onion and carrot, and mince the garlic.'],
      ['Heat the oil in a pot and cook the onion and carrot for 5 minutes until soft, adding the garlic for the last minute.', 300, 'Veg softened'],
      ['Add the beef and brown for 6 minutes, breaking it up, until no pink remains.', 360, 'Beef browned'],
      ['Stir in the tomato paste for 1 minute, then add the tomatoes, oregano, salt and pepper. Simmer for 20 minutes, stirring now and then.', 1260, 'Sauce simmering'],
      ['Cook the spaghetti in well-salted boiling water for 10 minutes (or per the pack), then drain.', 600, 'Pasta done'],
      ['Toss the pasta with the sauce and top with parmesan.']
    ]
  },
  {
    id: 'mushroom-pasta', n: 'Creamy Mushroom Pasta', e: '🍄', c: 'Italian', t: 25, m: ['dairy'],
    ing: [['penne or fusilli', 200, 'g'], ['mushrooms, sliced', 250, 'g'], ['garlic clove|garlic cloves', 3, ''], ['cream', 150, 'ml'],
      ['grated parmesan', 3, 'tbsp'], ['butter', 1, 'tbsp'], ['fresh parsley or thyme', 1, 'tbsp'], ['salt', 0, '', 1], ['black pepper', 0, '', 1]],
    steps: [
      ['Cook the pasta in well-salted boiling water for about 10 minutes. Keep a cup of the pasta water, then drain.', 600, 'Pasta done'],
      ['Meanwhile, heat a large dry pan over high heat. Add the mushrooms in a single layer and cook for 5 minutes without stirring much, until golden.', 300, 'Mushrooms golden'],
      ['Lower the heat, add the butter and garlic and cook for 1 minute.', 60, 'Garlic cooked'],
      ['Pour in the cream, season and simmer for 3 minutes until slightly thickened.', 180, 'Cream thickened'],
      ['Toss in the pasta, parmesan and a splash of pasta water until silky. Finish with herbs and black pepper.']
    ]
  },
  {
    id: 'quesadillas', n: 'Chicken & Pepper Quesadillas', e: '🧀', c: 'Mexican', t: 25, m: ['chicken', 'dairy'],
    ing: [['large flour tortillas', 4, ''], ['cooked chicken, shredded (leftover or rotisserie)', 200, 'g'],
      ['grated cheese (cheddar or mozzarella)', 150, 'g'], ['bell pepper|bell peppers', 1, ''], ['ground cumin', 0.5, 'tsp'],
      ['salsa', 4, 'tbsp'], ['cooking oil', 1, 'tbsp', 1]],
    steps: [
      ['Slice the pepper into thin strips. If your chicken is raw, dice it and cook it through in the pan first (about 7 minutes) until no pink remains.'],
      ['Cook the pepper in the oil with the cumin for 4 minutes until soft. Tip into a bowl and wipe the pan.', 240, 'Pepper soft'],
      ['Scatter cheese, chicken and pepper over half of each tortilla and fold over.'],
      ['Cook each quesadilla in a dry pan on medium heat, about 2 to 3 minutes per side, until golden and the cheese has melted.', 150, 'Side cooked'],
      ['Cut into wedges and serve with the salsa.']
    ]
  },
  {
    id: 'black-bean-tacos', n: 'Black Bean & Avocado Tacos', e: '🌮', c: 'Mexican', t: 25, m: [],
    ing: [['small tortillas', 6, ''], ['canned black beans, drained', 400, 'g'], ['onion|onions', 1, ''],
      ['garlic clove|garlic cloves', 2, ''], ['ground cumin', 1, 'tsp'], ['smoked paprika', 1, 'tsp'], ['avocado|avocados', 1, ''],
      ['lime|limes', 1, ''], ['tomato|tomatoes', 1, ''], ['fresh coriander', 1, 'tbsp'], ['cooking oil', 1, 'tbsp', 1], ['salt', 0, '', 1]],
    steps: [
      ['Dice the onion and tomato, mince the garlic and drain the beans.'],
      ['Cook the onion in the oil for 4 minutes until soft.', 240, 'Onion soft'],
      ['Add the garlic, cumin and paprika for 30 seconds, then the beans with 50 ml water. Cook 5 minutes, lightly mashing, until thick.', 330, 'Beans cooked'],
      ['Mash the avocado with the juice of the lime and a pinch of salt. Mix the tomato with the coriander.'],
      ['Warm the tortillas in a dry pan for 30 seconds per side, then fill with beans, avocado and tomato.', 30, 'Warm tortillas']
    ]
  },
  {
    id: 'beef-tacos', n: 'Beef Tacos', e: '🌮', c: 'Mexican', t: 25, m: ['beef', 'dairy'],
    ing: [['small tortillas', 6, ''], ['minced beef', 300, 'g'], ['onion|onions', 1, ''], ['ground cumin', 1, 'tsp'],
      ['paprika', 1, 'tsp'], ['chilli powder', 0.5, 'tsp'], ['garlic powder', 0.5, 'tsp'], ['shredded lettuce', 1, 'cup'],
      ['tomato|tomatoes', 1, ''], ['grated cheese', 60, 'g'], ['salt', 0, '', 1]],
    steps: [
      ['Dice the onion and tomato and shred the lettuce.'],
      ['Brown the beef with the onion in a pan over medium-high heat for 7 minutes, breaking it up, until no pink remains. Spoon off excess fat.', 420, 'Beef browned'],
      ['Add the spices, a pinch of salt and 50 ml water. Simmer for 3 minutes until saucy.', 180, 'Spiced beef'],
      ['Warm the tortillas in a dry pan, then fill with the beef, lettuce, tomato and cheese.']
    ]
  },
  {
    id: 'shakshuka', n: 'Shakshuka', e: '🍳', c: 'Middle Eastern', t: 35, m: ['egg'],
    ing: [['egg|eggs', 4, ''], ['canned chopped tomatoes', 400, 'g'], ['onion|onions', 1, ''], ['bell pepper|bell peppers', 1, ''],
      ['garlic clove|garlic cloves', 3, ''], ['ground cumin', 1, 'tsp'], ['paprika', 1, 'tsp'], ['chilli flakes', 0.25, 'tsp'],
      ['bread, to serve', 4, 'slices'], ['cooking oil', 2, 'tbsp', 1], ['salt', 0, '', 1]],
    steps: [
      ['Dice the onion and pepper and mince the garlic.'],
      ['Heat the oil in a wide pan with a lid. Cook the onion and pepper for 6 minutes until soft.', 360, 'Veg soft'],
      ['Add the garlic and spices for 1 minute, then the tomatoes and a pinch of salt. Simmer for 8 minutes until thick.', 540, 'Sauce thick'],
      ['Make 4 wells in the sauce and crack an egg into each. Cover and cook on low for 6 to 8 minutes, until the whites are set.', 420, 'Eggs poaching'],
      ['Serve straight from the pan with the bread for dipping.']
    ]
  },
  {
    id: 'veggie-omelette', n: 'Veggie Omelette & Toast', e: '🥪', c: 'Western', t: 15, m: ['egg', 'dairy'],
    ing: [['egg|eggs', 4, ''], ['mushrooms, sliced', 100, 'g'], ['tomato|tomatoes', 1, ''], ['baby spinach', 1, 'cup'],
      ['grated cheese', 40, 'g'], ['bread', 4, 'slices'], ['butter', 1, 'tbsp'], ['salt', 0, '', 1], ['black pepper', 0, '', 1]],
    steps: [
      ['Slice the mushrooms, dice the tomato and beat the eggs with salt and pepper.'],
      ['Melt half the butter in a non-stick pan. Cook the mushrooms for 3 minutes, add the tomato and spinach for 1 minute, then tip onto a plate.', 240, 'Veg cooked'],
      ['Melt the remaining butter and pour in the eggs. Cook on medium for 2 minutes, lifting the edges, until nearly set.', 120, 'Eggs nearly set'],
      ['Add the veg and cheese to one half, fold over and cook 1 more minute. Serve with toast.', 60, 'Cheese melted']
    ]
  },
  {
    id: 'grilled-cheese-soup', n: 'Grilled Cheese & Tomato Soup', e: '🥫', c: 'Western', t: 35, m: ['dairy'],
    ing: [['bread', 4, 'slices'], ['cheddar, sliced or grated', 100, 'g'], ['butter', 2, 'tbsp'], ['canned chopped tomatoes', 400, 'g'],
      ['onion|onions', 0.5, ''], ['garlic clove|garlic cloves', 1, ''], ['vegetable stock', 200, 'ml'], ['olive oil', 1, 'tbsp', 1],
      ['salt', 0, '', 1], ['black pepper', 0, '', 1]],
    steps: [
      ['Dice the onion and mince the garlic.'],
      ['Soften the onion in the olive oil for 4 minutes, add the garlic for 30 seconds.', 270, 'Onion soft'],
      ['Add the tomatoes and stock and simmer for 12 minutes.', 720, 'Soup simmering'],
      ['Blend the soup until smooth, taking care with the hot liquid (blend in small batches with the lid vented). Season to taste.'],
      ['Butter the outside of the bread, fill with cheese and cook in a pan on medium-low for 3 minutes per side until golden and melted.', 180, 'Side one done']
    ]
  },
  {
    id: 'garlic-shrimp', n: 'Garlic Butter Shrimp & Rice', e: '🍤', c: 'Western', t: 25, m: ['seafood', 'dairy'],
    ing: [['peeled shrimp', 300, 'g'], ['butter', 2, 'tbsp'], ['garlic clove|garlic cloves', 5, ''], ['lemon|lemons', 0.5, ''],
      ['fresh parsley, chopped', 1, 'tbsp'], ['chilli flakes', 0.25, 'tsp'], ['salt', 0, '', 1], ['black pepper', 0, '', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Pat the shrimp very dry and season with salt and pepper. Mince the garlic.'],
      ['Melt the butter in a large pan over medium heat. Cook the garlic and chilli for 1 minute.', 60, 'Garlic fragrant'],
      ['Turn the heat up, add the shrimp in one layer and cook 2 minutes per side, until pink and opaque.', 240, 'Shrimp cooked'],
      ['Finish with lemon juice and parsley. Spoon the garlic butter over the rice.']
    ]
  },
  {
    id: 'pork-stirfry', n: 'Honey Garlic Pork Stir-Fry', e: '🥩', c: 'Chinese', t: 35, m: ['pork'],
    ing: [['pork loin, thinly sliced', 300, 'g'], ['broccoli florets', 200, 'g'], ['carrot|carrots', 1, ''],
      ['garlic clove|garlic cloves', 3, ''], ['soy sauce', 2, 'tbsp'], ['honey', 1.5, 'tbsp'], ['cornstarch', 1, 'tsp'],
      ['cooking oil', 2, 'tbsp', 1], RICE_ING],
    steps: [
      RICE_STEP,
      ['Toss the pork with 1 tablespoon of the soy sauce and the cornstarch. Leave to marinate while you prep the veg.', 600, 'Pork marinated'],
      ['Slice the carrot thinly, mince the garlic, and mix the remaining soy sauce with the honey and 2 tablespoons water.'],
      ['Heat 1 tablespoon of oil in a wok on high. Stir-fry the pork for 4 minutes, until browned and cooked through with no pink. Remove.', 240, 'Pork cooked'],
      ['Add the remaining oil, carrot and broccoli with a splash of water and stir-fry for 3 minutes.', 180, 'Veg tender-crisp'],
      ['Add the garlic for 30 seconds, return the pork, pour in the sauce and toss 1 to 2 minutes until glossy. Serve over rice.', 90, 'Glaze']
    ]
  },
  {
    id: 'veggie-noodles', n: 'Veggie Stir-Fry Noodles', e: '🥦', c: 'Chinese', t: 20, m: [],
    ing: [['noodles (wheat or rice)', 200, 'g'], ['mixed vegetables, sliced', 3, 'cup'], ['garlic clove|garlic cloves', 3, ''],
      ['fresh ginger, grated', 1, 'tbsp'], ['soy sauce', 2, 'tbsp'], ['sesame oil', 1, 'tsp'], ['sugar', 1, 'tsp', 1],
      ['chilli sauce (optional)', 1, 'tbsp'], ['cooking oil', 1.5, 'tbsp', 1]],
    steps: [
      ['Cook the noodles as the pack says (about 4 minutes), then drain and rinse under cold water. Slice the vegetables and mix the soy sauce, sesame oil, sugar and chilli sauce.', 240, 'Noodles done'],
      ['Heat the oil in a wok on high. Fry the garlic and ginger for 30 seconds.', 30, 'Aromatics'],
      ['Add the vegetables and stir-fry for 4 minutes until tender-crisp.', 240, 'Veg cooked'],
      ['Add the noodles and sauce and toss for 2 minutes until everything is hot and coated.', 120, 'Noodles tossed']
    ]
  },
  {
    id: 'lentil-soup', n: 'Hearty Lentil Soup', e: '🥣', c: 'Mediterranean', t: 45, m: [],
    ing: [['brown or green lentils', 1, 'cup'], ['onion|onions', 1, ''], ['carrot|carrots', 2, ''], ['celery stick|celery sticks', 1, ''],
      ['garlic clove|garlic cloves', 3, ''], ['canned chopped tomatoes', 200, 'g'], ['ground cumin', 1, 'tsp'],
      ['vegetable stock (or water)', 800, 'ml'], ['lemon|lemons', 0.5, ''], ['olive oil', 2, 'tbsp', 1], ['salt', 0, '', 1], ['black pepper', 0, '', 1]],
    steps: [
      ['Dice the onion, carrot and celery, mince the garlic, and rinse the lentils.'],
      ['Heat the oil in a large pot. Cook the onion, carrot and celery for 6 minutes until soft.', 360, 'Veg softened'],
      ['Add the garlic and cumin for 1 minute, then the lentils, tomatoes and stock.', 60, 'Spices toasted'],
      ['Bring to a boil, then simmer partly covered for 25 minutes until the lentils are tender.', 1500, 'Lentils tender'],
      ['Season with salt, pepper and lemon juice. For a thicker soup, blend a quarter of it and stir back in.']
    ]
  },
  {
    id: 'sheet-pan-chicken', n: 'Sheet-Pan Chicken & Veg', e: '🍗', c: 'Western', t: 55, m: ['chicken'],
    ing: [['bone-in chicken thigh|bone-in chicken thighs', 4, ''], ['baby potatoes', 400, 'g'], ['carrot|carrots', 2, ''],
      ['onion|onions', 1, ''], ['garlic clove|garlic cloves', 4, ''], ['paprika', 1, 'tsp'], ['dried thyme', 1, 'tsp'],
      ['olive oil', 3, 'tbsp', 1], ['salt', 0, '', 1], ['black pepper', 0, '', 1]],
    steps: [
      ['Heat the oven to 220 °C / 425 °F (200 °C fan). Give it about 10 minutes to come up to temperature.', 600, 'Oven preheated'],
      ['Halve the potatoes, chop the carrots and onion into chunks and smash the garlic.'],
      ['Toss the vegetables on a large tray with 2 tablespoons of oil, salt and pepper. Rub the chicken with the remaining oil, paprika, thyme and salt, and place skin-side up on top.'],
      ['Roast for 35 minutes, until the skin is crisp and the chicken reaches 75 °C / 165 °F (juices run clear).', 2100, 'Roast done'],
      ['Rest for 5 minutes before serving.', 300, 'Resting']
    ]
  }
];
