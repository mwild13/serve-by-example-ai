# Saturday Rush: the moments

19 moments. A shift is 12 of them, picked at random (with at least two about safety), from 9:30pm to 11:30pm. The drinks, numbers and the order of the choices change every run; each moment below shows one example. Built from `lib/rush/moments.ts` with `npm run rush:review`.

Check: is the best call what a good Australian bartender would do, is anything marked wrong that a good venue would accept, and does each why read right? The numbers after each choice are what it does to the dials (0 to 100).

## acknowledge-queue (queue)

Can come up any time.

**Situation:** You're halfway through a round of 3 schooners of lager. 6 people are waiting, and a guest at the end is waving a card at you.

- **Best:** Catch their eye, nod, "With you in a sec", and finish the round _(guest +6, speed +3, serves 2)_
- **Costly:** Keep your head down and finish the round _(guest -6, serves 2)_
- **Costly:** Leave the round half poured and go to them _(guest -2, speed -6, $4 wasted, serves 1)_
- **Costly:** Call out "Who's next?" to the whole bar _(guest -4, speed -2, serves 1)_

**Why:** Acknowledge everyone waiting within a few seconds, even when you can't serve them yet. A nod and "with you in a sec" keeps a queue calm and in order; leaving a round half poured slows everyone down.

## guinness-first (docket)

Can come up any time.

**Situation:** A docket prints: 1 Guinness, 2 schooners of lager, 1 Espresso Martini. What do you start first?

- **Best:** The Guinness _(speed +7, guest +3, serves 2)_
- **Fair:** The Espresso Martini _(speed +1, serves 2)_
- **Costly:** The schooners of lager _(speed -4, guest -3, $3 wasted, serves 2)_
- **Costly:** Ask the guest which they want first _(speed -5, serves 1)_

**Why:** Start the Guinness: it needs about two minutes to settle before you top it up. Shake the Espresso Martini while it settles, and pour the beers last so the head is fresh when they go out.

## holds-first (docket)

Can come up any time.

**Situation:** A table's docket: 2 glasses of house white, 2 Aperol Spritzes, 1 Espresso Martini and a middy of mid-strength. What do you make first?

- **Best:** Pour the two whites _(speed +6, guest +3, serves 2)_
- **Fair:** Shake the Espresso Martini _(speed +2, serves 2)_
- **Costly:** Build the Aperol Spritzes _(speed -2, guest -3, serves 2)_
- **Costly:** Pour the middy _(speed -3, guest -2, serves 2)_

**Why:** Make what holds first and what dies last. Still wine holds, then the shaken drink goes straight out of the shaker, then the bubbles, and the beer last so the head and the fizz are fresh at the table.

## batch-orders (queue)

Comes up only in some states.

**Situation:** Three deep. The next three guests in a row each want lager: two schooners, then a schooner and a middy, then a jug.

- **Best:** Take all three orders, then pour them together _(speed +8, guest +3, serves 3)_
- **Fair:** Serve them one at a time, start to finish _(speed +1, serves 2)_
- **Costly:** Pour the jug first because it's the biggest _(speed -2, guest -4, serves 2)_

**Why:** When the bar is three deep, take two or three orders at once and pour like with like. It's how one bartender keeps up. Serve in the order people arrived, not by the size of the order.

## out-of-ice (stock)

Comes up when it happens (forced).

**Situation:** The ice well is empty and 6 people are waiting. The next guest wants a vodka soda.

- **Best:** Call the bar-back for ice, tell the guest it's a minute, and pour beers and wine meanwhile _(speed -1, guest +2, restocks ice, serves 2)_
- **Costly:** Scoop ice from the glass-washer tub with a schooner glass _(safety -15, speed +2, serves 2)_
- **Costly:** Leave the bar to get it yourself _(speed -8, guest -6, restocks ice)_
- **Costly:** Make it without ice _(guest -6, serves 1)_

**Why:** Get the bar-back on it and keep serving what doesn't need ice. Never scoop ice with a glass: it chips, and glass in ice can't be seen. This is why you call for ice when the well is half full.

## glasses-low (stock)

Comes up only in some states.

**Situation:** You're down to your last few clean schooner glasses. A rack has just come out of the glass washer, too hot to touch.

