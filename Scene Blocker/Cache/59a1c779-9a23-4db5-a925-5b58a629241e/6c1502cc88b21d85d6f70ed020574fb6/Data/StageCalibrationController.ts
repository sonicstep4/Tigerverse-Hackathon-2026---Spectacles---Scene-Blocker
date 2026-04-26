import {PinchButton} from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton"

@component
export class StageCalibrationController extends BaseScriptComponent {
  @input
  @hint("Root object that contains your blocking waypoints/path visuals")
  stageRoot: SceneObject

  @input
  @hint("Camera or device-tracked object used for calibration reference")
  cameraObject: SceneObject

  @input
  @allowUndefined
  @hint("Optional pinch button that triggers recalibration")
  calibrateButton: PinchButton

  @input
  @hint("Auto-calibrate once on start")
  autoCalibrateOnStart: boolean = true

  @input
  @hint("Distance in front of user to place stage origin (cm)")
  forwardDistance: number = 160

  @input
  @hint("Horizontal offset from center (cm)")
  xOffset: number = 0

  @input
  @hint("Vertical offset from detected floor level (cm)")
  yOffset: number = 0

  @input
  @hint("If true, keep current stage Y instead of using floor projection")
  keepCurrentY: boolean = true

  @input
  @hint("If true, place stage using camera height + Y offset below")
  useCameraRelativeY: boolean = true

  @input
  @hint("When using camera-relative Y, stage is placed this much below camera (cm)")
  cameraRelativeYOffset: number = -120

  @input
  @hint("Enable debug logs in logger")
  debugLogs: boolean = true

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart() {
    if (this.calibrateButton) {
      this.calibrateButton.onButtonPinched.add(() => {
        this.calibrateNow()
      })
    }

    if (this.autoCalibrateOnStart) {
      this.calibrateNow()
    }
  }

  public calibrateNow() {
    if (!this.stageRoot || !this.cameraObject) {
      print("StageCalibrationController: stageRoot or cameraObject is not assigned.")
      return
    }

    const cameraTransform = this.cameraObject.getTransform()
    const cameraPos = cameraTransform.getWorldPosition()
    const cameraForward = cameraTransform.forward

    // Flatten forward so stage always sits on a floor plane in front of user.
    let flatForward = new vec3(cameraForward.x, 0, cameraForward.z)
    if (flatForward.length <= 0.0001) {
      flatForward = new vec3(0, 0, -1)
    } else {
      flatForward = flatForward.normalize()
    }

    const flatRight = new vec3(cameraTransform.right.x, 0, cameraTransform.right.z).normalize()

    const basePos = cameraPos.add(flatForward.uniformScale(this.forwardDistance))
    let targetY = 0
    if (this.keepCurrentY) {
      targetY = this.stageRoot.getTransform().getWorldPosition().y
    } else if (this.useCameraRelativeY) {
      targetY = cameraPos.y + this.cameraRelativeYOffset
    }

    const targetPos = new vec3(
      basePos.x + flatRight.x * this.xOffset,
      targetY + this.yOffset,
      basePos.z + flatRight.z * this.xOffset
    )

    // Rotate stage so its local forward points away from user direction of travel.
    const stageForward = flatForward
    const stageRotation = quat.lookAt(stageForward, vec3.up())

    const stageTransform = this.stageRoot.getTransform()
    stageTransform.setWorldPosition(targetPos)
    stageTransform.setWorldRotation(stageRotation)

    if (this.debugLogs) {
      print(
        "StageCalibrationController: Stage recalibrated at (" +
          targetPos.x.toFixed(1) +
          ", " +
          targetPos.y.toFixed(1) +
          ", " +
          targetPos.z.toFixed(1) +
          ")"
      )
    }
  }
}
