export interface MarkdownContext {
  yaw: number
  pitch: number
  roll: number
  face: number
  angleDeg: number
  elapsed: number
  ambient: number
  diffuse: number
  specular: number
  shininess: number
  width: number
  height: number
  fov: number
  near: number
  far: number
}

export type StepKey =
  | '0-ypr-to-rad'
  | '1-rotation-matrices'
  | '2-model-matrix'
  | '3-view-matrix'
  | '4-perspective'
  | '5-mvp-transform'
  | '6-normal-matrix'
  | '7-face-detection'
  | '8-lambert'
  | '9-blinn-phong'

export interface StepDef {
  title: string
  render: (ctx: MarkdownContext) => string
}

export type StepRegistry = Record<StepKey, StepDef>
