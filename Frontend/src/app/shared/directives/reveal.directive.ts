import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

// Adds the global `.reveal` class to its host and toggles `.reveal--in`
// once the element scrolls into view (see styles.scss for the animation).
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { class: 'reveal' }
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input() appRevealDelay = 0; // optional stagger delay in ms

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement;

    if (this.appRevealDelay) {
      node.style.transitionDelay = `${this.appRevealDelay}ms`;
    }

    // Fallback for environments without IntersectionObserver: reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('reveal--in');
      return;
    }

    // Reveal once, then stop observing.
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('reveal--in');
            this.observer?.unobserve(node);
          }
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
