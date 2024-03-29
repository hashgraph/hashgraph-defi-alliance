import { EventEmitter } from 'events'

export class Subscription<I, O = any> {
  constructor(
    private readonly events: EventEmitter,
    private readonly eventName: string,
    private readonly clb: { (payload: I): O },
  ) {
    events.on(eventName, clb)
  }

  public unsubscribe() {
    this.events.off(this.eventName, this.clb)
  }
}
