/** [speaker, text]. Speaker "_pause" means: wait `text` milliseconds. */
export type L = [string, string];

export const PROLOGUE_VO: L[] = [
  ['ELARA (V.O.)', 'There are places the world forgets.'],
  ['ELARA (V.O.)', 'Not because they were unimportant...'],
  ['ELARA (V.O.)', 'But because something happened there that was never meant to be remembered.'],
];

// SCENE 1.1 - APPROACHING VEYRA
export const S1_1: L[] = [
  ['ELARA', 'There it is.'], ['KOFI', "That's Veyra?"], ['MAEVE', "Don't sound disappointed."],
  ['AGNIV', 'I was expecting ruins.'], ['TAKESHI', 'Look at the cliffs.'], ['ELARA', "Those aren't cliffs."],
  ['MAEVE', 'Then what are they?'], ['ELARA', 'Markers.'], ['KOFI', 'Everyone away from the railing.'],
];
// SCENE 1.2 - SHARK ATTACK
export const S1_2_OPEN: L[] = [
  ['AGNIV', 'That thing just jumped over the ship!'], ['KOFI', 'Then hit it when it lands!'],
  ['ELARA', 'There are more beneath us!'], ['MAEVE', 'Lots more.'], ['TAKESHI', 'Keep moving.'],
];
export const S1_2_DEFEND: L[] = [
  ['ELARA', "They're coming from both sides!"], ['KOFI', 'Then stop watching the water and start hitting them!'],
];
export const S1_2_JUMP: L[] = [['MAEVE', "Look! Another one's jumping!"], ['TAKESHI', "Keep moving! There's more beneath us!"]];
export const S1_2_STOP: L[] = [['ELARA', 'Why did they stop?'], ['TAKESHI', "They didn't."]];
// SCENE 1.3 - THE SHIP BREAKS
export const S1_3: L[] = [
  ['KOFI', 'Everyone off the deck!'], ['AGNIV', 'Is it sinking?'], ['KOFI', 'No.'], ['_pause', '1300'],
  ['KOFI', "It's worse."], ['AGNIV', 'How is that worse?'], ['KOFI', "We don't have a ship anymore."],
  ['AGNIV', "Then I suppose we're walking."], ['MAEVE', "We're not alone."],
];
// SCENE 1.4 - THE SHORE
export const S1_4: L[] = [
  ['ELARA', 'The stories were true.'], ['KOFI', 'We nearly got eaten before breakfast.'],
  ['ELARA', "And you're worried about the stories?"], ['MAEVE', "She's right."],
  ['TAKESHI', 'Something is wrong with this place.'], ['AGNIV', 'Good.'], ['KOFI', 'Good?'],
  ['AGNIV', "If everything were normal, we'd have wasted the trip."], ['MAEVE', 'I already regret bringing you.'],
  ['AGNIV', "You didn't bring me."], ['MAEVE', 'Exactly.'],
];
