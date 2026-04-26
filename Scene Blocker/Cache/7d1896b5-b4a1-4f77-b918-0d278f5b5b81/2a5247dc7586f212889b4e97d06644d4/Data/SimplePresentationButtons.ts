import {PinchButton} from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton"
import {PresentationSwitcher} from "./PresentationSwitcher"

@component
export class SimplePresentationButtons extends BaseScriptComponent {
  @input
  @hint("Presentation switcher controlled by the buttons")
  presentationSwitcher: PresentationSwitcher

  @input
  @allowUndefined
  @hint("Pinch button that advances to the next slide")
  nextButton: PinchButton

  @input
  @allowUndefined
  @hint("Pinch button that goes to the previous slide")
  previousButton: PinchButton

  @input
  @allowUndefined
  @hint("Optional status text for quick debugging")
  statusText: Text

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart() {
    if (!this.presentationSwitcher) {
      print("SimplePresentationButtons: presentationSwitcher is not assigned.")
      return
    }

    if (this.nextButton) {
      this.nextButton.onButtonPinched.add(() => {
        this.presentationSwitcher.next()
        this.updateStatus("Next")
      })
    } else {
      print("SimplePresentationButtons: nextButton not assigned.")
    }

    if (this.previousButton) {
      this.previousButton.onButtonPinched.add(() => {
        this.presentationSwitcher.previous()
        this.updateStatus("Previous")
      })
    } else {
      print("SimplePresentationButtons: previousButton not assigned.")
    }

    this.updateStatus("Ready")
  }

  private updateStatus(action: string) {
    if (!this.statusText || !this.presentationSwitcher) {
      return
    }
    const current = this.presentationSwitcher.getCurrentIndex() + 1
    const total = this.presentationSwitcher.getSlideCount()
    this.statusText.text = action + " | Slide " + current + " / " + total
  }
}
