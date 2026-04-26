import {PresentationSwitcher} from "./PresentationSwitcher"
import {BlockingPathBuilder} from "./BlockingPathBuilder"

@component
export class BlockingGuideController extends BaseScriptComponent {
  @input
  @hint("Presentation switcher used for scene line progression")
  presentationSwitcher: PresentationSwitcher

  @input
  @hint("Parent containing waypoint children in blocking order")
  waypointRoot: SceneObject

  @input
  @hint("Render mesh visual that draws the floor track")
  pathVisual: RenderMeshVisual

  @input
  @allowUndefined
  @hint("Optional marker object that is moved to the current target waypoint")
  targetMarker: SceneObject

  @input
  @allowUndefined
  @hint("Optional player/camera reference for dynamic follow path start")
  playerReference: SceneObject

  @input
  @hint("Path width in centimeters")
  pathWidth: number = 18

  @input
  @hint("Vertical offset to avoid z-fighting with the floor")
  floorYOffset: number = 2

  private waypoints: SceneObject[] = []
  private targetIndex: number = -1

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => this.onStart())
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private onStart() {
    this.collectWaypoints()
    if (this.presentationSwitcher) {
      this.presentationSwitcher.addOnSlideChanged((index) => {
        this.setTargetForSlide(index)
      })
      this.setTargetForSlide(this.presentationSwitcher.getCurrentIndex())
    }
  }

  private onUpdate() {
    if (this.playerReference && this.targetIndex >= 0) {
      this.refreshPathVisual()
    }
  }

  private collectWaypoints() {
    this.waypoints = []
    if (!this.waypointRoot) {
      print("BlockingGuideController: waypointRoot is not assigned.")
      return
    }

    for (let i = 0; i < this.waypointRoot.getChildrenCount(); i++) {
      this.waypoints.push(this.waypointRoot.getChild(i))
    }
  }

  private setTargetForSlide(slideIndex: number) {
    if (this.waypoints.length === 0) {
      return
    }

    const clampedIndex = Math.min(Math.max(slideIndex, 0), this.waypoints.length - 1)
    this.targetIndex = clampedIndex

    if (this.targetMarker) {
      const markerPosition = this.waypoints[this.targetIndex]
        .getTransform()
        .getWorldPosition()
        .add(new vec3(0, this.floorYOffset, 0))
      this.targetMarker.getTransform().setWorldPosition(markerPosition)
    }

    this.refreshPathVisual()
  }

  private refreshPathVisual() {
    if (!this.pathVisual || this.targetIndex < 0 || this.targetIndex >= this.waypoints.length) {
      return
    }

    const targetPos = this.waypoints[this.targetIndex]
      .getTransform()
      .getWorldPosition()
      .add(new vec3(0, this.floorYOffset, 0))

    const points: vec3[] = []

    if (this.playerReference) {
      const playerPos = this.playerReference.getTransform().getWorldPosition().add(new vec3(0, this.floorYOffset, 0))
      points.push(playerPos)
    }

    points.push(targetPos)

    if (this.targetIndex + 1 < this.waypoints.length) {
      const nextPos = this.waypoints[this.targetIndex + 1]
        .getTransform()
        .getWorldPosition()
        .add(new vec3(0, this.floorYOffset, 0))
      points.push(nextPos)
    }

    const mesh = BlockingPathBuilder.buildFromPoints(points, this.pathWidth)
    if (mesh) {
      this.pathVisual.mesh = mesh
      this.pathVisual.enabled = true
    } else {
      this.pathVisual.enabled = false
    }
  }
}
