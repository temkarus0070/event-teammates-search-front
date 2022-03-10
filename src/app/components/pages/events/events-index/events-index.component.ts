import {Component, OnInit} from '@angular/core';
import {Event} from "../../../../entity/Event/Event";
import {EventService} from "../../../../services/event.service";

@Component({
  selector: 'app-events-index',
  templateUrl: './events-index.component.html',
  styleUrls: ['./events-index.component.css']
})
export class EventsIndexComponent implements OnInit {

  public showMap: boolean = true;
  public events: Array<Event> = new Array();
  public currentActiveEvent: Event | null = null;
  public isList: boolean = false;
  public mapSize: string = "100%";
  public isSearchActive: boolean = false;
  private prevMapSize: string = "100%";

  constructor(private eventService: EventService) {

  }


  public userEventSelectHandler(eventsArray: Array<Event>) {
    if (eventsArray.length > 1) {
      this.isList = true;
      this.showMap = false;
      this.events = eventsArray;
    } else this.currentActiveEvent = eventsArray[0];
  }

  public onMapReady(event: any) {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    })
  }

  public onCallSearch(event: any): void {
    if (event) {
      this.isSearchActive = true;
      this.mapSize = "70%";
    } else {
      this.isSearchActive = false;
      this.mapSize = this.prevMapSize;
    }
  }

  ngOnInit(): void {
  }

}
