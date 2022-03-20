import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {BACKEND_URL} from "../app.module";
import {Coordinate} from "ol/coordinate";
import {Event} from "../entity/Event/Event";
import {EventType} from "../entity/Event/EventType";
import {FilterData} from "../entity/filterData";


@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private httpClient: HttpClient) {
  }


  public getEventsWithinRadius(location: Coordinate, radius: number): Observable<Array<Event>> {
    return this.httpClient.get<Array<Event>>(BACKEND_URL + "/api/events/getEventsWithinRadius", {
      params: {
        location: location,
        radius: radius
      }
    });
  }

  public getEvents(): Observable<Array<Event>> {
    return this.httpClient.get<Array<Event>>(BACKEND_URL + "/api/events/getEvents");
  }

  /*  public getEventsAtUserMap(userMapBoundingBox: Coordinate[]): Observable<Array<Event>> {
      return this.httpClient.get<Array<Event>>(BACKEND_URL + "/events", {
        'userMapBoundingBox': userMapBoundingBox
      });
    }*/

  public add(event: Event): Observable<any> {

    return this.httpClient.post(BACKEND_URL + "/api/events", event);
  }

  public getWords(wordPart: string): Observable<string[]> {
    return this.httpClient.get<Array<string>>(BACKEND_URL + "/api/events/getKeyWords", {params: {wordPart: wordPart}});
  }

  public getTypes(): Observable<EventType[]> {
    return this.httpClient.get<Array<EventType>>(BACKEND_URL + "/api/eventTypes");
  }

  public filter(filter: FilterData): Observable<Event[]> {
    return this.httpClient.post<Array<Event>>(BACKEND_URL + "/api/events/filter", filter);
  }

  public setAddressByLonLat(event: Event, func: Function): void {

    var lon = event.location?.location.coordinates[0];
    var lat = event.location?.location.coordinates[1];
    var url = `https://nominatim.openstreetmap.org/reverse?lon=${lon}&lat=${lat}`;
    var response = fetch(url);
    response.then((value) => {
      value.text().then((val) => {
        var parser = new DOMParser();
        var fullAddress = [];
        var document = parser.parseFromString(val, "application/xml");
        if (event.location !== undefined && document !== undefined) {
          var city = document.evaluate("reversegeocode/addressparts/city", document, null, XPathResult.STRING_TYPE).stringValue;
          var road = document.evaluate("reversegeocode/addressparts/road", document, null, XPathResult.STRING_TYPE).stringValue;
          var house = document.evaluate("reversegeocode/addressparts/house_number", document, null, XPathResult.STRING_TYPE).stringValue;
          var state = document.evaluate("reversegeocode/addressparts/state", document, null, XPathResult.STRING_TYPE).stringValue;
          var neigbourhood = document.evaluate("reversegeocode/addressparts/neighbourhood", document, null, XPathResult.STRING_TYPE).stringValue;
          if (city !== "") {
            fullAddress.push(city);
          } else {
            if (state !== "")
              fullAddress.push(state);
          }

          if (road != "") {
            fullAddress.push(road);
          } else {
            if (neigbourhood != "") {
              fullAddress.push(neigbourhood);
            }
          }
          if (house != "") {
            fullAddress.push(house);
          }
          if (fullAddress.length <= 1) {
            var district = document.evaluate("reversegeocode/addressparts/city_district", document, null, XPathResult.STRING_TYPE).stringValue;
            var county = document.evaluate("reversegeocode/addressparts/county", document, null, XPathResult.STRING_TYPE).stringValue;
            if (county != "")
              fullAddress.push(county);
            if (district != "")
              fullAddress.push(district);
          }

          event.location.name = fullAddress.join(",");
        }
        func();
      })
    });


  }

}
