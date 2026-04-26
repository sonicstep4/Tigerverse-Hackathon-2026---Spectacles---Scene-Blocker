import {PinchButton} from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton"
import {SpeechToText} from "./VoiceController"

@component
export class MicToggleButtonController extends BaseScriptComponent {
  @input
  @hint("Pinch button used to toggle microphone listening")
  micButton: PinchButton

  @input
  @hint("Speech controller script to toggle")
  speechController: SpeechToText

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart() {
    if (!this.micButton || !this.speechController) {
      print("MicToggleButtonController: assign micButton and speechController.")
      return
    }

    this.micButton.onButtonPinched.add(() => {
      this.speechController.toggleListening()
    })
  }
}
