import { Card } from "./card";
import { Copper } from "./cards/basic/copper";
import { Silver } from "./cards/basic/silver";
import { Gold } from "./cards/basic/gold";
import { Estate } from "./cards/basic/estate";
import { Duchy } from "./cards/basic/duchy";
import { Province } from "./cards/basic/province";
import { CardNameMap } from "./cards/name_map";
import { Village } from "./cards/base/village";
import { Curse } from "./cards/basic/curse";
import { Market } from "./cards/base/market";
import { Wharf } from "./cards/seaside/wharf";
import { Smithy } from "./cards/base/smithy";
import { Chapel } from "./cards/base/chapel";
import { WorkersVillage } from "./cards/prosperity/workers_village";
import { Ironworks } from "./cards/intrigue/ironworks";
import { Workshop } from "./cards/base/workshop";
import { Peddler } from "./cards/prosperity/peddler";
import { Watchtower } from "./cards/prosperity/watchtower";
import { Milita } from "./cards/base/militia";
import { Stockpile } from "./cards/menagerie/stockpile";
import { Laboratory } from "./cards/base/laboratory";

export class Kingdom {
  /*
   * Contains all cards and card-shaped things that are not owned by a player
   */
  supplyPiles: Map<string, Card[]>;
  nonSupplyPiles: Map<string, Card[]>;
  trash: Map<string, Card[]>;
  globalCostReduction: number = 0;
  cardNameMap: CardNameMap;

  constructor() {
    this.supplyPiles = this.getBasicSupply();
    this.nonSupplyPiles = new Map();
    this.trash = new Map();
    this.cardNameMap = new CardNameMap();

    this.generateKingdom();
  }

  private addSupplyPile(name: string) {
    const generatorMethod = this.cardNameMap.nameMap.get(name);
    if (!generatorMethod) {
      throw new Error(`Could not generator for ${name}`);
    }
    if (generatorMethod) {
      if (generatorMethod().name !== name) {
        throw new Error(`Generator did not generate a real card for ${name}`);
      }
      const newPile = Array(10)
        .fill(undefined)
        .map((_u) => generatorMethod());
      this.supplyPiles.set(name, newPile);
    }
  }

  private generateKingdom() {
    // TODO: add dynamic kingdom generation to avoid the need for this
    this.addSupplyPile(Village.NAME);
    this.addSupplyPile(Market.NAME);
    this.addSupplyPile(Wharf.NAME);
    this.addSupplyPile(Smithy.NAME);
    this.addSupplyPile(Chapel.NAME);
    this.addSupplyPile(WorkersVillage.NAME);
    this.addSupplyPile(Ironworks.NAME);
    this.addSupplyPile(Workshop.NAME);
    this.addSupplyPile(Peddler.NAME);
    this.addSupplyPile(Watchtower.NAME);
    this.addSupplyPile(Milita.NAME);
    this.addSupplyPile(Stockpile.NAME);
    this.addSupplyPile(Laboratory.NAME);
  }

  private getBasicSupply(): Map<string, Card[]> {
    const basicSupply = new Map<string, Card[]>();

    basicSupply.set(
      Copper.NAME,
      Array(46)
        .fill(undefined)
        .map((_u) => new Copper()),
    );
    basicSupply.set(
      Silver.NAME,
      Array(40)
        .fill(undefined)
        .map((_u) => new Silver()),
    );
    basicSupply.set(
      Gold.NAME,
      Array(30)
        .fill(undefined)
        .map((_u) => new Gold()),
    );
    basicSupply.set(
      Estate.NAME,
      Array(8)
        .fill(undefined)
        .map((_u) => new Estate()),
    );
    basicSupply.set(
      Duchy.NAME,
      Array(8)
        .fill(undefined)
        .map((_u) => new Duchy()),
    );
    basicSupply.set(
      Province.NAME,
      Array(8)
        .fill(undefined)
        .map((_u) => new Province()),
    );
    basicSupply.set(
      Curse.NAME,
      Array(10)
        .fill(undefined)
        .map((_u) => new Curse()),
    );

    return basicSupply;
  }

  getTopOrError(card_name: string) {
    const pile = this.supplyPiles.get(card_name);
    if (!pile || pile.length === 0) {
      throw new Error(`No card ${card_name} to gain`);
    } else {
      return pile[0];
    }
  }

  pileEmpty(card_name: string) {
    const pile = this.supplyPiles.get(card_name);
    if (!pile || pile.length === 0) {
      return true;
    }
    return false;
  }

  removeFromTop(card: Card) {
    const pile = this.supplyPiles.get(card.name);
    if (!pile || pile.length === 0) {
      throw new Error(`No card ${card.name} to remove`);
    } else {
      pile.pop();
    }
  }

  trashCard(card: Card) {
    const in_trash_already = this.trash.get(card.name);
    if (!in_trash_already) {
      this.trash.set(card.name, [card]);
    } else {
      in_trash_already.push(card);
    }
  }

  getTotalTrashSize() {
    let tally = 0;
    for (const cardStack of this.trash.values()) {
      tally += cardStack.length;
    }
    return tally;
  }

  removeFromTrash(card: Card) {
    const in_trash = this.trash.get(card.name);
    if (!in_trash) {
      throw new Error("Attempting to remove card that is not in hand");
    } else {
      in_trash.pop();
      if (in_trash.length === 0) {
        this.trash.delete(card.name);
      }
    }
  }

  gameOver(): boolean {
    if (this.supplyPiles.get(Province.NAME)?.length == 0) {
      return true;
    }
    let emptyPileCount = 0;
    for (const pile of this.supplyPiles.values()) {
      if (pile.length == 0) {
        emptyPileCount++;
      }
    }
    if (emptyPileCount >= 3) {
      return true;
    }
    return false;
  }
}
