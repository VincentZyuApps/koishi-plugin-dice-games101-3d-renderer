import type { StepKey, StepDef, StepRegistry } from './types'

import * as step0 from './step0'
import * as step1 from './step1'
import * as step2 from './step2'
import * as step3 from './step3'
import * as step4 from './step4'
import * as step5 from './step5'
import * as step6 from './step6'
import * as step7 from './step7'
import * as step8 from './step8'
import * as step9 from './step9'

const modules = [step0, step1, step2, step3, step4, step5, step6, step7, step8, step9] as const

export const STEPS: StepRegistry = {} as StepRegistry
for (const m of modules) {
  STEPS[m.key] = { title: m.title, render: m.render }
}

export const STEP_KEYS = modules.map((m) => m.key) as StepKey[]

export function sortByDefinedOrder(keys: StepKey[]): StepKey[] {
  const order = new Map(STEP_KEYS.map((k, i) => [k, i]))
  return [...keys].sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999))
}
