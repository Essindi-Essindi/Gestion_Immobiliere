import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';

const DEFAULT_VIDEO =
  'https://videos.pexels.com/video-files/17224715/17224715-hd_1920_1080_30fps.mp4';

const DEFAULT_POSTER =
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600';

const DEFAULT_IMAGES = [
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1400',
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1400',
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1400',
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1400'
];

/**
 * Editorial media panel shared by every auth screen — the bridge between the
 * landing page (dark editorial) and the clay dashboards. Supports role-specific
 * copy, an ambient background video and a property image carousel.
 */
@Component({
  selector: 'app-auth-aside',
  standalone: true,
  imports: [],
  templateUrl: './auth-aside.component.html',
  styleUrl: './auth-aside.component.scss'
})
export class AuthAsideComponent implements OnInit, OnDestroy {
  @Input() role = '';
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() video = DEFAULT_VIDEO;
  @Input() poster = DEFAULT_POSTER;
  @Input() images: string[] = DEFAULT_IMAGES;

  readonly activeIndex = signal(0);
  readonly showImage = signal(false);

  private timer?: ReturnType<typeof setInterval>;

  get hasVideo(): boolean {
    return !!this.video;
  }

  get hasImages(): boolean {
    return this.images.length > 0;
  }

  get slidesVisible(): boolean {
    return this.hasImages && (this.showImage() || !this.hasVideo);
  }

  ngOnInit(): void {
    if (!this.hasVideo && this.images.length > 1) {
      this.timer = setInterval(() => this.next(), 6000);
    }
  }

  select(index: number): void {
    if (this.hasVideo) {
      if (this.activeIndex() === index && this.showImage()) {
        this.showImage.set(false);
        return;
      }
      this.activeIndex.set(index);
      this.showImage.set(true);
      return;
    }
    this.activeIndex.set(index);
  }

  private next(): void {
    if (this.images.length < 2) return;
    this.activeIndex.set((this.activeIndex() + 1) % this.images.length);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
