import { Card } from "../card";
import { Village } from "./base/village";
import { Peddler } from "./prosperity/peddler";

export class CardNameMap {
  nameMap: Map<string, () => Card> = new Map();

  constructor() {
    this.nameMap.set(Peddler.NAME, Peddler.factoryGenerator);
    this.nameMap.set(Village.NAME, Village.factoryGenerator);
  }
}
