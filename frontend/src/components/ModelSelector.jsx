import React, { useEffect } from "react";

const PROVIDER_MODELS = {
  openai: [
    "gpt-4o",
    "gpt-4.1",
  ],

  anthropic: [
    "claude-3-5-sonnet-20241022",
    "claude-3-opus-20240229",
  ],

  google: [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
  ],
};

export default function ModelSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
}) {
  useEffect(() => {
    const firstModel =
      PROVIDER_MODELS[provider][0];

    if (
      !PROVIDER_MODELS[provider].includes(
        model
      )
    ) {
      onModelChange(firstModel);
    }
  }, [provider]);

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
          Upstream Provider
        </label>

        <select
          value={provider}
          onChange={(e) =>
            onProviderChange(e.target.value)
          }
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="openai">
            OpenAI (GPT)
          </option>

          <option value="anthropic">
            Anthropic (Claude)
          </option>

          <option value="google">
            Google (Gemini)
          </option>
        </select>
      </div>

      {/* Models */}
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
          Foundation Model Core
        </label>

        <select
          value={model}
          onChange={(e) =>
            onModelChange(e.target.value)
          }
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          {PROVIDER_MODELS[
            provider
          ]?.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}