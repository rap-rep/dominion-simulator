import { Card } from "../card";
import { Market } from "./base/market";
import { Smithy } from "./base/smithy";
import { Village } from "./base/village";
import { Peddler } from "./prosperity/peddler";
import { Wharf } from "./seaside/wharf";

/*
 * In order to use cards in a kingdom, they MUST be added here
 *
 * This can probably be made better, but in order to generate
 * cards on the fly every Card class is required to have a generator method
 * which is defined here, and mapped by a key of the card name
 */

export class CardNameMap {
  nameMap: Map<string, () => Card> = new Map();

  constructor() {
    this.nameMap.set(Peddler.NAME, Peddler.factoryGenerator);
    this.nameMap.set(Village.NAME, Village.factoryGenerator);
    this.nameMap.set(Wharf.NAME, Wharf.factoryGenerator);
    this.nameMap.set(Smithy.NAME, Smithy.factoryGenerator);
    this.nameMap.set(Market.NAME, Market.factoryGenerator);
  }
}
