// Thanksgiving words shared by the Word Search and the Crossword: [word, picture, clue].
export const WORDS = [
  ['PIE', '🥧', 'A round dessert with a crust on top'],
  ['YAM', '🍠', 'A sweet orange potato'],
  ['HUG', '🤗', 'You wrap your arms around someone'],
  ['NAP', '😴', 'A little sleep after a big meal'],
  ['CORN', '🌽', 'A yellow veggie that grows on a cob'],
  ['LEAF', '🍁', 'It falls from a tree in autumn'],
  ['ROLL', '🥐', 'A small soft piece of bread'],
  ['FALL', '🍂', 'The season when leaves turn orange'],
  ['HOME', '🏠', 'The place where your family lives'],
  ['LOVE', '❤️', 'A warm feeling for your family'],
  ['APPLE', '🍎', 'A crunchy red fruit'],
  ['BREAD', '🍞', 'You slice it to make toast'],
  ['FEAST', '🍽️', 'A really big yummy meal'],
  ['GRAVY', '🥣', 'Brown sauce for mashed potatoes'],
  ['ACORN', '🌰', 'A nut that squirrels love'],
  ['TURKEY', '🦃', 'The big bird that says gobble gobble'],
  ['CARROT', '🥕', 'An orange veggie that bunnies love'],
  ['POTATO', '🥔', 'You mash it up for dinner'],
  ['FAMILY', '💞', 'The people who love you most'],
  ['THANKS', '🙏', 'What you say when someone is kind'],
  ['GRAPES', '🍇', 'Small round fruits in a bunch'],
  ['DINNER', '🍗', 'The meal we eat in the evening'],
  ['PUMPKIN', '🎃', 'A big orange squash for pie'],
  ['HARVEST', '🌾', 'When farmers gather their crops'],
  ['FEATHER', '🦚', 'A turkey has lots of these on its tail'],
  ['NOVEMBER', '📅', 'The month of Thanksgiving'],
];

export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = (a) => a[Math.floor(Math.random() * a.length)];
