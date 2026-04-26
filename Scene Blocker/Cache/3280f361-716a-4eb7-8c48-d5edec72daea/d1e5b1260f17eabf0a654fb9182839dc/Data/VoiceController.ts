import NativeLogger from "SpectaclesInteractionKit.lspkg/Utils/NativeLogger"
import {GoogleSlideBridge} from "./GoogleSlideBridge"
import {PresentationSwitcher} from "./PresentationSwitcher"

const log = new NativeLogger("SpeechToText")

@component
export class SpeechToText extends BaseScriptComponent {
  @input
  @hint("Text component to display transcriptions")
  text: Text

  @input
  @hint("Reference to the PresentationSwitcher component")
  presentationSwitcher: PresentationSwitcher

  @input
  @hint("Reference to the GoogleSlideBridge component")
  googleSlideBridge: GoogleSlideBridge

  @input
  @hint("Delay time (in seconds) to wait before confirming a command")
  commandDelay: number = 2.0

  @input
  @hint("The button image component to swap icons")
  buttonImage: Image

  @input
  @hint("Texture for the normal mic icon (listening off)")
  normalMicImage: Texture

  @input
  @hint("Texture for the listening mic icon (listening on)")
  listeningMicImage: Texture

  @input
  @hint("Enable this boolean if you are planning to Use Google Slide API and the Google Slide Bridge")
  useGoogleSlide: boolean = false

  @input
  @hint("Start listening automatically when lens starts")
  autoStartListening: boolean = true

  private asr: AsrModule = require("LensStudio:AsrModule")
  private options = null
  private lastTranscription: string = ""
  private commandPending: boolean = false
  private commandTimer: number = 0
  private isListening: boolean = false
  // Trigger phrases keyed by 0-based slide index.
  private slideAdvancePhrases: {[key: number]: string[]} = {
    0: ["expecting you"],
    1: ["coming along"],
    2: ["the resources"],
    3: ["drag me down"],
    4: ["best of them"],
    5: ["see ya", "see you"]
  }

  onAwake() {
    // Bind the update event (for delay tracking)
    this.createEvent("UpdateEvent").bind(() => {
      this.update()
    })

    // Setup ASR options
    this.options = AsrModule.AsrTranscriptionOptions.create()
    this.options.mode = AsrModule.AsrMode.HighAccuracy
    this.options.silenceUntilTerminationMs = 1000

    this.options.onTranscriptionUpdateEvent.add((args) => {
      if (args.text.trim() === "") {
        return
      }
      log.d(`Transcription: ${args.text}`)

      this.text.text = args.text
      if (args.isFinal) {
        log.d(`Final Transcription: "${args.text}"`)
        if (this.isListening) {
          this.handleTranscription(args.text)
        } else {
          log.d("Listening is disabled - ignoring transcription")
        }
      }
    })

    this.options.onTranscriptionErrorEvent.add((errorCode) => {
      log.d(`ASR Error: ${errorCode}`)
      if (this.text) {
        this.text.text = `ASR Error: ${errorCode}`
      }
    })

    // Set the initial button icon to normal mic (listening off)
    if (this.buttonImage && this.normalMicImage) {
      this.buttonImage.mainMaterial.mainPass.baseTex = this.normalMicImage
    } else {
      log.d("Button image or normal mic image not assigned in inspector")
    }

    if (this.autoStartListening) {
      this.setListening(true)
    } else if (this.text) {
      this.text.text = "Mic Off"
    }
  }

  // Public method to toggle listening
  public toggleListening() {
    this.setListening(!this.isListening)
  }

  public setListening(shouldListen: boolean) {
    if (this.isListening === shouldListen) {
      return
    }

    this.isListening = shouldListen
    if (shouldListen) {
      log.d("Listening toggled ON")
      this.asr.startTranscribing(this.options)
      if (this.text) {
        this.text.text = "Listening..."
      }
      if (this.buttonImage && this.listeningMicImage) {
        this.buttonImage.mainMaterial.mainPass.baseTex = this.listeningMicImage
      }
    } else {
      log.d("Listening toggled OFF")
      this.asr.stopTranscribing()
      if (this.buttonImage && this.normalMicImage) {
        this.buttonImage.mainMaterial.mainPass.baseTex = this.normalMicImage
      }
      this.text.text = "" // Clear the text feedback when listening is disabled
      this.commandPending = false // Reset any pending commands
      this.lastTranscription = ""
    }
  }

  // Handle the transcription directly
  private handleTranscription(transcription: string) {
    // Normalize the transcription for comparison
    const normalizedText = transcription
      .trim()
      .toLowerCase()
      .replace(/[.,!?]/g, "")

    const currentSlideIndex = this.presentationSwitcher
      ? this.presentationSwitcher.getVisibleSlideIndex()
      : 0
    const triggerPhrases = this.slideAdvancePhrases[currentSlideIndex] || []

    let matchedPhrase = ""
    for (let i = 0; i < triggerPhrases.length; i++) {
      const phrase = triggerPhrases[i]
      if (normalizedText.includes(phrase)) {
        matchedPhrase = phrase
        break
      }
    }

    if (matchedPhrase !== "") {
      log.d(`Detected advance phrase "${matchedPhrase}" on slide ${currentSlideIndex + 1}`)
      this.lastTranscription = "next"
      this.commandPending = true
      this.commandTimer = 0
    } else {
      log.d(`Transcription "${transcription}" did not match slide ${currentSlideIndex + 1} trigger phrase(s)`)
      this.commandPending = false // Reset if the transcription doesn't match
    }
  }

  // Update method to handle the delay
  private update() {
    if (!this.commandPending) return

    this.commandTimer += getDeltaTime()
    log.d(`Command delay timer: ${this.commandTimer.toFixed(2)} seconds`)

    if (this.commandTimer >= this.commandDelay) {
      // Check if the text is still the same after the delay
      log.d(`Command "${this.lastTranscription}" confirmed after delay`)
      if (this.isListening) {
        // Only execute if listening is enabled
        if (this.lastTranscription === "next") {
          this.navigateToNext()
        } else if (this.lastTranscription === "previous") {
          this.navigateToPrevious()
        }
      } else {
        log.d("Listening is disabled - ignoring command execution")
      }
      this.commandPending = false
      this.lastTranscription = ""
    }
  }

  // Navigate to the next slide and synchronize across all platforms
  private navigateToNext() {
    // Update local presentation
    if (this.presentationSwitcher && !this.useGoogleSlide) {
      this.presentationSwitcher.next()
    }

    // Update Google Slides via direct API
    if (this.googleSlideBridge && this.useGoogleSlide) {
      this.googleSlideBridge.next()
    }

    log.d("Going to next slide")
  }

  // Navigate to the previous slide and synchronize across all platforms
  private navigateToPrevious() {
    // Update local presentation
    if (this.presentationSwitcher && !this.useGoogleSlide) {
      this.presentationSwitcher.previous()
    }

    // Update Google Slides via direct API
    if (this.googleSlideBridge && this.useGoogleSlide) {
      this.googleSlideBridge.previous()
    }

    log.d("Going to previous slide")
  }
}
