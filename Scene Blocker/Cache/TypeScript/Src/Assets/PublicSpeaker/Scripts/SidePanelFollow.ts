import {CameraService, CameraType} from "./CameraService"

@component
export class SidePanelFollow extends BaseScriptComponent {
  @input
  @hint("Distance in front of the user (cm)")
  forwardDistance: number = 70

  @input
  @hint("Horizontal side offset from user center (cm). Positive=right, Negative=left")
  sideOffset: number = 45

  @input
  @hint("Vertical offset relative to camera (cm)")
  verticalOffset: number = -20

  @input
  @hint("Position smoothing speed (higher = snappier)")
  positionLerpSpeed: number = 8

  @input
  @hint("Rotation smoothing speed (higher = snappier)")
  rotationLerpSpeed: number = 10

  @input
  @hint("If true, panel keeps upright and only yaws to face user")
  yawOnlyFacing: boolean = true

  private cameraService: CameraService

  onAwake() {
    this.cameraService = CameraService.getInstance()
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private onUpdate() {
    const cam = this.cameraService.getCamera(CameraType.Main)
    if (!cam) {
      return
    }

    const camTr = cam.getTransform()
    const camPos = camTr.getWorldPosition()

    const targetPos = camPos
      .add(camTr.forward.uniformScale(this.forwardDistance))
      .add(camTr.right.uniformScale(this.sideOffset))
      .add(camTr.up.uniformScale(this.verticalOffset))

    const panelTr = this.getSceneObject().getTransform()
    const currentPos = panelTr.getWorldPosition()
    const dt = Math.min(getDeltaTime(), 0.05)
    const posT = Math.max(0, Math.min(1, dt * this.positionLerpSpeed))
    const newPos = vec3.lerp(currentPos, targetPos, posT)
    panelTr.setWorldPosition(newPos)

    let targetRot: quat
    if (this.yawOnlyFacing) {
      const toCam = camPos.sub(newPos)
      const flatToCam = new vec3(toCam.x, 0, toCam.z)
      if (flatToCam.length > 0.0001) {
        targetRot = quat.lookAt(flatToCam.normalize(), vec3.up())
      } else {
        targetRot = panelTr.getWorldRotation()
      }
    } else {
      const toCam = camPos.sub(newPos)
      if (toCam.length > 0.0001) {
        targetRot = quat.lookAt(toCam.normalize(), vec3.up())
      } else {
        targetRot = panelTr.getWorldRotation()
      }
    }

    const currentRot = panelTr.getWorldRotation()
    const rotT = Math.max(0, Math.min(1, dt * this.rotationLerpSpeed))
    const newRot = quat.slerp(currentRot, targetRot, rotT)
    panelTr.setWorldRotation(newRot)
  }
}
