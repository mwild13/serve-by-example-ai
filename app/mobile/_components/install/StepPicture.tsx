import { ArrowRight, ChevronLeft, Ellipsis, EllipsisVertical, House, Menu, Share, SquarePlus } from "lucide-react";
import type { StepPic } from "@/lib/install-platform";

// One install step's picture (lib/install-platform.ts INSTALL_STEPS): the
// button or menu row to tap, drawn in CSS so it stays sharp and follows dark
// mode. The thing to tap is lit (.sm-pic-lit). Styles: .sm-pic in
// app/styles/staff.css.

const BAR_ICON = { dots: Ellipsis, share: Share, "menu-dots": EllipsisVertical, "menu-lines": Menu };
const ROW_ICON = { share: Share, add: SquarePlus, home: House };

export default function StepPicture({ pic, host }: { pic: StepPic; host: string }) {
  if (pic.kind === "bar") {
    const Icon = BAR_ICON[pic.button];
    return (
      <div className={`sm-pic sm-pic--${pic.at}`} aria-hidden="true">
        <div className="sm-pic-bar">
          <ChevronLeft size={20} strokeWidth={2.4} className="sm-pic-faint" />
          <span className="sm-pic-url">{host}</span>
          <span className="sm-pic-lit sm-pic-round">
            <Icon size={20} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    );
  }

  if (pic.kind === "menu") {
    const Icon = ROW_ICON[pic.icon];
    return (
      <div className="sm-pic sm-pic--center" aria-hidden="true">
        {pic.first && (
          <>
            <span className="sm-pic-chip">
              <Share size={18} strokeWidth={2.2} />
              {pic.first}
            </span>
            <ArrowRight size={20} strokeWidth={2.8} className="sm-pic-arrow" />
          </>
        )}
        <span className="sm-pic-chip sm-pic-lit">
          <Icon size={18} strokeWidth={2.2} />
          {pic.tap}
        </span>
      </div>
    );
  }

  return (
    <div className="sm-pic" aria-hidden="true">
      <div className="sm-pic-sheet">
        <div className="sm-pic-sheet-head">
          <span>Cancel</span>
          <strong>{pic.title}</strong>
          <span className="sm-pic-lit sm-pic-small">{pic.button}</span>
        </div>
        {pic.webAppSwitch && (
          <div className="sm-pic-sheet-row">
            <strong>Open as Web App</strong>
            <span className="sm-pic-switch" />
          </div>
        )}
      </div>
    </div>
  );
}
