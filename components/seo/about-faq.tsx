import { FAQ, ICON_COUNT, REPO_URL } from "@/lib/seo";

/**
 * Server-rendered, crawlable prose for the homepage. The lead paragraph is a
 * quotable "What is Iconimate?" definition (the kind of atomic statement AI
 * assistants lift), and the FAQ mirrors the FAQPage JSON-LD one-to-one so the
 * visible answers and the structured data can never disagree.
 */
export function AboutFaq() {
  return (
    <section id="about" className="dc-about" aria-labelledby="about-title">
      <div className="dc-about__lead">
        <h2 id="about-title" className="dc-about__title">
          What is Iconimate?
        </h2>
        <p className="dc-about__text">
          Iconimate is a free, open-source library of {ICON_COUNT} animated React icons built on the
          Phosphor 256 grid and tuned to read at 24px. Each icon ships as a self-contained component
          you install through the shadcn registry, and every glyph carries its own hand-tuned
          spring motion that plays on hover and keyboard focus. It is MIT licensed and free for
          personal and commercial use. The source is on{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </div>

      <div className="dc-faq">
        <h2 className="dc-about__title">Frequently asked questions</h2>
        <dl className="dc-faq__list">
          {FAQ.map((item) => (
            <div key={item.question} className="dc-faq__item">
              <dt className="dc-faq__q">{item.question}</dt>
              <dd className="dc-faq__a">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
