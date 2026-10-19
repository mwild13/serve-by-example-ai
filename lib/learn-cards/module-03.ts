// Module 3, Cocktail Fundamentals: the Learn cards shown before the quiz,
// written from the module's True/False statements (lib/verify-questions.ts).
// `concepts` names the statements each card teaches.
//
// Draft for the owner's review (cards batch 1). Review copy:
// docs/Rich Update/cards-batch-1-bartending-a.md.
import type { LearnCard } from "@/lib/learn-cards";

export const MODULE_3_CARDS: LearnCard[] = [
  {
    id: "c1",
    concepts: ["s0"],
    title: "Measure the spirit",
    rule: "Most venues pour 30ml as a standard spirit measure. Use the jigger every time.",
    why: "The same measure every time keeps drinks consistent, keeps the venue's stock counts right and keeps service responsible.",
    reviewed: false,
  },
  {
    id: "c2",
    concepts: ["s1"],
    title: "Stir a Martini",
    rule: "Stir a Martini. Don't shake it.",
    why: "Stirring chills it and keeps it crystal clear. Shaking clouds it with air bubbles and waters it down.",
    reviewed: false,
  },
  {
    id: "c3",
    concepts: ["s2", "s3"],
    title: "Syrup and mint",
    rule: "Simple syrup is equal parts sugar and water. Press mint gently, never grind it.",
    why: "Syrup balances the sour in most classic cocktails. Crushing the mint stems releases bitter flavours that ruin a Mojito.",
    reviewed: false,
  },
  {
    id: "c4",
    concepts: ["s4"],
    title: "Fresh coffee for an Espresso Martini",
    rule: "Make an Espresso Martini with a fresh, hot shot of espresso.",
    why: "The oils in fresh espresso are what shake up into the thick crema on top. Old or cold coffee gives a flat drink.",
    reviewed: false,
  },
  {
    id: "c5",
    concepts: ["s6", "s7"],
    title: "Classic specs, right glass",
    rule: "A Negroni is equal parts gin, Campari and sweet vermouth. Every cocktail has its own glass.",
    why: "Guests know the classic specs. Coupes, rocks glasses and highballs each suit a different kind of drink.",
    reviewed: false,
  },
  {
    id: "c6",
    concepts: ["s5"],
    title: "Never scoop with a glass",
    rule: "Always use the ice scoop. Never scoop ice with a glass.",
    why: "If the glass chips, you can't see the shards in the ice, and the whole well has to be burnt.",
    reviewed: false,
  },
];
