import { galleryCategories } from "../data/site";


export function GalleryCategories() {
  return <section className="gallery-categories section" aria-labelledby="gallery-categories-title">
    <div className="gallery-categories-heading">
      <div>
        <p className="eyebrow">Property gallery</p>
        <h2 id="gallery-categories-title">Explore by category.</h2>
      </div>
      <p>Every photograph below is shown once and placed in one clear category, so you can explore the resort without repeated images.</p>
    </div>

    <nav className="gallery-category-nav" aria-label="Gallery categories">
      {galleryCategories.map((category, index) => <a href={`#gallery-${category.id}`} key={category.id}>
        <span>{String(index + 1).padStart(2, "0")}</span>{category.title}
      </a>)}
    </nav>

    <div className="gallery-category-list">
      {galleryCategories.map((category, categoryIndex) => <section
        className="gallery-category-block reveal"
        id={`gallery-${category.id}`}
        aria-labelledby={`gallery-${category.id}-title`}
        key={category.id}
      >
        <header>
          <span>{String(categoryIndex + 1).padStart(2, "0")}</span>
          <div><p className="eyebrow">{category.eyebrow}</p><h3 id={`gallery-${category.id}-title`}>{category.title}</h3></div>
          <p>{category.description}</p>
        </header>

        <div className="gallery-category-grid">
          {category.images.map((photo, photoIndex) => <figure className="gallery-category-card" key={photo.image}>
            <span
              className="gallery-category-photo"
              style={{ backgroundImage: `linear-gradient(0deg,rgba(10,31,21,.68),transparent 55%),url("${photo.image}")` }}
              role="img"
              aria-label={`${photo.label}. ${photo.copy}`}
            />
            <figcaption><span>{String(photoIndex + 1).padStart(2, "0")}</span><strong>{photo.label}</strong><p>{photo.copy}</p></figcaption>
          </figure>)}
        </div>
      </section>)}
    </div>
  </section>;
}
