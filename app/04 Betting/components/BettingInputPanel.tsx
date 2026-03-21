"use client"

import type { BettingInput, TrendValue } from "@/types/betting"

type BettingInputPanelProps = {
  input: BettingInput
  inputSource: string
  onChange: (field: keyof BettingInput, value: number | TrendValue) => void
  onEvaluate: () => void
}

export function BettingInputPanel({ input, inputSource, onChange, onEvaluate }: BettingInputPanelProps) {
  return (
    <section className="workbench-panel py-3">
      <div className="section-toolbar">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="section-kicker">Betting Input</p>
            <span className="text-muted">Only score, confidence, trend, and cost</span>
          </div>
          <div className="section-meta">
            <span>Source {inputSource}</span>
          </div>
        </div>
        <button className="solid-button" type="button" onClick={onEvaluate}>
          Evaluate
        </button>
      </div>

      <div className="workbench-gutter min-h-0 overflow-y-auto">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="metric-card">
            <label className="field-label" htmlFor="betting-score">
              Score
            </label>
            <input
              id="betting-score"
              className="field-input"
              max={5}
              min={0}
              step={0.1}
              type="number"
              value={input.score}
              onChange={(event) => onChange("score", Number(event.target.value))}
            />
          </div>

          <div className="metric-card">
            <label className="field-label" htmlFor="betting-confidence">
              Confidence
            </label>
            <input
              id="betting-confidence"
              className="field-input"
              max={1}
              min={0}
              step={0.05}
              type="number"
              value={input.confidence}
              onChange={(event) => onChange("confidence", Number(event.target.value))}
            />
          </div>

          <div className="metric-card">
            <label className="field-label" htmlFor="betting-trend">
              Trend
            </label>
            <select
              id="betting-trend"
              className="field-input"
              value={input.trend}
              onChange={(event) => onChange("trend", event.target.value as TrendValue)}
            >
              <option value="up">up</option>
              <option value="flat">flat</option>
              <option value="down">down</option>
            </select>
          </div>

          <div className="metric-card">
            <label className="field-label" htmlFor="betting-cost">
              Cost
            </label>
            <input
              id="betting-cost"
              className="field-input"
              min={0}
              step={0.1}
              type="number"
              value={input.cost}
              onChange={(event) => onChange("cost", Number(event.target.value))}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