- **Best:** Ask the bar-back to bring clean glasses, and let the hot rack cool _(speed +3, restocks glasses, serves 1)_
- **Costly:** Pour schooners straight into the hot glasses _(guest -5, money -2, $6 wasted, serves 2, restocks glasses)_
- **Costly:** Pour the schooners into pot glasses _(guest -6, money -4, serves 2)_

**Why:** Restock glasses before you run out. Beer poured into a glass hot from the washer foams up and goes flat, and a schooner served in a smaller glass is short measure.

## out-of-glasses (stock)

Comes up when it happens (forced).

**Situation:** No clean schooner glasses left and 6 people are waiting, most of them after lager.

- **Best:** Get the bar-back to run a rack, tell the queue it's a minute, and serve drinks that don't need schooners _(guest +1, speed -2, restocks glasses, serves 1)_
- **Costly:** Rinse used glasses from the bar under the tap _(safety -10, speed +2, serves 2)_
- **Costly:** Stop serving until the glasses come back _(guest -6, speed -8, restocks glasses)_

**Why:** Keep serving what you can and get the glass washer going. A rinse under the tap doesn't sanitise a glass; it has to go through the washer.

## intoxicated-round (safety)

Can come up any time.

**Situation:** A man at the bar is slurring and swaying. He orders 4 schooners of lager for himself and his mates.

- **Best:** Tell him quietly you can't serve him any more tonight, offer him water, and let your supervisor know _(safety +12, guest -2, money -3)_
- **Breach (caps the score at 40):** Serve the round, it's mostly for his mates _(safety -20, serves 1)_
- **Breach (caps the score at 40):** Serve this one, then cut him off _(safety -20, serves 1)_
- **Costly:** Pretend you didn't see him and serve someone else _(safety -6, guest -4, serves 1)_

**Why:** It's against the law in every Australian state to sell or supply alcohol to someone who is intoxicated, and that includes a round he'll carry back to his mates. Refuse kindly and quietly, offer water, and tell your supervisor so the team backs you.

## check-id (safety)

Can come up any time.

**Situation:** Two young guests order Espresso Martinis. They both look about 18 or 19, and the queue behind them is growing.

- **Best:** Ask them both for ID before you make anything _(safety +10, speed -1)_
- **Costly:** Make the drinks, then ask for ID when they pay _(safety +2, money -3, $18 wasted, speed -3)_
- **Breach (caps the score at 40):** Serve them, it's too busy to check _(safety -20, serves 1)_

**Why:** Check ID from anyone who looks under 25, before you make the drinks. A rush is when minors try their luck, and selling to a minor brings big fines for you and the venue. Asking first means nothing is wasted if they can't show it.

## glass-in-ice (safety)

Comes up only in some states.

**Situation:** A schooner glass slips out of your hand and breaks over the ice well. You can see a few pieces on top.

- **Best:** Stop, tell the bar it's a minute, empty the well, melt it with hot water and refill it _(safety +12, speed -5, restocks ice)_
- **Breach (caps the score at 40):** Pick out the pieces you can see and keep going _(safety -20, speed +3, serves 2)_
- **Breach (caps the score at 40):** Use the other side of the well for now _(safety -20, speed +2, serves 2)_

**Why:** Glass in ice can't be seen. Burn the well every time: stop using it, empty it, melt what's left with hot water, check it, then refill. Scooping around it is how a guest ends up swallowing glass.

## wet-floor (safety)

Can come up any time.

**Situation:** Someone has knocked a jug of beer over at the end of the bar, right where people walk to the toilets.

- **Best:** Put out a wet floor sign and ask the bar-back to mop it now _(safety +8, speed -1)_
- **Costly:** Mop it yourself after this round _(safety -8, serves 1)_
- **Costly:** Throw a bar towel over it _(safety -5)_

**Why:** A wet floor in a busy walkway is how people get hurt. Deal with it straight away: sign first so people walk around it, then mop. If you can't leave the bar, the bar-back or a floor staff member does it now, not after the round.

## squaring-up (safety)

Can come up any time.

**Situation:** Two guests at the bar are getting loud and squaring up over who was next.

- **Best:** Step in calmly, say you'll serve them both next, and signal security or your supervisor _(safety +8, guest +3, serves 2)_
- **Costly:** Serve the louder one to settle him down _(guest -5, safety -5, serves 1)_
- **Costly:** Keep pouring and let them sort it out _(safety -10, guest -4, serves 1)_

