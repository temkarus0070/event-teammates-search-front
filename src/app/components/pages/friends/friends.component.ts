import { Component, OnInit } from '@angular/core';
import {UserService} from './user.service'
import { User } from './user';
import {HttpClient} from "@angular/common/http";
import { BACKEND_URL } from 'src/app/app.module';
import { Relationship } from './Relationship';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  findCheck: boolean = false;
  users: User[];
  requests: Relationship[];
  friends: Relationship[];
  sendedRequests: Relationship[];
  requestsCheck: boolean = false;
  friendsCheck: boolean = false;
  sendedRequestsCheck: boolean = false;
  autorisationCheck: boolean;

  constructor(private userService: UserService, private httpClient: HttpClient) {
    if (localStorage.getItem("token")) {
      this.autorisationCheck = true;
      this.userService.getRequests().subscribe((data: Relationship[]) => {
        console.log("waiting requests");
        this.requests = data;
        for (let i = 0; i < this.requests.length; i++) {
          if (this.requests[i].id.friend.pictureUrl == null) {
            this.requests[i].id.friend.pictureUrl = "./../../../../assets/img/profile/accImgExample.png";
          }
          if (this.requests[i].id.owner.pictureUrl == null) {
            this.requests[i].id.owner.pictureUrl = "./../../../../assets/img/profile/accImgExample.png";
          }
        }
        if (this.requests.length > 0) this.requestsCheck = true;
      });
      this.userService.getFriends().subscribe((data: Relationship[]) => {
        console.log("waiting friends");
        this.friends = data;
        for (let i = 0; i < this.friends.length; i++) {
          if (this.friends[i].id.friend.pictureUrl == null) {
            this.friends[i].id.friend.pictureUrl = "./../../../../assets/img/profile/accImgExample.png";
          }
          if (this.friends[i].id.owner.pictureUrl == null) {
            this.friends[i].id.owner.pictureUrl = "./../../../../assets/img/profile/accImgExample.png";
          }
        }
        if (this.friends.length > 0) this.friendsCheck = true;
      }
      );
      this.userService.getSendedRequests().subscribe((data: Relationship[]) => {
        console.log("waiting sended requests");
        this.sendedRequests = data;
        for (let i = 0; i < this.sendedRequests.length; i++) {
          if (this.sendedRequests[i].id.friend.pictureUrl == null) {
            this.sendedRequests[i].id.friend.pictureUrl = "./../../../../assets/img/profile/accImgExample.png";
          }
          if (this.sendedRequests[i].id.owner.pictureUrl == null) {
            this.sendedRequests[i].id.owner.pictureUrl = "./../../../../assets/img/profile/accImgExample.png";
          }
        }
        console.log(this.sendedRequests);
        if (this.sendedRequests.length > 0) this.sendedRequestsCheck = true;
      }
      );
    } else {
      this.autorisationCheck = false;
    }
  }

  ngOnInit(): void {
  }

  requestChange(): void {
    this.findCheck = false;
    var field = document.getElementById("searchField");
    if ((<HTMLInputElement>field).value != "") {
      this.hideFields();
      if ((<HTMLInputElement>document.getElementById("searchOption")).value == "?????????? ???? ????????????") {
        this.userService.getUsersByLogin((<HTMLInputElement>field).value).subscribe((data: User[]) => {
          this.users = data;
          for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].pictureUrl == null) {
              this.users[i].pictureUrl = "./../../../../assets/img/profile/accImgExample.png";
            }
          }
          this.findCheck = true;
        })
      }
      if ((<HTMLInputElement>document.getElementById("searchOption")).value == "?????????? ???? ?????????? ?? ??????????????") {
        this.userService.getUsersByFirstLastName((<HTMLInputElement>field).value).subscribe((data: User[]) => {
          this.users = data;
          for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].pictureUrl == null) {
              this.users[i].pictureUrl = "./../../../../assets/img/profile/accImgExample.png";
            }
          }
          this.findCheck = true;
        })
      }
    } else {
      this.findCheck = false;
      this.enableFields();
    }
  }

  hideFields(): void {
    var headers = document.getElementsByClassName("listSelector");
    for (let i = 0; i < headers.length; i++) {
      if ((<HTMLInputElement>headers[i]).id != "find") {
        (<HTMLInputElement>headers[i]).hidden = true;
      }
    }
  }

  enableFields(): void {
    var headers = document.getElementsByClassName("listSelector");
    for (let i = 0; i < headers.length; i++) {
      if ((<HTMLInputElement>headers[i]).id != "find") {
        (<HTMLInputElement>headers[i]).hidden = false;
      }
    }
  }

  clickFriendButton(event: any): void {
    var friendLogin: string = (<HTMLInputElement>event.path[0]).id;
    var data = { "friendName": friendLogin};
    console.log(friendLogin + " " + data);
    this.httpClient.post<any>(BACKEND_URL + "/api/friends/requestFriend", null, {headers: data}).subscribe(e=> {
      console.log("sending data");
      location.reload();
    });
    
  }

  clickRequestButton(event: any): void {
    var userLogin: string = (<HTMLInputElement>event.path[0]).id;
    if ((<HTMLInputElement>event.path[0]).textContent == "?????????????? ????????????") {
      var data = {
        "friendName": userLogin,
        "friend": "1"
      };
      this.httpClient.post<any>(BACKEND_URL + "/api/friends/requestFriend", null, {headers: data}).subscribe(e=> {
        console.log("sending data");
        location.reload();
      });
    }
    if ((<HTMLInputElement>event.path[0]).textContent == "?????????????????? ????????????") {
      var data1 = {
        "friendName": userLogin
      };
      this.httpClient.post<any>(BACKEND_URL + "/api/friends/cancelFriend", null, {headers: data1}).subscribe(e=> {
        console.log("sending data");
        location.reload();
      });
    }
  }

  clickAddedFriendButton(event: any): void {
    var friendLogin: string = (<HTMLInputElement>event.path[0]).id;
    if ((<HTMLInputElement>event.path[0]).textContent == "?????????????????? ??????????????????") {
      console.log("?? ??????????????????, ?? ???????????? ????????????, ???????????????? ?????????????????? ???? ????????????????");
    }
    if ((<HTMLInputElement>event.path[0]).textContent == "?????????????? ???? ????????????") {
      var data = {
        "friendName": friendLogin
      }
      this.httpClient.post<any>(BACKEND_URL + "/api/friends/deleteFriend", null, {headers: data}).subscribe(e=> {
        console.log("sending data");
      });
      location.reload();
    }
  }

  clickSendedRequestButton(event: any): void {
    var friendLogin: string = (<HTMLInputElement>event.path[0]).id;
    var data = {
      "friendName": friendLogin
    }
    this.httpClient.post<any>(BACKEND_URL + "/api/friends/deleteSendedRequest", null, {headers: data}).subscribe(e=> {
      console.log("sending data");
    });
    location.reload();
  }
}
