"use client";

import { Beef, Droplets, ShieldCheck } from "lucide-react";

/** Marketing preview of the in-app live farm overview card. */
export function LiveFarmOverview() {
  const bars = [42, 55, 48, 70, 62, 78, 68, 84, 76];

  return (
    <div className="live-farm-stage">
      <div className="live-farm-card">
        <div className="live-farm-card-top">
          <span className="live-farm-live">
            <i /> LIVE FARM OVERVIEW
          </span>
          <span className="live-farm-loc">NYAGATARE</span>
        </div>
        <div className="live-farm-metrics">
          <div>
            <small>Milk collected today</small>
            <strong>
              63.7 <i>L</i>
            </strong>
          </div>
          <div className="live-farm-temp">
            24°
            <small>Eastern Province</small>
          </div>
        </div>
        <div className="live-farm-bars" aria-hidden>
          {bars.map((height, i) => (
            <i key={i} style={{ height: `${height}%` }} className={i === bars.length - 1 ? "current" : undefined} />
          ))}
        </div>
        <div className="live-farm-foot">
          <span>
            <b>1 sick</b> animal isolated
          </span>
          <span className="due">Tick spray due today</span>
        </div>
      </div>

      <div className="live-farm-float top">
        <Droplets className="size-4 text-[#4b9261]" />
        <div>
          <strong>Record saved</strong>
          <span>Morning session</span>
        </div>
      </div>

      <div className="live-farm-float bottom">
        <div className="live-farm-float-icon">
          <Beef className="size-4" />
        </div>
        <div>
          <strong>7 active cows</strong>
          <span>Nyagatare Hills Dairy</span>
        </div>
        <ShieldCheck className="size-4 text-[#4c9b65]" />
      </div>
    </div>
  );
}