**Why:** Calm it early, be fair to both, and get backup before it turns. Serving the louder one first teaches the whole bar that pushing works.

## wrong-drink (queue)

Can come up any time.

**Situation:** A guest comes back with the gin and tonic you just made. They say they ordered a gin and soda.

- **Best:** Apologise and remake it straight away _(guest +6, money -1, $8 wasted, serves 1)_
- **Costly:** Tell them they said gin and tonic _(guest -10)_
- **Costly:** Top it up with what they wanted _(guest -6, serves 1)_

**Why:** In a rush, never argue over a drink. Say sorry and remake it at once: a few dollars of spirit costs far less than a guest who tells their mates about it. Read the order back next time, and it won't happen.

## eighty-sixed (sales)

Can come up any time.

**Situation:** Espresso Martinis are off tonight: the coffee machine is down. The next guest orders two.

- **Best:** Tell them straight away it's off, and suggest a White Russian _(guest +4, money +2, serves 1, +$4 sale)_
- **Costly:** Ring it up and work it out after _(guest -6, speed -3)_
- **Costly:** Say it'll be a long wait _(guest -4, money -3)_

**Why:** When something is off for the night, tell the guest before they pay, with an alternative in the same style, and the sale isn't lost.

## upsell-when-quiet (sales)

Comes up only in some states.

**Situation:** It's eased off for a moment and only a couple of people are waiting. A guest orders a vodka soda.

- **Best:** Suggest the premium spirit in it, a few dollars more _(money +4, guest +2, serves 1, +$4 sale)_
- **Fair:** Just make it _(serves 1)_
- **Costly:** Suggest making it a double _(safety -4, money +2, serves 1, +$6 sale)_

**Why:** A quiet moment is when a suggestion lands: offer a better spirit, not more of it. Pushing doubles isn't responsible service, and it's the guest's night, not the till's.

## no-chat-in-rush (queue)

Comes up only in some states.

**Situation:** 6 people are waiting. A guest orders a house vodka and asks what the difference is between all the brands on the shelf.

- **Best:** "Happy to talk you through them when it's quieter," make the house one and move on _(speed +6, guest +2, serves 2)_
- **Costly:** Talk them through the range _(speed -7, guest -4, serves 1, +$4 sale)_
- **Costly:** Ignore the question _(guest -4, serves 1)_

**Why:** Read the room. Three deep is for quick, friendly service; the long chat about the top shelf is for a quiet moment. Offer to come back to it, so the guest doesn't feel brushed off.

## regular-wants-a-chat (queue)

Comes up only in some states.

**Situation:** A regular leans on the bar and starts telling you about the footy while the queue builds behind him.

- **Best:** Be friendly, keep it short ("Tell me after the rush"), and serve the next guest _(speed +5, guest +3, serves 2)_
- **Costly:** Have the chat, he's a regular _(speed -7, guest -5)_
- **Costly:** Turn away without a word _(guest -4, serves 2)_

**Why:** Regulars matter, but so does everyone waiting. A warm, quick "tell me after the rush" keeps both.

## take-the-load (team)

Can come up any time.

**Situation:** You've just cleared your end of the bar. The other bartender is buried in a docket of 6 cocktails, and their end is three deep.

- **Best:** Tell them you'll take half the docket _(speed +7, guest +3, serves 3)_
- **Fair:** Start serving their end of the queue _(speed +3, guest +2, serves 2)_
- **Costly:** Restock your own station while it's quiet _(speed -3, guest -3, restocks glasses)_

**Why:** A bar works as a team. In a rush, take work off whoever's buried, and say what you're taking so you don't both make the same drinks.

## keg-foaming (stock)

Can come up any time.

**Situation:** The lager tap starts spitting foam, with 3 schooners of it still to pour.

- **Best:** Stop pouring, get the keg changed, and offer the guest another beer in the meantime _(speed +2, guest +3, money +2, serves 2)_
- **Costly:** Keep pouring and tip the foam off _(money -4, speed -5, $12 wasted, serves 2)_
- **Costly:** Pour them anyway and serve them with a big head _(guest -6, serves 2)_

**Why:** A tap spitting foam usually means the keg is empty or the gas has run out. Don't pour beer down the sink: offer another beer and get the keg changed (or tell whoever does it).
