# Live Guest: where the 80 scenarios go

Phase 7 turns the 40 AI Arena scenarios (`lib/arena-scenarios.ts`, one per module) and the 40 Scenario Training situations (`app/dashboard/_components/trainer/trainer-data.ts`: 10 bartending, 10 sales, 20 management) into Live Guest briefs. You review them in batches of about 10. A brief goes live when you approve it.

Where a scenario is about the team rather than a guest, the person you talk to is a colleague, such as the head chef, another bartender or a new casual.

## Where they stand

| | Scenarios | Guests |
|---|---|---|
| Live (Phase 6) | 8 | 8 |
| Batch 1, approved and live | 10 | 10 |
| Batch 2, ready for review | 11 | 11 |
| Batches 3 to 5, still to write | 31 | 31 |
| Merged into another guest | 1 | 0 |
| Management, held for a later manager phase | 19 | 0 |
| **Total** | **80** | |

## Live (Phase 6)

| Guest | Module | From |
|---|---|---|
| The flat schooner (Dave) | 1 | Arena 1 |
| One more round (Jess) | 15 | Scenario Training, bartending 9 |
| The cold parmy (Sharon) | 11 | Arena 11 |
| Is the pesto safe? (Tom) | 25 | Arena 25 |
| No booking, Friday night (Mark) | 13 | Arena 13 |
| The Shiraz is gone (Priya) | 37 | Arena 37 |
| A booking for tonight (Claire) | 14 | Arena 14 |
| Someone pushed in (Kyle) | 17 | Arena 17 |

## Batch 1: safety, compliance and money (approved 2026-10-19, live)

| Guest | Module | From |
|---|---|---|
| Glass by the toilets (Lou, a guest) | 6 | Arena 6 |
| Just one more, mate (Gaz, a guest) | 15 | Arena 15 |
| The gluten-free burger (Marco, the head chef) | 16 | Arena 16 |
| Just grabbing my bag (Bec, a guest) | 18 | Arena 18 |
| A hundred short (Sam, your lift home) | 19 | Arena 19 |
| Drinks for his mates (Jordo, a bartender) | 20 | Arena 20 |
| Round the corner (Ash, a new food runner) | 21 | Arena 21 |
| Glass in the ice well (Tash, a bartender) | 22 | Arena 22 |
| A glass for a scoop (Mia, a new casual) | 24 | Arena 24 |
| A heavy hand (Lachie, a bartender) | 31 | Arena 31 |

## Batch 2: on the floor (ready for review)

| Guest | Module | From |
|---|---|---|
| Let me help you, love (Helen, a guest) | 5 | Arena 5 |
| No glasses, no ice (Nat, the bartender) | 7 | Arena 7 |
| Two arrivals at once (Sophie, a tourist) | 8 | Arena 8 |
| Eight at the table, two ready (Rob, a guest) | 9 | Arena 9 |
| An empty glass in the lounge (Graham, a regular) | 10 | Arena 10 |
| Three things at once (Anika, a guest) | 23 | Arena 23 |
| Who's got twelve? (Bianca, the sous chef) | 29 | Arena 29 |
| In the weeds (Paul, a guest) | 30 | Arena 30 |
| The untouched steak (Ken, a guest) | 36 | Arena 36 |
| Clearing mid-conversation (Sienna, a guest) | 38 | Arena 38 |
| Backing the junior (Jamie, a junior bartender) | 15 | Scenario Training, management 17 |

## Batch 3: behind the bar (to write)

Arena 2 (Barossa Shiraz or Cabernet), 3 (sweet, strong, no tonic), 4 (the shouted coffee order), 26 (the soda gun runs warm), 27 (economy of motion), 28 (the mid-shift reset), 32 (opening a $180 bottle), 33 (the gurgling lager tap), 34 (twelve glasses in one trip), 35 (the clean close), 39 (the ice is running low).

## Batch 4: cocktail guests (to write)

Scenario Training, bartending 1 (tired of a G&T), 2 (three orders at once), 3 (the Brandy Frappé), 4 (a Margarita with Scotch), 5 (six cocktails at closing), 6 (bourbon or rye flight), 7 (strong but smooth), 8 (why the Martini tastes better), 10 (the Sazerac).

## Batch 5: selling (to write)

Arena 12 (the premium craft lager) and 40 (the bourbon upgrade). Scenario Training, sales 1 (a snack with the cocktails), 2 (starters for a table of eight), 3 (sirloin or ribeye), 4 (what's good tonight), 5 (the birthday table too full for dessert), 6 (espresso and dessert), 7 (house wine, then a taste of the next one), 9 (four glasses or a bottle), 10 (the anniversary).

## Merged

- **Scenario Training, sales 8** (a well vodka soda, upgraded to a premium vodka) goes into **Arena 40** (a bourbon and cola, upgraded to a premium bourbon). They test the same thing. The guest can order either.

## Management (decided 2026-10-19)

In these 20 you're the manager, talking to a staff member or the owner, and most don't fit one of the 40 modules. Examples: a junior staff member stuck running food, a talented staff member whose visa runs out in 8 months, owners who see team building as a cost, and tension between the floor and the kitchen.

- **Number 17** (helping a junior cut off a regular the team likes) joins the guests now, in batch 2, under module 15.
- **Number 16** (a gaming room patron showing early signs of distress) is held. No module teaches responsible gambling, and the rules vary by state, so a guest would test something the app never teaches. It can come back with a gaming module.
- **The other 18** wait for a later manager-focused phase. Their content stays in `trainer-data.ts` when the Scenario Training screen is hidden in Phase 8.
