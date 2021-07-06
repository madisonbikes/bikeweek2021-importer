import { injectable } from "tsyringe";
import { Importer } from "./gravityforms/importer";
import { Exporter } from "./sched/exporter";
import { sleep } from "./util/await-sleep";
import { createHash } from "crypto";
import { BikeWeekEvent } from "./event_types";

@injectable()
export class MainProcess {
  constructor(private importer: Importer, private exporter: Exporter) {
  }

  once = false

  private running = true

  async start(): Promise<void> {
    if(this.once) {
      await this.doImport()
    } else {
      while(this.running) {
        await this.doImport()
        console.log("waiting 5 minutes")
        //await sleep(5 * 60 * 1000)
        await sleep(30 * 1000)
      }
    }
  }

  private async doImport(): Promise<void> {
    console.log("running import/export")
    const importedEvents = await this.importer.import();
    if(this.isUpdated(importedEvents)) {
      await this.exporter.start(importedEvents)
    } else {
      console.log("form data not updated")
    }
  }

  private lastCount = -1
  private lastHash = ""

  private isUpdated(events: BikeWeekEvent[]) {
    const hash = createHash("sha1")
    for(const e of events) {
      hash.update(e.modifyDate ?? "")
    }
    const calculatedHash = hash.digest("base64")
    const updated = calculatedHash != this.lastHash || this.lastCount != events.length
    this.lastCount = events.length
    this.lastHash = calculatedHash
    return updated
  }
}