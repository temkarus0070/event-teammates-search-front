import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output} from '@angular/core';
import {Feature, Map as MyMap, View} from 'ol';
import {Coordinate} from 'ol/coordinate';
import {defaults as DefaultControls, ScaleLine} from 'ol/control';
import Projection from 'ol/proj/Projection';
import {fromLonLat, get as GetProjection, transform, transformExtent} from 'ol/proj'
import {Extent} from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {EventService} from "../../services/event.service";
import {Event} from "../../entity/Event/Event";
import {asyncScheduler, Observable, scheduled} from "rxjs";
import {Point} from "ol/geom";
import {Icon, Style} from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  /**
   * границы карты, которую в данный момент видит пользователь.Начиная с левой нижней и  далее против часовой стрелки
   */
  mapBoundingBox: Array<Coordinate> = [[]];
  map: MyMap | undefined;
  @Output() selectEvents: EventEmitter<Array<Event>> = new EventEmitter<Array<Event>>();

  @Input() events: Observable<Event[]> = scheduled([], asyncScheduler);
  @Output() mapChanged: EventEmitter<Array<Coordinate>> = new EventEmitter<Array<Coordinate>>();
  @Output() mapReady = new EventEmitter<MyMap>();
  @Input() center: Coordinate | undefined;
  @Input() zoom: number | undefined;
  view: View | undefined;
  projection: Projection | undefined;
  extent: Extent = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
  /**
   * [Lon,Lat] // https://cdn.britannica.com/04/64904-050-D2054D06/cutaway-drawing-latitude-place-longitude-sizes-angles.jpg
   * @private
   */
  private userLocation: Coordinate = [54, 54];
  private eventsMap: Map<Feature<any>, Event[]> = new Map<Feature<any>, Event[]>();
  private previousLayer: VectorLayer<any> = new VectorLayer({});

  constructor(private zone: NgZone, private cd: ChangeDetectorRef, private mapService: EventService) {
  }

  ngAfterViewInit(): void {
    if (!this.map) {
      this.zone.runOutsideAngular(() => this.initMap());
    }
    setTimeout(() => this.mapReady.emit(this.map));
    this.setUserLocation();
    this.view?.on('change:center', () => {
      this.setMapBounds();
    });
  }

  private initMap(): void {
    this.projection = GetProjection('EPSG:3857');
    this.view = new View({
      center: this.center,
      zoom: this.zoom,
      projection: this.projection,
    });
    this.map = new MyMap({
      layers: [new TileLayer({
        source: new OSM({})
      })],
      target: 'map',
      view: this.view,
      controls: DefaultControls().extend([
        new ScaleLine({})
      ])
    });
    this.events.subscribe(events => this.updateEventsOnMap(events));

    this.map?.on('click', (evt) => {
      let arr: Array<Event> = [];
      this.previousLayer.getFeatures(evt.pixel).then(value => {
        value.forEach(e => {
          if (this.eventsMap.get(e) !== undefined) {
            this.eventsMap.get(e)?.map(e => {
              arr.push(e);
            })
          }
        })
        console.log(arr);
        if (arr.length > 0)
          this.selectEvents.emit(arr);
      });

    })

  }

  private updateEventsOnMap(events: Array<Event>): void {


    let features: Array<any> = events.map(event => {
      let feature: any = new Feature({
        geometry: new Point(fromLonLat([event.location.lon, event.location.lat], 'EPSG:3857')),
        event: event
      });

      feature.setStyle(new Style({
        image: new Icon(({
          crossOrigin: 'anonymous',
          src: '../assets/img/mapImages/landmark.png',
          imgSize: [27, 30]
        }))
      }));

      if (this.eventsMap.get(feature) === undefined) {
        let arr: Array<Event> = new Array<Event>(event);
        this.eventsMap.set(feature, arr);
      } else {
        this.eventsMap.get(feature)?.push(event);
      }
      return feature;
    });

    this.map?.removeLayer(this.previousLayer);

    let vectorSource: VectorSource<any> = new VectorSource({
      features: features
    });
    this.previousLayer = new VectorLayer<any>({
      source: vectorSource
    });

    this.map?.addLayer(this.previousLayer);
  }


  private checkPointInCycle(x: number, y: number, x1: number, y1: number): boolean {
    let R: number = 10000;
    return (Math.pow(x - x1, 2) + Math.pow(y - y1, 2)) <= R * R;
  }


  /**
   * ОПРЕДЕЛИТЬ ГРАНИЦЫ КАРТЫ, КОТОРУЮ В ДАННЫЙ МОМЕНТ ВИДИТ ПОЛЬЗОВАТЕЛЬ.
   */
  private setMapBounds(): void {
    let extent: number[] | undefined = this.map?.getView().calculateExtent(this.map.getSize())
    if (extent != undefined) {
      let edgePoints: number[] = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
      this.mapBoundingBox = [[edgePoints[0], edgePoints[1]], [edgePoints[2], edgePoints[1]], [edgePoints[2], edgePoints[3]], [edgePoints[0], edgePoints[3]]];
//      console.log(this.mapBoundingBox);
    }
  }


  private setUserLocation(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = [position.coords.longitude, position.coords.latitude];
      this.userLocation = [position.coords.longitude, position.coords.latitude];
      if (this.map !== undefined)
        this.map.getView().setCenter(transform([this.center[0], this.center[1]], 'EPSG:4326', 'EPSG:3857'));
    }, () => {
    }, {enableHighAccuracy: true});
  }
}

