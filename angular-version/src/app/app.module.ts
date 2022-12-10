import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { GameBoardComponent } from './game/component/canvas/canvas.component';
import { HomeComponent } from './components/home/home.component';
import { CanvasModule } from './shared/modules/canvas/canvas.module';
// import { GameComponent } from './game/component/main/game.component';
// import { CanvasDirective } from './game/directives/canvas/canvas.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CanvasModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
