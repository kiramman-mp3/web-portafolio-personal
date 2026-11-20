import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ValleySceneComponent } from './components/valley-scene/valley-scene.component';
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ValleySceneComponent, BackToTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
  protected readonly title = signal('JohanDev');
}
