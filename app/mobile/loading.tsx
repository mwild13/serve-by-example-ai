// What shows while a /mobile screen loads: the shapes of a screen in the
// mobile style (a title, a hero card, rows), not the signed-in app's plain
// "Loading" text, so the wait reads as the screen arriving. Styles: .sm-skel
// in app/styles/staff.css.
export default function MobileLoading() {
  return (
    <div className="sm-screen" aria-busy="true" aria-label="Loading">
      <div className="sm-frame sm-loading">
        <div className="sm-skel sm-loading-kicker" />
        <div className="sm-skel sm-loading-title" />
        <div className="sm-skel sm-loading-hero" />
        <div className="sm-skel sm-loading-row" />
        <div className="sm-skel sm-loading-row" />
      </div>
    </div>
  );
}
