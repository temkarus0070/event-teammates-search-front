import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {MapComponent} from './components/map/map.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {LocationBtnComponent} from './components/map/location-btn/location-btn.component';
import {EventsIndexComponent} from './components/pages/events/events-index/events-index.component';
import {EventSearchComponent} from './components/events/event-search/event-search.component';
import {EventDescriptionComponent} from './components/events/event-description/event-description.component';
import {RouterModule, Routes} from "@angular/router";
import {CommonModule} from "@angular/common";
import {HeaderComponent} from './components/header/header.component';
import {EventCreateComponent} from './components/events/event-create/event-create.component';
import {LoginComponent} from "./components/login/login.component";
import {RegistrationComponent} from "./components/registration/registration.component";
import {AuthInterceptor} from "./services/auth/auth.interceptor";
import {SurveyComponent} from './components/survey/survey.component';
import {SurveyTest} from './components/pages/survey.test/survey.test.component';
import {TypeComponent} from './components/type/type.component';
import {AccountsComponent} from './components/profile/accounts/accounts.component';
import {DataComponent} from './components/profile/data/data.component';
import {AuthGuardService} from './services/auth/auth-guard.service';
import {ListComponent} from "./components/events/list/list.component";
import {ChatComponent} from "./components/chat/chat.component";
import {FriendsComponent} from "./components/pages/friends/friends.component";
import {MessagesComponent} from './components/messages/messages.component';
import {FileUploadModule} from "ng2-file-upload";
import * as cloudinary from 'cloudinary-core';
import cloudinaryConfiguration from './cloudinary_cfg';
import {InViewportModule} from "ng-in-viewport";
import {OauthComponent} from './components/login/oauth/oauth.component';
import {EditComponent} from './components/events/edit/edit.component';
import {CloudinaryModule, CloudinaryConfiguration, provideCloudinary} from '@cloudinary/angular-5.x';
import { CommercialRegisterComponent } from './components/profile/commercial-register/commercial-register.component';
import { MyEventsComponent } from './components/profile/my-events/my-events.component';

//export const BACKEND_URL: string = "https://event-teammates-backend.herokuapp.com";
export const BACKEND_URL: string = "http://localhost:8080";
const ROUTES: Routes = [
  {path: 'events/map', component: EventsIndexComponent},
  {path: "events/add", component: EventCreateComponent, canActivate: [AuthGuardService]},
  {path: '', component: EventsIndexComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegistrationComponent}, {
    path: 'pages/survey.test',
    component: SurveyTest, canActivate: [AuthGuardService]
  },
  {path: 'profile/accounts', component: AccountsComponent, canActivate: [AuthGuardService]},
  {path: 'profile/me', component: DataComponent, canActivate: [AuthGuardService]},
  {path: 'chat', component: ChatComponent},
  {path: 'friends', component: FriendsComponent},
  {path: 'messages', component: MessagesComponent},
  {path: "login/oauth2", component: OauthComponent},
  {path: "events/edit", component: EditComponent},
  {path: 'profile/commercialRegister', component: CommercialRegisterComponent, canActivate: [AuthGuardService]},
  {path: 'profile/events', component: MyEventsComponent, canActivate: [AuthGuardService]}
];


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    LocationBtnComponent,
    EventsIndexComponent,
    EventSearchComponent,
    EventDescriptionComponent,
    HeaderComponent,
    EventCreateComponent,
    RegistrationComponent,
    LoginComponent,
    SurveyComponent,
    SurveyTest,
    TypeComponent,
    AccountsComponent,
    DataComponent,
    ListComponent,
    ChatComponent,
    FriendsComponent,
    MessagesComponent,
    OauthComponent,
    EditComponent,
    CommercialRegisterComponent,
    MyEventsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES),
    ReactiveFormsModule,
    FileUploadModule,
    CloudinaryModule.forRoot(cloudinary, cloudinaryConfiguration),
    InViewportModule

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

