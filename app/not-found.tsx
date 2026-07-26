import { Footer, GlobalMotion, Header } from "../components/HomeExperience";

export default function NotFound() {
  const homePath = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`;

  return <><GlobalMotion /><Header currentPath="/404" /><main className="final-cta page-enter" style={{ minHeight: "100vh", display: "grid", placeContent: "center" }}>
    <div className="cta-spark one">✦</div><div className="cta-spark two">✦</div>
    <p className="eyebrow">404 · Lost in nature</p><h2>This path returned<br /><em>to the wild.</em></h2>
    <a className="button button-dark pulse-button" href={homePath}>Return home ↑</a>
  </main><Footer /></>;
}
