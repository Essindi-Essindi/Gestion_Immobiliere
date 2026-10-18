import { Component, HostListener, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '@shared/directives/reveal.directive';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, RevealDirective],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
// Public marketing landing page (Concrete-style editorial).
// Handles the sticky-header state, hero parallax and smooth anchor scrolling.
export class LandingComponent {
  scrolled = false; // true once the header should switch to its solid style
  private ticking = false; // guards the scroll handler so the DOM write runs once per frame

  constructor(private host: ElementRef<HTMLElement>) {}

  // Header solid state + parallax offset (--scroll) consumed by the hero image CSS.
  @HostListener('window:scroll')
  onScroll(): void {
    const y = window.scrollY || 0;
    this.scrolled = y > window.innerHeight * 0.75;

    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        this.host.nativeElement.style.setProperty('--scroll', String(y));
        this.ticking = false;
      });
    }
  }

  // Smooth-scroll to a section while keeping the href fallback for a11y.
  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
