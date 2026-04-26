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
  pathWidth: number = 45

  @input
  @hint("Vertical offset to avoid z-fighting with the floor")
  floorYOffset: number = 8

  @input
  @hint("Keep path locked to the ground plane of the current target")
  lockPathToGroundPlane: boolean = true

  @input
  @hint("Animate path color pulse for better visibility")
  pulsePathColor: boolean = true

  @input
  @hint("Pulse speed (cycles per second)")
  pulseSpeed: number = 1.2

  @input
  @hint("Primary pulse color")
  pulseColorA: vec4 = new vec4(0.1, 0.9, 1.0, 1.0)

  @input
  @hint("Secondary pulse color")
  pulseColorB: vec4 = new vec4(1.0, 1.0, 0.2, 1.0)

  @input
  @hint("Enable debug logs for target/path updates")
  debugLogs: boolean = false

  @input
  @hint("How often (seconds) to print update logs")
  debugLogInterval: number = 1.0

  @input
  @hint("Spawn visible debug beacons at each waypoint")
  spawnDebugBeacons: boolean = false

  @input
  @allowUndefined
  @hint("Optional prefab used as waypoint debug beacon")
  debugBeaconPrefab: ObjectPrefab

  private waypoints: SceneObject[] = []
  private targetIndex: number = -1
  private lastDebugLogTime: number = -1000
  private debugBeaconInstances: SceneObject[] = []

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => this.onStart())
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private onStart() {
    this.collectWaypoints()
    this.spawnWaypointDebugBeacons()
    if (this.presentationSwitcher) {
      this.presentationSwitcher.addOnSlideChanged((index) => {
        this.setTargetForSlide(index)
      })
      this.setTargetForSlide(this.presentationSwitcher.getCurrentIndex())
    }
  }

  private onUpdate() {
    if (this.presentationSwitcher) {
      const visibleSlideIndex = this.presentationSwitcher.getVisibleSlideIndex()
      if (visibleSlideIndex !== this.targetIndex) {
        this.setTargetForSlide(visibleSlideIndex)
      }
    }

    if (this.playerReference && this.targetIndex >= 0) {
      this.refreshPathVisual()
    }

    this.updatePathPulse()
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

    if (this.debugLogs) {
      print("BlockingGuideController: Waypoints found = " + this.waypoints.length)
    }
  }

  private spawnWaypointDebugBeacons() {
    this.clearDebugBeacons()

    if (!this.spawnDebugBeacons || !this.debugBeaconPrefab) {
      return
    }

    for (let i = 0; i < this.waypoints.length; i++) {
      const waypoint = this.waypoints[i]
      const beacon = this.debugBeaconPrefab.instantiate(this.getSceneObject())
      const waypointPos = waypoint.getTransform().getWorldPosition().add(new vec3(0, this.floorYOffset, 0))

      beacon.getTransform().setWorldPosition(waypointPos)
      this.debugBeaconInstances.push(beacon)
    }

    if (this.debugLogs) {
      print("BlockingGuideController: Spawned debug beacons = " + this.debugBeaconInstances.length)
    }
  }

  private clearDebugBeacons() {
    for (let i = 0; i < this.debugBeaconInstances.length; i++) {
      const beacon = this.debugBeaconInstances[i]
      if (beacon) {
        beacon.destroy()
      }
    }
    this.debugBeaconInstances = []
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
      if (this.debugLogs) {
        print(
          "BlockingGuideController: Target set to " +
            this.waypoints[this.targetIndex].name +
            " at (" +
            markerPosition.x.toFixed(1) +
            ", " +
            markerPosition.y.toFixed(1) +
            ", " +
            markerPosition.z.toFixed(1) +
            ")"
        )
      }
    }

    this.refreshPathVisual()
  }

  private refreshPathVisual() {
    if (!this.pathVisual || this.targetIndex < 0 || this.targetIndex >= this.waypoints.length) {
      return
    }

    const targetPosRaw = this.waypoints[this.targetIndex]
      .getTransform()
      .getWorldPosition()
      .add(new vec3(0, this.floorYOffset, 0))

    const points: vec3[] = []
    const pathY = targetPosRaw.y

    if (this.playerReference) {
      const playerRawPos = this.playerReference.getTransform().getWorldPosition().add(new vec3(0, this.floorYOffset, 0))
      const playerPos = this.lockPathToGroundPlane
        ? new vec3(playerRawPos.x, pathY, playerRawPos.z)
        : playerRawPos
      points.push(playerPos)
    }

    const targetPos = this.lockPathToGroundPlane
      ? new vec3(targetPosRaw.x, pathY, targetPosRaw.z)
      : targetPosRaw
    points.push(targetPos)

    const mesh = BlockingPathBuilder.buildFromPoints(points, this.pathWidth)
    if (mesh) {
      this.pathVisual.mesh = mesh
      this.pathVisual.enabled = true
      this.debugPathState(points, true)
    } else {
      this.pathVisual.enabled = false
      this.debugPathState(points, false)
    }
  }

  private debugPathState(points: vec3[], hasMesh: boolean) {
    if (!this.debugLogs) {
      return
    }

    const now = getTime()
    if (now - this.lastDebugLogTime < this.debugLogInterval) {
      return
    }
    this.lastDebugLogTime = now

    let msg = "BlockingGuideController: mesh=" + (hasMesh ? "yes" : "no") + ", points=" + points.length
    for (let i = 0; i < points.length; i++) {
      msg +=
        " | p" +
        i +
        "=(" +
        points[i].x.toFixed(1) +
        "," +
        points[i].y.toFixed(1) +
        "," +
        points[i].z.toFixed(1) +
        ")"
    }
    print(msg)
  }

  private updatePathPulse() {
    if (!this.pulsePathColor || !this.pathVisual || !this.pathVisual.enabled) {
      return
    }

    const material = this.pathVisual.mainMaterial
    if (!material) {
      return
    }

    const pass: any = material.mainPass
    if (!pass) {
      return
    }

    const t = (Math.sin(getTime() * Math.PI * 2 * this.pulseSpeed) + 1) * 0.5
    const color = new vec4(
      this.lerp(this.pulseColorA.x, this.pulseColorB.x, t),
      this.lerp(this.pulseColorA.y, this.pulseColorB.y, t),
      this.lerp(this.pulseColorA.z, this.pulseColorB.z, t),
      this.lerp(this.pulseColorA.w, this.pulseColorB.w, t)
    )

    if (pass.baseColor !== undefined) {
      pass.baseColor = color
    }
    if (pass.color !== undefined) {
      pass.color = color
    }
    if (pass.opacity !== undefined) {
      pass.opacity = color.w
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
  }
}
