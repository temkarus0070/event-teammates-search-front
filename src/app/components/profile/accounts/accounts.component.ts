import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppModule, BACKEND_URL } from 'src/app/app.module';
import { Role } from 'src/app/entity/Role';
import { User } from 'src/app/entity/User';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { UserService } from 'src/app/services/user.service';
import {CommercialServiceService} from "../../../services/commercial-service.service";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  userLogin: string = localStorage.getItem("username") || '';
  user = new User();
  userEdited = new User();
  private currentPayUrl:string

  constructor(private userService: UserService, public authService: AuthenticationService, private router: Router,private commercialService:CommercialServiceService) {
this.commercialService.getUrlForPaying().subscribe(url=>this.currentPayUrl=url);
   }

   public hasReceipt():boolean{
     console.log(`PAY URL: ${this.currentPayUrl}`)
    return this.currentPayUrl!==null&&this.currentPayUrl!=='';
   }

   ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo() {
    this.userService.getUser(this.userLogin).subscribe(
      result => {
        this.user = result;
        console.log(this.user);
      },
      error => {
        console.log(error);
      }
    )
  }

  logOut() {
    this.authService.logOut();
  }

  payForCommercial(){
    this.commercialService.getUrlForPaying().subscribe(url => {
      if (url) {
        location.href = url;
      } else {

      }
    }, error => console.log("Произошла ошибка"))
  }

  deleteCommercialUser() {
    this.userEdited.login = this.user.login;
    if (this.userEdited.email == null)
      this.userEdited.email = this.user.email;
    if (this.userEdited.firstName == null)
      this.userEdited.firstName = this.user.firstName;
    if (this.userEdited.lastName == null)
      this.userEdited.lastName = this.user.lastName;
    if (this.userEdited.phone == null)
      this.userEdited.phone = this.user.phone;
    if (this.userEdited.pictureUrl == null)
      this.userEdited.pictureUrl = this.user.pictureUrl;
    if (this.userEdited.commercialUser == null)
      this.userEdited.commercialUser = this.user.commercialUser;

    this.userEdited.commercialUserCreated = false;
    this.userEdited.organizationName = '';
    this.userEdited.description = '';

    this.userService.updateCommercialAcc(this.userEdited).subscribe(
      result => {
        console.log("commercial account successfully deleted");
        window.location.reload();
        this.getUserInfo();
        if (this.user.commercialUser)
          this.switchToDefaultAcc();
      },
      error => {
        console.log(error);
      }
    )
    this.router.navigate(["/profile/accounts"]);
  }

  switchToDefaultAcc() {
    this.userEdited.login = this.user.login;
    if (this.userEdited.email == null)
      this.userEdited.email = this.user.email;
    if (this.userEdited.firstName == null)
      this.userEdited.firstName = this.user.firstName;
    if (this.userEdited.lastName == null)
      this.userEdited.lastName = this.user.lastName;
    if (this.userEdited.phone == null)
      this.userEdited.phone = this.user.phone;
    if (this.userEdited.pictureUrl == null)
      this.userEdited.pictureUrl = this.user.pictureUrl;
    if (this.userEdited.organizationName == null)
      this.userEdited.organizationName = this.user.organizationName;
    if (this.userEdited.description == null)
      this.userEdited.description = this.user.description;
    if (this.userEdited.commercialUserCreated == null)
      this.userEdited.commercialUserCreated = this.user.commercialUserCreated;

    this.userEdited.commercialUser = false;

    this.userService.updateCommercialAcc(this.userEdited).subscribe(
      result => {
        console.log("successfully changed to default account");
        window.location.reload();
        this.getUserInfo();
      },
      error => {
        console.log(error);
      }
    )
    this.router.navigate(["/profile/accounts"]);
  }

  switchToCommercialAcc() {
    this.userEdited.login = this.user.login;
    if (this.userEdited.email == null)
      this.userEdited.email = this.user.email;
    if (this.userEdited.firstName == null)
      this.userEdited.firstName = this.user.firstName;
    if (this.userEdited.lastName == null)
      this.userEdited.lastName = this.user.lastName;
    if (this.userEdited.phone == null)
      this.userEdited.phone = this.user.phone;
    if (this.userEdited.pictureUrl == null)
      this.userEdited.pictureUrl = this.user.pictureUrl;
    if (this.userEdited.organizationName == null)
      this.userEdited.organizationName = this.user.organizationName;
    if (this.userEdited.description == null)
      this.userEdited.description = this.user.description;
    if (this.userEdited.commercialUserCreated == null)
      this.userEdited.commercialUserCreated = this.user.commercialUserCreated;

    this.userEdited.commercialUser = true;

    this.userService.updateCommercialAcc(this.userEdited).subscribe(
      result => {
        console.log("successfully changed to commercial account");
        window.location.reload();
        this.getUserInfo();
      },
      error => {
        console.log(error);
      }
    )
    this.router.navigate(["/profile/accounts"]);
  }

  isAdmin():boolean{
    return this.user.authorities!==undefined&&this.user.authorities.filter(e=>e===Role.ADMIN).length>0;
  }

}
