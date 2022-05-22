import {
  AfterContentChecked, AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone, OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Feature, Map as MyMap, View} from 'ol';
import {Coordinate} from 'ol/coordinate';
import {Control, defaults as DefaultControls, ScaleLine} from 'ol/control';
import Projection from 'ol/proj/Projection';
import {fromLonLat, get as GetProjection, transform, transformExtent} from 'ol/proj'
import {Extent} from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {EventService} from "../../../services/event.service";
import {Event} from "../../../entity/Event/Event";
import {Point} from "ol/geom";
import {Icon, Style} from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import * as olSphere from 'ol/sphere';
import {Observable, Subject} from "rxjs";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit{
  @ViewChild('mapElementRef', {static: true}) mapElementRef: ElementRef
  map: MyMap | undefined;
  @Output() selectEvents: EventEmitter<Array<Event>> = new EventEmitter<Array<Event>>();
  _editEvent:Event|null;
 @Input() public set editEvent(event:Event|null){
    this._editEvent=event;
   console.log(event);
   if (event) {
     this.events.push(event)
     this.updateEventsOnMap();
   }
  }
  public get editEvent():Event|null{
    return this._editEvent;
  }

  _events: Array<Event> = new Array<Event>();

  public get events(): Array<Event> {
    return this._events;
  }

  @Input()
  public set events(events: Array<Event>) {
    this._events = events;
    if (this.editEvent){
      events.push(this.editEvent)
    }
    this.updateEventsOnMap();
  }

  @Input() hasSearch: boolean = false;
  @Input() isEdit: boolean = false;


  @Output() mapChanged: EventEmitter<Array<Coordinate>> = new EventEmitter<Array<Coordinate>>();
  @Output() mapReady = new EventEmitter<MyMap>();


  @Output() changeLocation = new EventEmitter<number[]>();
  @Output() callSearch = new EventEmitter<boolean>();
  @Output() callListItem = new EventEmitter<any>();
  @Input() center: Coordinate | undefined = [50, 50];
  @Input() zoom: number | undefined;

  @Input() mapBoundsChange: Subject<any> = new Subject<any>();


  view: View | undefined;
  projection: Projection | undefined;
  extent: Extent = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
  /**
   * [Lon,Lat] // https://cdn.britannica.com/04/64904-050-D2054D06/cutaway-drawing-latitude-place-longitude-sizes-angles.jpg
   * @private
   */
  private userLocation: Coordinate = [54, 54];
  private eventsMap: WeakMap<Feature<any>, Event[]> = new WeakMap<Feature<any>, Event[]>()
  private previousEventsMarkersLayer: VectorLayer<any> = new VectorLayer({});
  private previousCurrentUserLocationICON: VectorLayer<any> = new VectorLayer<any>();
  private previousClickedLocationICON: VectorLayer<any> = new VectorLayer<any>();

  constructor(private zone: NgZone, private cd: ChangeDetectorRef, private mapService: EventService) {
  }




  ngAfterViewInit(): void {
    this.init();
  }


  public init(): void {
      this.zone.run(() => {
        this.initMap();
        this.setHandlers();
      });
    setTimeout(() => this.mapReady.emit(this.map));
    this.setUserLocation();
    this.view?.on('change:center', () => {
      this.setMapBounds();
    });
  }


  public addLocationMarker(points: number[]): void {
    points = transform(points, 'EPSG:4326', 'EPSG:3857')
    let feature: any = new Feature({
      geometry: new Point(fromLonLat(points, 'EPSG:4326'))
    });


    feature.setStyle(new Style({
      image: new Icon(({
        crossOrigin: 'anonymous',
        src: '../assets/img/mapImages/clicked-locationICON.png'
      }))
    }));

    this.map?.removeLayer(this.previousClickedLocationICON);

    let vectorSource: VectorSource<any> = new VectorSource({
      features: [feature]
    });
    this.previousClickedLocationICON = new VectorLayer<any>({
      source: vectorSource
    });

    this.map?.addLayer(this.previousClickedLocationICON);
  }

  private initMap(): void {
    this.projection = GetProjection('EPSG:3857') || undefined;
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

    let buttonsContainer: HTMLDivElement = document.createElement('div');
    buttonsContainer.className='mapButtons'
    let buttonElement: HTMLButtonElement = document.createElement('button');
    buttonElement.className = "mapBtn";
    buttonElement.innerHTML = ' <img style="margin-left: 40px; margin-top: 5px;" alt="определить локацию" src="./assets/img/mapImages/getLocation.png"/> <br> ' +
      '<small style="margin-left: 40px; font-weight: 700;">Моё местоположение</small>';
    buttonElement.addEventListener('click', () => {
      this.setUserLocation();
    })
    buttonsContainer.append(buttonElement);
    if (this.hasSearch) {
      let buttonSearchElement: any = document.createElement('button')
      buttonSearchElement.className = "mapBtn searchBtn"
      buttonSearchElement.innerHTML = ' <img style="width: 50px; height: 50px; margin-left: 30px" alt="поиск"  src="./assets/img/mapImages/search-btn.png"/>' +
        ' <br> <small style="margin-left: 30px; font-weight: 700;">Поиск мероприятий</small>';
      buttonSearchElement.addEventListener('click', () => {
        this.callSearch.emit(true);
      })
      buttonsContainer.append(buttonSearchElement);

      let switchMap: any = document.createElement('button');


      switchMap.className = "mapBtn switchBtn"
      switchMap.innerHTML = ' <img style="width: 57px; height: 50px; margin-top: 5px; margin-left: 30px" alt="перейти к списку эвентов"   src="./assets/img/mapImages/list-image.png" /> ' +
        '<br> <small style="margin-left: 30px; font-weight: 700;">Список доступных мероприятий</small>';
      switchMap.addEventListener('click', () => {
        this.callListItem.emit(true);
      })

      buttonsContainer.append(switchMap);
    }

    var divControl=new Control({
      element:buttonsContainer
    });
    this.map.addControl(divControl);
    this.map?.addLayer(this.previousEventsMarkersLayer);
    this.map.setTarget(this.mapElementRef.nativeElement)
  }

  private setHandlers(): void {
    this.map?.on('click', (evt) => {
      var lonlat = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      var lon = lonlat[0];
      var lat = lonlat[1];

      this.addLocationMarker(lonlat);
      this.changeLocation.emit([lon, lat]);

      let arr: Array<Event> = [];
      this.previousEventsMarkersLayer.getFeatures(evt.pixel).then(value => {
        value.forEach(e => {
          if (this.eventsMap.get(e) !== undefined) {
            this.eventsMap.get(e)?.map(e => {
              arr.push(e);
            })
          }
        })
        if (arr.length > 0)
          this.selectEvents.emit(arr);
      });

    })
  }

  /**
   * ОПРЕДЕЛИТЬ ГРАНИЦЫ КАРТЫ, КОТОРУЮ В ДАННЫЙ МОМЕНТ ВИДИТ ПОЛЬЗОВАТЕЛЬ.
   */
  private setMapBounds(): void {
    if (this.map !== undefined) {
      var size = this.map.getSize();
      var center = this.map.getView().getCenter();
      var sourceProj = this.map.getView().getProjection();
      var extent = this.map.getView().calculateExtent(size);

      extent = transformExtent(extent, sourceProj, 'EPSG:4326');
      var posSW = [extent[0], extent[1]];
      var posNE = [extent[2], extent[3]];
      if (center !== undefined) {
        center = transform(center, sourceProj, 'EPSG:4326');
        var centerToSW = olSphere.getDistance(center, posSW);
        var centerToNE = olSphere.getDistance(center, posNE);
        var dist: number = Math.max(centerToNE, centerToSW);
        this.mapBoundsChange.next([center, dist, posSW, posNE]);
      }
    }
  }


  private updateEventsOnMap(): void {
    let featuresMap = new Map()
    let features: Array<any> = new Array<any>();
    if (this.previousEventsMarkersLayer.getSource() === null) {
      this.events.forEach(event => {
        if (event.location !== undefined) {
          let feature: any = null;

          var locationStr = JSON.stringify(event.location.location);

          if (featuresMap.has(locationStr)) {
            feature = featuresMap.get(locationStr);
          } else {
            feature = new Feature({
              geometry: new Point(fromLonLat([event.location.location.coordinates[0], event.location.location.coordinates[1]], 'EPSG:3857')),
              event: event
            });
            var imageSrc=event.recommendedBySurvey?'../assets/img/mapImages/favourite-event-icon.png':'../assets/img/mapImages/landmark.png';
            if (this.editEvent&&this.editEvent.id===event.id){
              console.log(" i found edit event")
              imageSrc='../assets/img/mapImages/edit-event-location.png';
            }
            feature.setStyle(new Style({
              image: new Icon(({
                crossOrigin: 'anonymous',
                src: imageSrc
              }))
            }));
            featuresMap = featuresMap.set(locationStr, feature)
            features.push(feature);
          }
          if (this.eventsMap.get(feature) === undefined) {
            let arr: Array<Event> = new Array<Event>(event);
            this.eventsMap = this.eventsMap.set(feature, arr);
          } else {
            this.eventsMap.get(feature)?.push(event);
          }


        }

      })
      let vectorSource: VectorSource<any> = new VectorSource({
        features: features
      });
      this.previousEventsMarkersLayer.setSource(vectorSource);
    } else {
      var source: VectorSource<any> = this.previousEventsMarkersLayer.getSource();
      var features1 = new Array<Feature<any>>();
      this.events.forEach(event => {
          if (event.location !== undefined) {
            var locationStr = JSON.stringify(event.location.location);
            var feature = null;
            if (featuresMap.has(locationStr)) {
              feature = featuresMap.get(locationStr);
            } else {
              feature = new Feature({
                geometry: new Point(fromLonLat([event.location.location.coordinates[0], event.location.location.coordinates[1]], 'EPSG:3857')),
                event: event
              });

              var imageSrc=event.recommendedBySurvey?'../assets/img/mapImages/favourite-event-icon.png':'../assets/img/mapImages/landmark.png';
              if (this.editEvent&&this.editEvent.id===event.id){
                console.log(" i found edit event")
                imageSrc='../assets/img/mapImages/edit-event-location.png';
              }
              feature.setStyle(new Style({
                image: new Icon(({
                  crossOrigin: 'anonymous',
                  src: imageSrc
                }))
              }));
              featuresMap = featuresMap.set(locationStr, feature);
              features1.push(feature);
            }

            if (this.eventsMap.get(feature) === undefined) {
              let arr: Array<Event> = new Array<Event>(event);
              this.eventsMap = this.eventsMap.set(feature, arr);
            } else {
              this.eventsMap.get(feature)?.push(event);
            }
          }
      });
      source.clear();
      source.addFeatures(features1);
    }

    this.previousEventsMarkersLayer.changed();
  }

  private setUserLocation(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = [position.coords.longitude, position.coords.latitude];
      this.userLocation = [position.coords.longitude, position.coords.latitude];
      if (!this.isEdit)
        this.changeLocation.emit(this.userLocation);
      if (this.map !== undefined)
        this.map.getView().setCenter(transform([this.center[0], this.center[1]], 'EPSG:4326', 'EPSG:3857'));

      this.printLocationMarker();
    }, () => {
    }, {enableHighAccuracy: true});
  }

  private printLocationMarker(): void {
    let feature: any = new Feature({
      geometry: new Point(transform([this.userLocation[0], this.userLocation[1]], 'EPSG:4326', 'EPSG:3857'))
    });


    feature.setStyle(new Style({
      image: new Icon(({
        crossOrigin: 'anonymous',
        src: '../assets/img/mapImages/currentPosition.png',
        opacity: 0.5
      }))
    }));

    this.map?.removeLayer(this.previousCurrentUserLocationICON);

    let vectorSource: VectorSource<any> = new VectorSource({
      features: [feature]
    });
    this.previousCurrentUserLocationICON = new VectorLayer<any>({
      source: vectorSource
    });

    this.map?.addLayer(this.previousCurrentUserLocationICON);
  }



}

