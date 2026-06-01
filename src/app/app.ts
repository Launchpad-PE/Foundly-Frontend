import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './shared/presentation/components/toolbar/toolbar.component';
import { FooterComponent } from './shared/presentation/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToolbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Foundly-Frontend');
}
