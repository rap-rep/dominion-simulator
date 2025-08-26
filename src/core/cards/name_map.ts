import { Card } from "../card";
import { Dungeon } from "./adventures/dungeon";
import { Gear } from "./adventures/gear";
import { Ranger } from "./adventures/ranger";
import { Bureaucrat } from "./base/bureaucrat";
import { Chapel } from "./base/chapel";
import { Laboratory } from "./base/laboratory";
import { Market } from "./base/market";
import { Milita } from "./base/militia";
import { Smithy } from "./base/smithy";
import { Village } from "./base/village";
import { Warehouse } from "./base/warehouse";
import { Witch } from "./base/witch";
import { Workshop } from "./base/workshop";
import { Copper } from "./basic/copper";
import { Curse } from "./basic/curse";
import { Duchy } from "./basic/duchy";
import { Estate } from "./basic/estate";
import { Gold } from "./basic/gold";
import { Province } from "./basic/province";
import { Silver } from "./basic/silver";
import { Ironworks } from "./intrigue/ironworks";
import { Groom } from "./menagerie/groom";
import { Horse } from "./menagerie/horse";
import { Stockpile } from "./menagerie/stockpile";
import { Peddler } from "./prosperity/peddler";
import { Watchtower } from "./prosperity/watchtower";
import { WorkersVillage } from "./prosperity/workers_village";
import { Wharf } from "./seaside/wharf";

/*
 * In order to use cards in a kingdom, they MUST be added here
 *
 * This can probably be automated, but in order to generate
 * cards on the fly every Card class is required to have a generator method
 * which is defined here, and mapped by a key of the card name
 */

export class CardNameMap {
  nameMap: Map<string, () => Card> = new Map();

  constructor() {
    // Base
    this.nameMap.set(Village.NAME, Village.factoryGenerator);
    this.nameMap.set(Smithy.NAME, Smithy.factoryGenerator);
    this.nameMap.set(Market.NAME, Market.factoryGenerator);
    this.nameMap.set(Milita.NAME, Milita.factoryGenerator);
    this.nameMap.set(Chapel.NAME, Chapel.factoryGenerator);
    this.nameMap.set(Bureaucrat.NAME, Bureaucrat.factoryGenerator);
    this.nameMap.set(Laboratory.NAME, Laboratory.factoryGenerator);
    this.nameMap.set(Workshop.NAME, Workshop.factoryGenerator);
    this.nameMap.set(Warehouse.NAME, Warehouse.factoryGenerator);
    this.nameMap.set(Bureaucrat.NAME, Bureaucrat.factoryGenerator);
    this.nameMap.set(Witch.NAME, Witch.factoryGenerator);


    this.nameMap.set(Peddler.NAME, Peddler.factoryGenerator);
    this.nameMap.set(Wharf.NAME, Wharf.factoryGenerator);
    this.nameMap.set(Stockpile.NAME, Stockpile.factoryGenerator);
    this.nameMap.set(Gear.NAME, Gear.factoryGenerator);
    this.nameMap.set(Dungeon.NAME, Dungeon.factoryGenerator);
    this.nameMap.set(WorkersVillage.NAME, WorkersVillage.factoryGenerator);
    this.nameMap.set(Ironworks.NAME, Ironworks.factoryGenerator);
    this.nameMap.set(Watchtower.NAME, Watchtower.factoryGenerator);
    this.nameMap.set(Ranger.NAME, Ranger.factoryGenerator);

    this.nameMap.set(Groom.NAME, Groom.factoryGenerator);
    this.nameMap.set(Horse.NAME, Horse.factoryGenerator);

    this.nameMap.set(Copper.NAME, Copper.factoryGenerator);
    this.nameMap.set(Silver.NAME, Silver.factoryGenerator);
    this.nameMap.set(Gold.NAME, Gold.factoryGenerator);
    this.nameMap.set(Estate.NAME, Estate.factoryGenerator);
    this.nameMap.set(Duchy.NAME, Duchy.factoryGenerator);
    this.nameMap.set(Province.NAME, Province.factoryGenerator);
    this.nameMap.set(Curse.NAME, Curse.factoryGenerator);
  }
}
