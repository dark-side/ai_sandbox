# Token ROI Calculator + Cost Projection — Reference Solution (S6)

A one-time spreadsheet goes stale the moment pricing or ticket volume changes. This is a
reusable calculator: change the inputs (or the rates from the published pricing page) and
re-derive. **Do not hardcode dollar totals — derive them from the rate table below.**

## Inputs (current PayFlow baseline, 1 engineer)

| Input | Value |
|---|---|
| Requests / day | 300 |
| Task mix | 60% classify · 30% implement · 10% arch review |
| Avg input tokens / request | 3,000 (of which ~2,400 static) |
| Avg output tokens / request | 900 |
| Working days / month | 21 |
| Team size (target) | 8 engineers |

## Rate table (fill from https://www.anthropic.com/pricing — rates change)

| Model | $/1M input | $/1M output | Cache read | Batch |
|---|---|---|---|---|
| `claude-opus-4-6` (frontier) | `<rate>` | `<rate>` | 0.1× input | 0.5× |
| `claude-sonnet-4-6` (mid) | `<rate>` | `<rate>` | 0.1× input | 0.5× |
| `claude-haiku-4-5-20251001` (small) | `<rate>` | `<rate>` | 0.1× input | 0.5× |

## Formula

```
cost_per_request = (input_tokens  / 1e6) * input_rate(model)
                 + (output_tokens / 1e6) * output_rate(model)

# caching: static prefix billed at 0.1x on cache hits
cost_cached      = (static_tokens  / 1e6) * input_rate(model) * 0.10
                 + (dynamic_tokens / 1e6) * input_rate(model)
                 + (output_tokens  / 1e6) * output_rate(model)

# batching: multiply eligible-call cost by 0.5
cost_per_day     = sum_over_tasks(requests_task * cost_per_request_task)
cost_per_month   = cost_per_day * 21
team_cost        = cost_per_month * team_size
```

## Three scenarios (8 engineers)

| Scenario | Levers | Expected saving on affected calls | Where it applies |
|---|---|---|---|
| **Conservative** | Routing only | 60% of calls ~11× cheaper (frontier→small) | classification + commit + test-name tasks |
| **Moderate** | Routing + Batch API | + 50% on batched calls | commit-message + nightly report |
| **Aggressive** | Routing + Batch API + Prompt caching (S5) | + up to 90% on the ~2,400 static tokens/call | every call reusing the static prefix |

## Worked estimate (baseline $3,200/mo/engineer, all-frontier)

- **Conservative:** 60% of calls drop ~11× → blended monthly spend ≈ **$1,150/engineer**
  (~64% reduction). At 8 engineers: ~$9,200/mo vs $25,600 naive.
- **Moderate:** batching the non-blocking share removes another ~50% of those calls' cost
  → ≈ **$1,000/engineer**.
- **Aggressive:** caching the 2,400-token static prefix (80% of input) at 0.1× on repeat
  calls → ≈ **$720/engineer** (~77% reduction), ~$5,800/mo at 8 engineers.

> The manager picks the scenario; you implement it. Because the calculator reads live rates
> from the pricing page rather than baked-in totals, it stays accurate when Anthropic changes
> pricing — re-run it before every model or routing change.
