@component
export class PresentationSwitcher extends BaseScriptComponent {
  // Optional parent object whose children will be used as slides
  @input
  parentObject: SceneObject

  @input
  @hint("Index to wrap to after last slide (set to 1 to skip intro slide 0)")
  loopStartIndex: number = 0

  // Track the currently active slide index
  private currentIndex: number = 0

  // Array to store references to all slide objects
  private slides: SceneObject[] = []
  private slideChangedCallbacks: Array<(index: number, slide: SceneObject) => void> = []

  onAwake() {
    // If no parent object is specified, use the object this script is attached to
    if (!this.parentObject) {
      this.parentObject = this.getSceneObject()
    }

    // Collect all children of the parent object
    this.collectSlides()

    // Show only the first slide initially
    if (this.slides.length > 0) {
      this.showSlide(this.currentIndex)
    } else {
      print("PresentationSwitcher: No children found to use as slides.")
    }
  }

  // Collect all child objects of the parent
  private collectSlides() {
    // Clear the array first
    this.slides = []

    // Get all children
    const childCount = this.parentObject.getChildrenCount()
    print("PresentationSwitcher: Found " + childCount + " children.")

    for (let i = 0; i < childCount; i++) {
      const child = this.parentObject.getChild(i)
      this.slides.push(child)
    }

    // Initially hide all slides
    this.hideAllSlides()
  }

  // Hide all slides
  private hideAllSlides() {
    for (const slide of this.slides) {
      slide.enabled = false
    }
  }

  // Show only the specified slide
  private showSlide(index: number) {
    // Make sure index is within bounds
    if (index >= 0 && index < this.slides.length) {
      // First hide all
      this.hideAllSlides()

      // Then show only the one at the index
      this.slides[index].enabled = true
      this.currentIndex = index
      print("PresentationSwitcher: Showing slide " + (index + 1) + " of " + this.slides.length)
      this.notifySlideChanged()
    }
  }

  private notifySlideChanged() {
    const currentSlide = this.slides[this.currentIndex]
    for (let i = 0; i < this.slideChangedCallbacks.length; i++) {
      this.slideChangedCallbacks[i](this.currentIndex, currentSlide)
    }
  }

  // Public method to move to the next slide
  public next() {
    if (this.slides.length === 0) return

    let nextIndex = this.currentIndex + 1

    // If we're at the end, wrap around to the first slide
    if (nextIndex >= this.slides.length) {
      const minLoop = Math.max(0, Math.min(this.loopStartIndex, this.slides.length - 1))
      nextIndex = minLoop
    }

    this.showSlide(nextIndex)
  }

  // Public method to move to the previous slide
  public previous() {
    if (this.slides.length === 0) return

    let prevIndex = this.currentIndex - 1
    const minLoop = Math.max(0, Math.min(this.loopStartIndex, this.slides.length - 1))

    // If we're at/before loop start, wrap around to the last slide
    if (prevIndex < minLoop) {
      prevIndex = this.slides.length - 1
    }

    this.showSlide(prevIndex)
  }

  public addOnSlideChanged(callback: (index: number, slide: SceneObject) => void) {
    this.slideChangedCallbacks.push(callback)
  }

  public goToIndex(index: number) {
    if (this.slides.length === 0) return
    const clamped = Math.min(Math.max(index, 0), this.slides.length - 1)
    this.showSlide(clamped)
  }

  public getCurrentIndex(): number {
    return this.currentIndex
  }

  public getSlideCount(): number {
    return this.slides.length
  }

  // Returns the currently visible slide index by scanning enabled state.
  // This helps other systems stay in sync even when another controller toggles slides.
  public getVisibleSlideIndex(): number {
    for (let i = 0; i < this.slides.length; i++) {
      if (this.slides[i].enabled) {
        return i
      }
    }
    return this.currentIndex
  }
}
